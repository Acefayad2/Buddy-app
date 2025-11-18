/**
 * Component for creating and testing custom vibration patterns
 */

import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native'
import { useVibration } from '../hooks/useVibration'
import type { VibrationPattern } from '../services/vibration'

export function VibrationPatternEditor() {
  const { playPattern, stop, isPlaying, createPattern, savePattern, getPatterns } = useVibration()
  const [patternName, setPatternName] = useState('')
  const [patternString, setPatternString] = useState('200,100,200') // Default: double tap
  const [availablePatterns, setAvailablePatterns] = useState<VibrationPattern[]>([])

  React.useEffect(() => {
    setAvailablePatterns(getPatterns())
  }, [])

  const handleTestPattern = () => {
    const durations = patternString
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))

    if (durations.length === 0) {
      alert('Please enter valid pattern (e.g., 200,100,200)')
      return
    }

    const testPattern = createPattern('Test Pattern', durations)
    playPattern(testPattern)
  }

  const handleSavePattern = async () => {
    if (!patternName.trim()) {
      alert('Please enter a pattern name')
      return
    }

    const durations = patternString
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))

    if (durations.length === 0) {
      alert('Please enter valid pattern')
      return
    }

    const newPattern = createPattern(patternName, durations)
    await savePattern(newPattern)
    setAvailablePatterns(getPatterns())
    alert('Pattern saved!')
  }

  const handlePlayPreset = (pattern: VibrationPattern) => {
    playPattern(pattern)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Custom Vibration Patterns</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preset Patterns</Text>
        {availablePatterns.map((pattern) => (
          <View key={pattern.id} style={styles.patternItem}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Button
              title="Test"
              onPress={() => handlePlayPreset(pattern)}
              disabled={isPlaying}
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Custom Pattern</Text>
        <TextInput
          style={styles.input}
          placeholder="Pattern Name"
          value={patternName}
          onChangeText={setPatternName}
        />
        <TextInput
          style={styles.input}
          placeholder="Pattern (e.g., 200,100,200)"
          value={patternString}
          onChangeText={setPatternString}
          keyboardType="numeric"
        />
        <Text style={styles.helpText}>
          Format: vibrate,pause,vibrate,pause... (in milliseconds)
        </Text>
        <View style={styles.buttonRow}>
          <Button title="Test Pattern" onPress={handleTestPattern} disabled={isPlaying} />
          <Button title="Stop" onPress={stop} disabled={!isPlaying} />
          <Button title="Save Pattern" onPress={handleSavePattern} />
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  patternName: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
})

