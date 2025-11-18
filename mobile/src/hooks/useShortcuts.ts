/**
 * Hook for managing app shortcuts
 */

import { useEffect, useCallback } from 'react'
import { shortcutsService, type AppShortcut } from '../services/shortcuts'

export function useShortcuts() {
  useEffect(() => {
    // Register default shortcuts
    shortcutsService.registerDefaultShortcuts()

    // Set up deep link listener
    const cleanup = shortcutsService.setupDeepLinkListener((shortcutId) => {
      console.log('Shortcut executed:', shortcutId)
    })

    return cleanup
  }, [])

  const registerShortcut = useCallback((shortcut: AppShortcut) => {
    shortcutsService.registerShortcut(shortcut)
  }, [])

  const unregisterShortcut = useCallback((id: string) => {
    shortcutsService.unregisterShortcut(id)
  }, [])

  const getShortcuts = useCallback(() => {
    return shortcutsService.getShortcuts()
  }, [])

  const executeShortcut = useCallback(async (id: string) => {
    await shortcutsService.executeShortcut(id)
  }, [])

  const getIOSShortcutURL = useCallback((id: string) => {
    return shortcutsService.createIOSShortcutURL(id)
  }, [])

  const getAndroidShortcut = useCallback((id: string) => {
    return shortcutsService.createAndroidShortcut(id)
  }, [])

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    executeShortcut,
    getIOSShortcutURL,
    getAndroidShortcut,
  }
}

