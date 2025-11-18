/**
 * Hook for managing custom vibration patterns
 */

import { useState, useCallback } from 'react'
import { vibrationService, type VibrationPattern } from '../services/vibration'

export function useVibration() {
  const [isPlaying, setIsPlaying] = useState(false)

  const playPattern = useCallback(async (pattern: VibrationPattern) => {
    setIsPlaying(true)
    try {
      await vibrationService.playPattern(pattern)
    } finally {
      setIsPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    vibrationService.stop()
    setIsPlaying(false)
  }, [])

  const createPattern = useCallback(
    (name: string, pattern: number[], repeat?: number) => {
      return vibrationService.createPattern(name, pattern, repeat)
    },
    []
  )

  const getPatterns = useCallback(() => {
    return vibrationService.getPatterns()
  }, [])

  const savePattern = useCallback(async (pattern: VibrationPattern) => {
    await vibrationService.savePattern(pattern)
  }, [])

  return {
    isPlaying,
    playPattern,
    stop,
    createPattern,
    getPatterns,
    savePattern,
  }
}

