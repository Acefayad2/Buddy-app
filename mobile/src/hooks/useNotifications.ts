/**
 * Hook for managing custom notifications
 */

import { useState, useEffect, useCallback } from 'react'
import { notificationService, type NotificationConfig } from '../services/notifications'
import type { Notification, NotificationResponse } from 'expo-notifications'

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false)
  const [pushToken, setPushToken] = useState<string | null>(null)
  const [lastNotification, setLastNotification] = useState<Notification | null>(null)

  useEffect(() => {
    // Request permissions on mount
    notificationService.requestPermissions().then(setHasPermission)

    // Register for push notifications
    notificationService.registerForPushNotifications().then(setPushToken)

    // Set up listeners
    notificationService.setupListeners(
      (notification) => {
        setLastNotification(notification)
      },
      (response) => {
        console.log('Notification tapped:', response)
      }
    )

    return () => {
      notificationService.removeListeners()
    }
  }, [])

  const sendNotification = useCallback(async (config: NotificationConfig) => {
    return await notificationService.scheduleNotification(config)
  }, [])

  const sendDelayedNotification = useCallback(
    async (config: NotificationConfig, seconds: number) => {
      return await notificationService.scheduleDelayedNotification(config, seconds)
    },
    []
  )

  const cancelNotification = useCallback(async (id: string) => {
    await notificationService.cancelNotification(id)
  }, [])

  const cancelAll = useCallback(async () => {
    await notificationService.cancelAllNotifications()
  }, [])

  const createCategory = useCallback(
    async (identifier: string, actions: any[]) => {
      await notificationService.createCategory(identifier, actions)
    },
    []
  )

  return {
    hasPermission,
    pushToken,
    lastNotification,
    sendNotification,
    sendDelayedNotification,
    cancelNotification,
    cancelAll,
    createCategory,
  }
}

