/**
 * Custom vibration patterns service
 * Supports creating and playing custom vibration patterns
 */

import { Vibration } from 'react-native'
import * as Haptics from 'expo-haptics'

export interface VibrationPattern {
  id: string
  name: string
  pattern: number[] // Array of durations in ms: [vibrate, pause, vibrate, pause, ...]
  repeat?: number // -1 for infinite, or number of times to repeat
}

// Predefined vibration patterns
export const VIBRATION_PATTERNS: Record<string, VibrationPattern> = {
  default: {
    id: 'default',
    name: 'Default',
    pattern: [400],
  },
  double: {
    id: 'double',
    name: 'Double Tap',
    pattern: [200, 100, 200],
  },
  triple: {
    id: 'triple',
    name: 'Triple Tap',
    pattern: [150, 100, 150, 100, 150],
  },
  sos: {
    id: 'sos',
    name: 'SOS Pattern',
    pattern: [100, 100, 100, 100, 100, 100, 300, 300, 100, 300, 100, 300, 300, 100, 100, 100, 100, 100, 100],
  },
  heartbeat: {
    id: 'heartbeat',
    name: 'Heartbeat',
    pattern: [100, 50, 100, 200],
    repeat: 3,
  },
  alert: {
    id: 'alert',
    name: 'Alert',
    pattern: [300, 200, 300, 200, 300],
  },
  gentle: {
    id: 'gentle',
    name: 'Gentle',
    pattern: [100, 50, 100],
  },
}

class VibrationService {
  private currentPattern: VibrationPattern | null = null
  private isPlaying: boolean = false
  private timeoutId: NodeJS.Timeout | null = null

  /**
   * Play a custom vibration pattern
   */
  async playPattern(pattern: VibrationPattern): Promise<void> {
    if (this.isPlaying) {
      this.stop()
    }

    this.currentPattern = pattern
    this.isPlaying = true

    // Use Haptics API for iOS (better experience)
    if (await this.isIOS()) {
      await this.playHapticPattern(pattern)
    } else {
      // Use Vibration API for Android
      this.playVibrationPattern(pattern)
    }
  }

  /**
   * Play pattern using iOS Haptics (more precise)
   */
  private async playHapticPattern(pattern: VibrationPattern): Promise<void> {
    const { pattern: durations, repeat = 1 } = pattern
    let repeatCount = repeat === -1 ? Infinity : repeat

    const playSequence = async () => {
      for (let i = 0; i < durations.length; i += 2) {
        if (!this.isPlaying) break

        const vibrateDuration = durations[i]
        const pauseDuration = durations[i + 1] || 0

        // Use appropriate haptic feedback
        if (vibrateDuration > 200) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }

        if (pauseDuration > 0) {
          await this.sleep(pauseDuration)
        }
      }
    }

    while (repeatCount > 0 && this.isPlaying) {
      await playSequence()
      repeatCount--
      if (repeatCount > 0) {
        await this.sleep(500) // Pause between repeats
      }
    }

    this.isPlaying = false
  }

  /**
   * Play pattern using Android Vibration API
   */
  private playVibrationPattern(pattern: VibrationPattern): void {
    const { pattern: durations, repeat = 1 } = pattern

    // Android Vibration.pattern expects: [delay, vibrate, delay, vibrate, ...]
    // Our pattern is: [vibrate, pause, vibrate, pause, ...]
    const androidPattern: number[] = []
    for (let i = 0; i < durations.length; i++) {
      if (i % 2 === 0) {
        // Vibrate duration
        androidPattern.push(0) // No delay before vibrate
        androidPattern.push(durations[i])
      } else {
        // Pause duration (already handled by delay)
        androidPattern.push(durations[i])
      }
    }

    Vibration.vibrate(androidPattern, repeat === -1 ? true : false)
    this.isPlaying = false
  }

  /**
   * Stop current vibration
   */
  stop(): void {
    this.isPlaying = false
    Vibration.cancel()
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * Create a custom vibration pattern
   */
  createPattern(name: string, pattern: number[], repeat?: number): VibrationPattern {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return {
      id,
      name,
      pattern,
      repeat,
    }
  }

  /**
   * Save custom pattern (to AsyncStorage or Supabase)
   */
  async savePattern(pattern: VibrationPattern): Promise<void> {
    // TODO: Save to AsyncStorage or Supabase user preferences
    // For now, just store in memory
    VIBRATION_PATTERNS[pattern.id] = pattern
  }

  /**
   * Get all available patterns
   */
  getPatterns(): VibrationPattern[] {
    return Object.values(VIBRATION_PATTERNS)
  }

  /**
   * Check if device is iOS
   */
  private async isIOS(): Promise<boolean> {
    const { Platform } = await import('react-native')
    return Platform.OS === 'ios'
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const vibrationService = new VibrationService()

