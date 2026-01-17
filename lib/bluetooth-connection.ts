/**
 * Bluetooth connection service for maintaining persistent connections to paired devices
 * Uses Web Bluetooth API to connect to BLE devices and monitor their status
 */

export interface BluetoothConnection {
  deviceId: string
  device: BluetoothDevice
  server: BluetoothRemoteGATTServer | null
  connected: boolean
  rssi: number | null
  lastSeen: Date
}

class BluetoothConnectionManager {
  private connections: Map<string, BluetoothConnection> = new Map()
  private reconnectIntervals: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Connect to a Bluetooth device and maintain connection
   * 
   * NOTE: Web Bluetooth has limitations:
   * - Cannot reconnect to previously paired devices without user selecting from picker
   * - Cannot connect to iPhones/iOS devices as peripherals (they don't advertise BLE services)
   * - Works best with dedicated BLE peripherals (watches, earbuds, trackers, etc.)
   */
  async connectToDevice(
    bluetoothDeviceId: string,
    deviceName: string
  ): Promise<BluetoothConnection> {
    try {
      // Check if device name suggests it's an iPhone/iOS device
      // Note: This is a limitation of Web Bluetooth - iOS devices can't be connected to as peripherals
      const isIOSDevice = /iPhone|iPad|iPod/i.test(deviceName)
      if (isIOSDevice) {
        console.warn(`[Bluetooth] ⚠️ Attempting to connect to iOS device "${deviceName}" - this may not work due to Web Bluetooth limitations`)
      }

      // Request device connection - this will open Chrome's device picker
      // IMPORTANT: For reconnection, user must select the device again from the picker
      // The device must be powered on, in range, and advertising BLE services
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [
          'battery_service',
          'device_information',
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
        ],
      })

      if (!device.gatt) {
        throw new Error('Device does not support GATT')
      }

      // Connect to GATT server
      // This is where the actual Bluetooth connection happens
      const server = await device.gatt.connect()

      // Verify connection is actually established
      if (!server || !server.connected) {
        throw new Error('Failed to establish Bluetooth connection')
      }

      const connection: BluetoothConnection = {
        deviceId: bluetoothDeviceId,
        device: device,
        server: server,
        connected: true, // Only set to true if we verified server.connected
        rssi: null,
        lastSeen: new Date(),
      }

      // Monitor connection status - set up disconnect listener BEFORE storing connection
      const disconnectHandler = () => {
        console.log(`[Bluetooth] Disconnect event fired for ${deviceName} (${bluetoothDeviceId})`)
        this.handleDisconnect(bluetoothDeviceId)
      }
      device.addEventListener('gattserverdisconnected', disconnectHandler)

      // Store connection
      this.connections.set(bluetoothDeviceId, connection)

      // Start monitoring RSSI and keep-alive immediately
      this.startRSSIMonitoring(bluetoothDeviceId)

      // Start aggressive reconnection monitoring
      this.startReconnectionMonitoring(bluetoothDeviceId, deviceName)
      
      console.log(`[Bluetooth] ✅ Connection established and monitoring started for ${deviceName} (${bluetoothDeviceId})`)

      return connection
    } catch (error: any) {
      console.error(`Failed to connect to device ${bluetoothDeviceId}:`, error)
      throw error
    }
  }

  /**
   * Disconnect from a device
   */
  async disconnectDevice(bluetoothDeviceId: string): Promise<void> {
    const connection = this.connections.get(bluetoothDeviceId)
    if (connection && connection.server) {
      try {
        if (connection.server.connected) {
          connection.device.gatt?.disconnect()
        }
      } catch (error) {
        console.error(`Error disconnecting device ${bluetoothDeviceId}:`, error)
      }
    }

    // Clear reconnection monitoring
    const interval = this.reconnectIntervals.get(bluetoothDeviceId)
    if (interval) {
      clearInterval(interval)
      this.reconnectIntervals.delete(bluetoothDeviceId)
    }

    this.connections.delete(bluetoothDeviceId)
  }

  /**
   * Get connection status for a device
   */
  getConnection(bluetoothDeviceId: string): BluetoothConnection | null {
    return this.connections.get(bluetoothDeviceId) || null
  }

  /**
   * Check if device is connected - verifies actual connection status
   */
  isConnected(bluetoothDeviceId: string): boolean {
    const connection = this.connections.get(bluetoothDeviceId)
    if (!connection) return false
    
    // Verify connection is actually established
    // Check both our internal status and the actual server connection
    return connection.connected && connection.server?.connected === true
  }

  /**
   * Get RSSI for a connected device
   */
  async getRSSI(bluetoothDeviceId: string): Promise<number | null> {
    const connection = this.connections.get(bluetoothDeviceId)
    if (!connection || !connection.server?.connected) {
      return null
    }

    try {
      // Note: Web Bluetooth API doesn't directly expose RSSI
      // This would need to be implemented via a custom BLE characteristic
      // or through the mobile app
      return connection.rssi
    } catch (error) {
      console.error(`Error getting RSSI for ${bluetoothDeviceId}:`, error)
      return null
    }
  }

  /**
   * Start monitoring RSSI and keep connection alive
   */
  private startRSSIMonitoring(bluetoothDeviceId: string): void {
    // RSSI monitoring would require a custom BLE service
    // For now, we'll use this to keep the connection alive
    const connection = this.connections.get(bluetoothDeviceId)
    if (!connection) return

    // Keep connection alive by periodically accessing the server
    const keepAliveInterval = setInterval(async () => {
      try {
        if (connection.server?.connected) {
          // Access the server to keep connection alive
          // Try to get primary service to verify connection is still active
          // This prevents the connection from timing out
          try {
            await connection.server.getPrimaryService('battery_service').catch(() => {
              // Battery service might not be available - that's OK
              // Just accessing the server is enough to keep it alive
            })
          } catch (e) {
            // Service not available - connection might still be active
          }
          
          // Update last seen
          connection.lastSeen = new Date()
          connection.connected = true
        } else {
          // Connection lost - clear interval, reconnection monitoring will handle reconnect
          clearInterval(keepAliveInterval)
        }
      } catch (error) {
        // Connection might be lost
        connection.connected = false
        clearInterval(keepAliveInterval)
      }
    }, 3000) // Check every 3 seconds to keep connection alive
  }

  /**
   * Start reconnection monitoring - actively maintains connection
   */
  private startReconnectionMonitoring(
    bluetoothDeviceId: string,
    deviceName: string
  ): void {
    // Clear any existing interval for this device
    const existingInterval = this.reconnectIntervals.get(bluetoothDeviceId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    const interval = setInterval(async () => {
      const connection = this.connections.get(bluetoothDeviceId)
      if (!connection) {
        clearInterval(interval)
        this.reconnectIntervals.delete(bluetoothDeviceId)
        return
      }

      // Check if still connected - verify both our status and server status
      const isServerConnected = connection.server?.connected === true
      const isConnected = connection.connected === true
      
      // More aggressive connection check - reconnect if either flag is false
      if (!isServerConnected || !isConnected) {
        console.log(`[Bluetooth] Device ${deviceName} (${bluetoothDeviceId}) disconnected, attempting reconnect...`)
        try {
          // Attempt to reconnect
          if (connection.device.gatt) {
            // Ensure we have a clean reconnect
            if (connection.server && !connection.server.connected) {
              // Server exists but not connected - try to reconnect
              const server = await connection.device.gatt.connect()
              if (server && server.connected) {
                connection.server = server
                connection.connected = true
                connection.lastSeen = new Date()
                console.log(`[Bluetooth] ✅ Device ${deviceName} (${bluetoothDeviceId}) reconnected successfully`)
                
                // Re-add disconnect listener
                connection.device.addEventListener('gattserverdisconnected', () => {
                  this.handleDisconnect(bluetoothDeviceId)
                })
              } else {
                console.warn(`[Bluetooth] ⚠️ Reconnect attempt for ${deviceName} returned server but server.connected is false`)
                connection.connected = false
              }
            } else {
              // No server or server is null - try fresh connection
              const server = await connection.device.gatt.connect()
              if (server && server.connected) {
                connection.server = server
                connection.connected = true
                connection.lastSeen = new Date()
                console.log(`[Bluetooth] ✅ Device ${deviceName} (${bluetoothDeviceId}) connected successfully`)
                
                // Re-add disconnect listener
                connection.device.addEventListener('gattserverdisconnected', () => {
                  this.handleDisconnect(bluetoothDeviceId)
                })
              } else {
                connection.connected = false
              }
            }
          } else {
            console.warn(`[Bluetooth] ⚠️ Cannot reconnect to ${deviceName} - device.gatt is null`)
            connection.connected = false
          }
        } catch (error: any) {
          console.error(`[Bluetooth] ❌ Failed to reconnect to ${deviceName} (${bluetoothDeviceId}):`, error.message || error)
          // Mark as disconnected but keep trying
          connection.connected = false
        }
      } else {
        // Connection is active - verify it's still working and update last seen
        connection.lastSeen = new Date()
        connection.connected = true
        
        // Do a lightweight check to ensure connection is actually alive
        // Accessing the server periodically keeps the connection active
        try {
          if (connection.server && connection.server.connected) {
            // Try to access a service to keep connection alive
            // This prevents the connection from timing out due to inactivity
            await connection.server.getPrimaryService('battery_service').catch(() => {
              // Battery service might not exist - that's OK
              // Just accessing the server keeps it alive
            })
          }
        } catch (error) {
          // Connection might be lost
          console.warn(`[Bluetooth] Connection verification failed for ${deviceName}, marking as disconnected`)
          connection.connected = false
          connection.server = null
        }
      }
    }, 3000) // Check every 3 seconds for faster detection and reconnection

    this.reconnectIntervals.set(bluetoothDeviceId, interval)
  }

  /**
   * Handle device disconnect - immediately attempt reconnection
   */
  private handleDisconnect(bluetoothDeviceId: string): void {
    const connection = this.connections.get(bluetoothDeviceId)
    if (connection) {
      connection.connected = false
      connection.server = null
      console.log(`[Bluetooth] Device ${bluetoothDeviceId} disconnected - will attempt reconnect`)
      
      // The reconnection monitoring will handle reconnecting automatically
      // This just marks it as disconnected
    }
  }

  /**
   * Get all active connections
   */
  getAllConnections(): BluetoothConnection[] {
    return Array.from(this.connections.values())
  }

  /**
   * Cleanup all connections
   */
  async disconnectAll(): Promise<void> {
    const deviceIds = Array.from(this.connections.keys())
    await Promise.all(deviceIds.map((id) => this.disconnectDevice(id)))
  }
}

// Singleton instance
export const bluetoothConnectionManager = new BluetoothConnectionManager()

/**
 * Connect to a paired Bluetooth device
 */
export async function connectToPairedDevice(
  bluetoothDeviceId: string,
  deviceName: string
): Promise<BluetoothConnection> {
  return bluetoothConnectionManager.connectToDevice(bluetoothDeviceId, deviceName)
}

/**
 * Disconnect from a device
 */
export async function disconnectFromDevice(
  bluetoothDeviceId: string
): Promise<void> {
  return bluetoothConnectionManager.disconnectDevice(bluetoothDeviceId)
}

/**
 * Check if device is connected
 */
export function isDeviceConnected(bluetoothDeviceId: string): boolean {
  return bluetoothConnectionManager.isConnected(bluetoothDeviceId)
}

/**
 * Get device connection status
 */
export function getDeviceConnection(
  bluetoothDeviceId: string
): BluetoothConnection | null {
  return bluetoothConnectionManager.getConnection(bluetoothDeviceId)
}
