/**
 * Component for customizing notification settings
 */

import React, { useState } from 'react'
import { View, Text, Switch, StyleSheet, ScrollView, Button } from 'react-native'
import { useNotifications } from '../hooks/useNotifications'
import { useVibration } from '../hooks/useVibration'
import type { NotificationConfig } from '../services/notifications'

export function NotificationSettings() {
  const { hasPermission, sendNotification, createCategory } = useNotifications()
  const { getPatterns } = useVibration()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [selectedVibrationPattern, setSelectedVibrationPattern] = useState('default')

  const handleTestNotification = async () => {
    const vibrationPattern = getPatterns().find((p) => p.id === selectedVibrationPattern)

    const config: NotificationConfig = {
      title: 'Test Notification',
      body: 'This is a test notification with custom settings',
      sound: soundEnabled,
      vibrationPattern: vibrationEnabled ? vibrationPattern : undefined,
      priority: 'high',
    }

    await sendNotification(config)
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Notification permissions not granted. Please enable in settings.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Vibration</Text>
          <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
        </View>

        {vibrationEnabled && (
          <View style={styles.patternSelector}>
            <Text style={styles.settingLabel}>Vibration Pattern</Text>
            {getPatterns().map((pattern) => (
              <Button
                key={pattern.id}
                title={pattern.name}
                onPress={() => setSelectedVibrationPattern(pattern.id)}
                color={selectedVibrationPattern === pattern.id ? '#007AFF' : '#ccc'}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Button title="Test Notification" onPress={handleTestNotification} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  patternSelector: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
})

