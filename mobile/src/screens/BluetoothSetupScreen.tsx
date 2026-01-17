import React, { useMemo, useState } from "react";
import { View, Text, Button, FlatList, Pressable, Alert, Switch } from "react-native";
import { requestBluetoothPermission, goToSettings } from "../permissions/bluetooth";
import { phoneBuddyBle } from "../ble/bleManager";
import { phoneBuddyPeripheral } from "../ble/blePeripheral";

type Row = {
  id: string;
  name: string;
  rssi: number | null;
};

export default function BluetoothSetupScreen() {
  const [status, setStatus] = useState<string>("Idle");
  const [devices, setDevices] = useState<Map<string, Row>>(new Map());
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);
  const list = useMemo(() => Array.from(devices.values()), [devices]);

  const addDevice = (d: { id: string; name: string | null; localName: string | null; rssi: number | null }) => {
    const label = d.name ?? d.localName ?? "Unnamed device";
    setDevices((prev) => {
      const next = new Map(prev);
      next.set(d.id, { id: d.id, name: label, rssi: d.rssi ?? null });
      return next;
    });
  };

  const onEnableAndScan = async () => {
    setStatus("Requesting permissions...");
    const res = await requestBluetoothPermission();

    if (!res.granted) {
      setStatus("Permission not granted.");
      if (res.canOpenSettings) {
        Alert.alert("Bluetooth Permission", res.reason ?? "Blocked", [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: goToSettings },
        ]);
      } else {
        Alert.alert("Bluetooth Permission", res.reason ?? "Not granted");
      }
      return;
    }

    setStatus("Turning on Bluetooth (if needed)...");
    const powered = await phoneBuddyBle.waitForPoweredOn();
    if (!powered) {
      setStatus("Bluetooth not powered on.");
      Alert.alert("Bluetooth", "Please turn on Bluetooth and try again.");
      return;
    }

    setDevices(new Map());
    setStatus("Scanning...");
    phoneBuddyBle.startScan(addDevice, 7000);
    setTimeout(() => setStatus("Scan finished (select a device)."), 7500);
  };

  const connectTo = async (deviceId: string) => {
    try {
      setStatus("Connecting...");
      const device = await phoneBuddyBle.connect(deviceId);
      setStatus(`Connected to ${device.name ?? deviceId}. Monitoring disconnect...`);

      phoneBuddyBle.monitorDisconnect(device.id, async (payload) => {
        const loc = payload.location;
        const locText = loc ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} (±${loc.accuracy ?? "?"}m)` : "No location";
        Alert.alert(
          "Disconnected",
          `Device: ${payload.deviceId}\nTime: ${new Date(payload.when).toLocaleString()}\nLocation: ${locText}\nReason: ${payload.reason}`
        );
        setStatus("Disconnected (event logged locally).");
      });
    } catch (e: any) {
      setStatus("Connect failed.");
      Alert.alert("Connect failed", e?.message ?? "Unknown error");
    }
  };

  const toggleAdvertising = async (enabled: boolean) => {
    try {
      if (enabled) {
        setStatus("Starting advertising...");
        await phoneBuddyPeripheral.startAdvertising({ enableAdvertising: true });
        setIsAdvertising(true);
        setStatus(`Advertising as "${phoneBuddyPeripheral.getServiceUUID()}" - laptop can now discover this device`);
      } else {
        setStatus("Stopping advertising...");
        await phoneBuddyPeripheral.stopAdvertising();
        setIsAdvertising(false);
        setStatus("Advertising stopped");
      }
    } catch (e: any) {
      setStatus("Advertising failed.");
      Alert.alert("Advertising failed", e?.message ?? "Unknown error. Make sure react-native-peripheral is installed.");
      setIsAdvertising(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Phone Buddy BLE Test</Text>
      <Text>Status: {status}</Text>

      {/* Advertising Toggle for iPhone-to-Laptop */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderWidth: 1, borderRadius: 8, backgroundColor: "#f0f0f0" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Advertise as Peripheral</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            {isAdvertising 
              ? "Laptop can discover this iPhone via Web Bluetooth"
              : "Enable to allow laptop to discover this device"}
          </Text>
        </View>
        <Switch value={isAdvertising} onValueChange={toggleAdvertising} />
      </View>

      <Button title="Enable Bluetooth & Scan" onPress={onEnableAndScan} />

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => connectTo(item.id)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>
            <Text>ID: {item.id}</Text>
            <Text>RSSI: {item.rssi ?? "?"}</Text>
            <Text style={{ marginTop: 6, opacity: 0.8 }}>Tap to connect & monitor</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
