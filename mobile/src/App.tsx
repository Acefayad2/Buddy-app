/**
 * Main App component for React Native
 * Entry point for mobile app
 */

import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet } from 'react-native'
import BluetoothSetupScreen from './screens/BluetoothSetupScreen'
import { phoneBuddyBle } from './ble/bleManager'

export default function App() {
  useEffect(() => {
    // Cleanup BLE manager on unmount
    return () => {
      phoneBuddyBle.destroy()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <BluetoothSetupScreen />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})


