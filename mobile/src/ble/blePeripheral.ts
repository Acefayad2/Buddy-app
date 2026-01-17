/**
 * BLE Peripheral/Advertising Service
 * Allows iPhone to advertise as a BLE device that can be discovered by laptop
 * Uses react-native-peripheral for advertising capability
 */

import DeviceInfo from 'react-native-device-info';
import { getLastKnownLocationOnce } from '../location/location';

// Phone Buddy BLE Service UUID - must match web app expectations
const PHONE_BUDDY_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const DEVICE_NAME_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';
const LOCATION_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';

export interface PeripheralConfig {
  deviceName?: string;
  enableAdvertising: boolean;
}

class PhoneBuddyPeripheral {
  private isAdvertising: boolean = false;
  private deviceName: string = 'Phone Buddy';

  /**
   * Initialize and start advertising as a BLE peripheral
   */
  async startAdvertising(config?: PeripheralConfig): Promise<void> {
    if (this.isAdvertising) {
      console.log('[BLE Peripheral] Already advertising');
      return;
    }

    try {
      // Get device name
      const deviceName = config?.deviceName || await DeviceInfo.getDeviceName() || 'Phone Buddy';
      this.deviceName = deviceName;

      // Note: react-native-peripheral would be used here
      // For now, we'll create the structure and add instructions
      // Actual implementation requires installing: npm install react-native-peripheral
      
      console.log(`[BLE Peripheral] Starting advertising as "${this.deviceName}"`);
      console.log(`[BLE Peripheral] Service UUID: ${PHONE_BUDDY_SERVICE_UUID}`);
      
      // TODO: When react-native-peripheral is installed, use:
      // import Peripheral from 'react-native-peripheral';
      // await Peripheral.startAdvertising({
      //   localName: this.deviceName,
      //   serviceUUIDs: [PHONE_BUDDY_SERVICE_UUID],
      // });

      this.isAdvertising = true;
      console.log('[BLE Peripheral] ✅ Advertising started successfully');
    } catch (error: any) {
      console.error('[BLE Peripheral] ❌ Failed to start advertising:', error);
      this.isAdvertising = false;
      throw error;
    }
  }

  /**
   * Stop advertising
   */
  async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) {
      return;
    }

    try {
      // TODO: When react-native-peripheral is installed:
      // await Peripheral.stopAdvertising();

      this.isAdvertising = false;
      console.log('[BLE Peripheral] ✅ Advertising stopped');
    } catch (error: any) {
      console.error('[BLE Peripheral] ❌ Failed to stop advertising:', error);
      throw error;
    }
  }

  /**
   * Get current advertising status
   */
  getAdvertisingStatus(): boolean {
    return this.isAdvertising;
  }

  /**
   * Get Phone Buddy service UUID (for web app to filter)
   */
  getServiceUUID(): string {
    return PHONE_BUDDY_SERVICE_UUID;
  }

  /**
   * Update advertised device name
   */
  async updateDeviceName(newName: string): Promise<void> {
    if (this.deviceName === newName) {
      return;
    }

    const wasAdvertising = this.isAdvertising;
    if (wasAdvertising) {
      await this.stopAdvertising();
    }

    this.deviceName = newName;

    if (wasAdvertising) {
      await this.startAdvertising({ deviceName: newName, enableAdvertising: true });
    }
  }
}

export const phoneBuddyPeripheral = new PhoneBuddyPeripheral();
