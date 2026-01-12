import { BleManager, Device, State, Subscription } from "react-native-ble-plx";
import { getLastKnownLocationOnce } from "../location/location";

type FoundDevice = Pick<Device, "id" | "name" | "localName" | "rssi">;

class PhoneBuddyBle {
  private manager = new BleManager();
  private scanStopTimer?: ReturnType<typeof setTimeout>;
  private stateSub?: Subscription;
  private disconnectSub?: Subscription;

  async waitForPoweredOn(timeoutMs = 8000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const state = await this.manager.state();
      if (state === State.PoweredOn) return true;
      await new Promise((r) => setTimeout(r, 400));
    }
    return false;
  }

  startScan(onDevice: (d: FoundDevice) => void, scanMs = 6000) {
    this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.log("BLE scan error:", error);
        return;
      }
      if (!device) return;

      onDevice({
        id: device.id,
        name: device.name ?? null,
        localName: device.localName ?? null,
        rssi: device.rssi ?? null,
      });
    });

    if (this.scanStopTimer) clearTimeout(this.scanStopTimer);
    this.scanStopTimer = setTimeout(() => this.stopScan(), scanMs);
  }

  stopScan() {
    try {
      this.manager.stopDeviceScan();
    } catch {}
  }

  async connect(deviceId: string): Promise<Device> {
    this.stopScan();
    const device = await this.manager.connectToDevice(deviceId, { timeout: 10000 });
    await device.discoverAllServicesAndCharacteristics();
    return device;
  }

  monitorDisconnect(
    deviceId: string,
    onDisconnected: (payload: {
      deviceId: string;
      when: number;
      location: Awaited<ReturnType<typeof getLastKnownLocationOnce>>;
      reason: string;
    }) => void
  ) {
    // Remove previous subscription if any
    this.disconnectSub?.remove();

    // BLE-PLX provides onDisconnected callback via device.onDisconnected
    this.manager
      .devices([deviceId])
      .then(async ([d]) => {
        if (!d) throw new Error("Device not found for monitoring");
        this.disconnectSub = d.onDisconnected(async (error, disconnectedDevice) => {
          const location = await getLastKnownLocationOnce();
          onDisconnected({
            deviceId: disconnectedDevice?.id ?? deviceId,
            when: Date.now(),
            location,
            reason: error?.message ?? "disconnected",
          });
        });
      })
      .catch((e) => console.log("monitorDisconnect error:", e));
  }

  destroy() {
    this.disconnectSub?.remove();
    this.stateSub?.remove();
    this.stopScan();
    this.manager.destroy();
  }
}

export const phoneBuddyBle = new PhoneBuddyBle();

// Legacy exports for compatibility
export type BLEDevice = FoundDevice;
export const bleManager = phoneBuddyBle;
