/**
 * Bluetooth scanning service for React Native
 * Handles BLE scanning, device discovery, and RSSI monitoring
 */

import { BleManager, Device, State } from 'react-native-ble-plx'
import type { BluetoothDevice } from '../../../shared/types'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

const BACKGROUND_SCAN_TASK = 'background-bluetooth-scan'

class BluetoothService {
  private manager: BleManager
  private isScanning: boolean = false
  private discoveredDevices: Map<string, BluetoothDevice> = new Map()
  private scanCallbacks: Set<(devices: BluetoothDevice[]) => void> = new Set()

  constructor() {
    this.manager = new BleManager()
    this.setupStateListener()
  }

  private setupStateListener() {
    this.manager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        console.log('Bluetooth is powered on')
      } else {
        console.log('Bluetooth state:', state)
      }
    })
  }

  /**
   * Start scanning for BLE devices
   */
  async startScanning(
    onDeviceFound: (device: BluetoothDevice) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.isScanning) {
      console.log('Already scanning')
      return
    }

    try {
      const state = await this.manager.state()
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on')
      }

      this.isScanning = true
      this.discoveredDevices.clear()

      this.manager.startDeviceScan(
        null, // Scan all devices
        { allowDuplicates: true },
        (error, device) => {
          if (error) {
            this.isScanning = false
            onError?.(error)
            return
          }

          if (device && device.name) {
            const bluetoothDevice: BluetoothDevice = {
              id: device.id,
              name: device.name || 'Unknown Device',
              rssi: device.rssi || -100,
              advertisementData: device.serviceData,
            }

            // Update or add device
            this.discoveredDevices.set(device.id, bluetoothDevice)
            onDeviceFound(bluetoothDevice)

            // Notify all callbacks
            this.scanCallbacks.forEach((callback) => {
              callback(Array.from(this.discoveredDevices.values()))
            })
          }
        }
      )
    } catch (error) {
      this.isScanning = false
      throw error
    }
  }

  /**
   * Stop scanning for devices
   */
  stopScanning(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan()
      this.isScanning = false
    }
  }

  /**
   * Get all discovered devices
   */
  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values())
  }

  /**
   * Subscribe to device updates
   */
  onDevicesUpdate(callback: (devices: BluetoothDevice[]) => void): () => void {
    this.scanCallbacks.add(callback)
    return () => {
      this.scanCallbacks.delete(callback)
    }
  }

  /**
   * Connect to a device and get RSSI
   */
  async connectAndGetRSSI(deviceId: string): Promise<number> {
    try {
      const device = await this.manager.connectToDevice(deviceId)
      await device.discoverAllServicesAndCharacteristics()
      
      // Read RSSI
      const rssi = await device.readRSSI()
      await device.cancelConnection()
      
      return rssi
    } catch (error) {
      console.error('Error connecting to device:', error)
      throw error
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopScanning()
    this.manager.destroy()
  }
}

// Register background task for iOS
TaskManager.defineTask(BACKGROUND_SCAN_TASK, async () => {
  try {
    // Background scanning logic here
    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export const bluetoothService = new BluetoothService()


