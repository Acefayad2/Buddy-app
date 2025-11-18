/**
 * App shortcuts service
 * Supports iOS Shortcuts and Android App Shortcuts
 */

import { Linking, Platform } from 'react-native'
import * as IntentLauncher from 'expo-intent-launcher'

export interface AppShortcut {
  id: string
  title: string
  description?: string
  icon?: string
  action: () => Promise<void> | void
  deepLink?: string
}

class ShortcutsService {
  private shortcuts: Map<string, AppShortcut> = new Map()

  /**
   * Register a shortcut
   */
  registerShortcut(shortcut: AppShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  /**
   * Unregister a shortcut
   */
  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id)
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): AppShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * Execute a shortcut by ID
   */
  async executeShortcut(id: string): Promise<void> {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) {
      await shortcut.action()
    } else {
      throw new Error(`Shortcut ${id} not found`)
    }
  }

  /**
   * Handle deep link (for iOS Shortcuts and Android App Shortcuts)
   */
  async handleDeepLink(url: string): Promise<void> {
    // Parse deep link: phonebuddy://shortcut/{id}
    const match = url.match(/phonebuddy:\/\/shortcut\/(.+)/)
    if (match) {
      const shortcutId = match[1]
      await this.executeShortcut(shortcutId)
    }
  }

  /**
   * Set up deep link listener
   */
  setupDeepLinkListener(
    onShortcutExecuted?: (shortcutId: string) => void
  ): () => void {
    const subscription = Linking.addEventListener('url', async (event) => {
      const { url } = event
      if (url.startsWith('phonebuddy://')) {
        await this.handleDeepLink(url)
        const match = url.match(/phonebuddy:\/\/shortcut\/(.+)/)
        if (match) {
          onShortcutExecuted?.(match[1])
        }
      }
    })

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('phonebuddy://')) {
        this.handleDeepLink(url)
      }
    })

    return () => {
      subscription.remove()
    }
  }

  /**
   * Create iOS Shortcuts URL (for sharing)
   */
  createIOSShortcutURL(shortcutId: string): string {
    const shortcut = this.shortcuts.get(shortcutId)
    if (!shortcut) {
      throw new Error(`Shortcut ${shortcutId} not found`)
    }

    // iOS Shortcuts app URL scheme
    return `shortcuts://run-shortcut?name=${encodeURIComponent(shortcut.title)}&input=text&text=${encodeURIComponent(shortcut.deepLink || `phonebuddy://shortcut/${shortcutId}`)}`
  }

  /**
   * Create Android App Shortcut (requires native module)
   * For now, returns deep link that can be used with Tasker or similar
   */
  createAndroidShortcut(shortcutId: string): string {
    const shortcut = this.shortcuts.get(shortcutId)
    if (!shortcut) {
      throw new Error(`Shortcut ${shortcutId} not found`)
    }

    return shortcut.deepLink || `phonebuddy://shortcut/${shortcutId}`
  }

  /**
   * Register default shortcuts
   */
  registerDefaultShortcuts(): void {
    // Quick scan for devices
    this.registerShortcut({
      id: 'quick-scan',
      title: 'Quick Device Scan',
      description: 'Start scanning for nearby devices',
      action: async () => {
        // Import and use bluetooth service
        const { bluetoothService } = await import('./bluetooth')
        await bluetoothService.startScanning(
          (device) => {
            console.log('Found device:', device.name)
          },
          (error) => {
            console.error('Scan error:', error)
          }
        )
      },
      deepLink: 'phonebuddy://shortcut/quick-scan',
    })

    // View recent events
    this.registerShortcut({
      id: 'view-events',
      title: 'View Recent Events',
      description: 'Open app to recent proximity events',
      action: async () => {
        // Navigate to events screen
        Linking.openURL('phonebuddy://events')
      },
      deepLink: 'phonebuddy://shortcut/view-events',
    })

    // Register device
    this.registerShortcut({
      id: 'register-device',
      title: 'Register This Device',
      description: 'Register current device with Phone Buddy',
      action: async () => {
        Linking.openURL('phonebuddy://register-device')
      },
      deepLink: 'phonebuddy://shortcut/register-device',
    })
  }
}

export const shortcutsService = new ShortcutsService()

