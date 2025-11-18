/**
 * Main App component for React Native
 * Entry point for mobile app
 */

import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from './hooks/useAuth'
import { useDevices } from './hooks/useDevices'
import { bluetoothService } from './services/bluetooth'
import { proximityService } from './services/proximity'
import { syncService } from './services/sync'

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { devices, loading: devicesLoading, registerDevice } = useDevices()

  useEffect(() => {
    // Initialize sync service
    syncService.initialize()

    // Cleanup on unmount
    return () => {
      bluetoothService.destroy()
      proximityService.stopMonitoring()
      syncService.destroy()
    }
  }, [])

  useEffect(() => {
    if (user && devices.length > 0) {
      // Start proximity monitoring when user has devices
      proximityService.startMonitoring(devices)
    }
  }, [user, devices])

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Phone Buddy</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          {/* Add your login form here */}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>Phone Buddy</Text>
        <Text>Welcome, {user.email}</Text>
        <Text>Devices: {devices.length}</Text>
        {/* Add your main app UI here */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
})


