/**
 * Custom notifications service
 * Supports custom sounds, vibration patterns, and notification actions
 */

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { vibrationService, type VibrationPattern } from './vibration'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface NotificationConfig {
  title: string
  body: string
  sound?: string | boolean
  vibrationPattern?: VibrationPattern
  priority?: 'min' | 'low' | 'default' | 'high' | 'max'
  categoryIdentifier?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
}

export interface NotificationAction {
  identifier: string
  buttonTitle: string
  options?: {
    opensAppToForeground?: boolean
  }
}

class NotificationService {
  private notificationListener: Notifications.Subscription | null = null
  private responseListener: Notifications.Subscription | null = null
  private expoPushToken: string | null = null

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for Push Notifications')
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!')
      return false
    }

    return true
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) {
      return null
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      })
      this.expoPushToken = token.data
      return token.data
    } catch (error) {
      console.error('Error getting push token:', error)
      return null
    }
  }

  /**
   * Create a notification category with custom actions
   */
  async createCategory(
    identifier: string,
    actions: NotificationAction[]
  ): Promise<void> {
    await Notifications.setNotificationCategoryAsync(identifier, actions, {
      intentIdentifiers: [],
      hiddenPreviewsBodyPlaceholder: '',
      customDismissAction: true,
      allowInCarPlay: false,
      showTitle: true,
      showSubtitle: true,
    })
  }

  /**
   * Schedule a local notification with custom configuration
   */
  async scheduleNotification(config: NotificationConfig): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        sound: config.sound || true,
        priority: config.priority || 'high',
        categoryIdentifier: config.categoryIdentifier,
        data: config.data || {},
      },
      trigger: null, // Immediate notification
    })

    // Play custom vibration pattern if provided
    if (config.vibrationPattern) {
      vibrationService.playPattern(config.vibrationPattern)
    }

    return notificationId
  }

  /**
   * Schedule a notification with delay
   */
  async scheduleDelayedNotification(
    config: NotificationConfig,
    seconds: number
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        sound: config.sound || true,
        priority: config.priority || 'high',
        categoryIdentifier: config.categoryIdentifier,
        data: config.data || {},
      },
      trigger: {
        seconds,
      },
    })
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        onNotificationReceived?.(notification)
      }
    )

    // Listener for user tapping on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onNotificationTapped?.(response)
      })
  }

  /**
   * Remove notification listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener)
      this.notificationListener = null
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener)
      this.responseListener = null
    }
  }

  /**
   * Get Expo push token
   */
  getPushToken(): string | null {
    return this.expoPushToken
  }

  /**
   * Create custom sound notification (requires custom sound file)
   */
  async createCustomSoundNotification(
    title: string,
    body: string,
    soundFile: string
  ): Promise<string> {
    return await this.scheduleNotification({
      title,
      body,
      sound: soundFile, // e.g., 'custom_sound.wav'
      priority: 'high',
    })
  }
}

export const notificationService = new NotificationService()

