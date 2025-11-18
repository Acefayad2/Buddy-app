/**
 * Safari browser notice component
 * Shows helpful message when user is on Safari
 */

"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { isSafari } from "@/src/lib/browser-detection"
import { Smartphone } from "lucide-react"

export function SafariNotice() {
  if (!isSafari()) {
    return null
  }

  return (
    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-4">
      <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
        <strong>Safari Detected:</strong> Safari doesn't support Web Bluetooth, but you can still use Phone Buddy to manage devices and view proximity events. For Bluetooth scanning, use the{" "}
        <a 
          href="https://apps.apple.com" 
          className="underline font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Phone Buddy mobile app
        </a>{" "}
        or Chrome/Edge on desktop.
      </AlertDescription>
    </Alert>
  )
}

