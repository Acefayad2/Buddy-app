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
   * Start reconnection monitoring
   */
  private startReconnectionMonitoring(
    bluetoothDeviceId: string,
    deviceName: string
  ): void {
    const interval = setInterval(async () => {
      const connection = this.connections.get(bluetoothDeviceId)
      if (!connection) {
        clearInterval(interval)
        this.reconnectIntervals.delete(bluetoothDeviceId)
        return
      }

      // Check if still connected
      if (!connection.server?.connected) {
        console.log(`Device ${bluetoothDeviceId} disconnected, attempting reconnect...`)
        try {
          // Attempt to reconnect
          const server = await connection.device.gatt?.connect()
          if (server) {
            connection.server = server
            connection.connected = true
            connection.lastSeen = new Date()
            console.log(`Device ${bluetoothDeviceId} reconnected`)
          }
        } catch (error) {
          console.error(`Failed to reconnect to ${bluetoothDeviceId}:`, error)
        }
      } else {
        // Update last seen
        connection.lastSeen = new Date()
      }
    }, 10000) // Check every 10 seconds

    this.reconnectIntervals.set(bluetoothDeviceId, interval)
  }

  /**
   * Handle device disconnect
   */
  private handleDisconnect(bluetoothDeviceId: string): void {
    const connection = this.connections.get(bluetoothDeviceId)
    if (connection) {
      connection.connected = false
      connection.server = null
      console.log(`Device ${bluetoothDeviceId} disconnected`)
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
