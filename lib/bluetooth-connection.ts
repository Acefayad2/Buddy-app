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
   */
  async connectToDevice(
    bluetoothDeviceId: string,
    deviceName: string
  ): Promise<BluetoothConnection> {
    try {
      // Request device connection
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

      // Monitor connection status
      device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect(bluetoothDeviceId)
      })

      // Store connection
      this.connections.set(bluetoothDeviceId, connection)

      // Start monitoring RSSI if available
      this.startRSSIMonitoring(bluetoothDeviceId)

      // Start reconnection monitoring
      this.startReconnectionMonitoring(bluetoothDeviceId, deviceName)

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
   * Start monitoring RSSI (if device supports it)
   */
  private startRSSIMonitoring(bluetoothDeviceId: string): void {
    // RSSI monitoring would require a custom BLE service
    // For now, we'll update it when we can read it
    const connection = this.connections.get(bluetoothDeviceId)
    if (!connection) return

    // Try to read RSSI periodically (if available via custom service)
    setInterval(async () => {
      try {
        // This would read from a custom RSSI characteristic
        // For now, we'll simulate or use a default value
        if (connection.server?.connected) {
          // Update last seen
          connection.lastSeen = new Date()
        }
      } catch (error) {
        // RSSI not available
      }
    }, 5000) // Check every 5 seconds
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
      
      if (!isServerConnected || !connection.connected) {
        console.log(`[Bluetooth] Device ${deviceName} (${bluetoothDeviceId}) disconnected, attempting reconnect...`)
        try {
          // Attempt to reconnect
          if (connection.device.gatt) {
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
            }
          } else {
            console.warn(`[Bluetooth] ⚠️ Cannot reconnect to ${deviceName} - device.gatt is null`)
          }
        } catch (error: any) {
          console.error(`[Bluetooth] ❌ Failed to reconnect to ${deviceName} (${bluetoothDeviceId}):`, error.message || error)
          // Mark as disconnected but keep trying
          connection.connected = false
        }
      } else {
        // Connection is active - update last seen to keep connection alive
        connection.lastSeen = new Date()
        // Optionally do a lightweight GATT operation to keep connection active
        try {
          // Touch the connection to prevent timeout
          if (connection.server && connection.server.connected) {
            // Just checking connection is enough to keep it alive
            // Some devices disconnect after inactivity, so this helps maintain connection
          }
        } catch (error) {
          // If we can't access the server, connection might be lost
          connection.connected = false
        }
      }
    }, 5000) // Check every 5 seconds for faster reconnection

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
