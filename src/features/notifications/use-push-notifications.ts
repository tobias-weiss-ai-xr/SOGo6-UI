'use client'

import { useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { logger } from '@/lib/logger'

/**
 * Hook to manage Web Push notification subscriptions.
 *
 * - Requests notification permission on first call
 * - Subscribes to push via the VAPID public key
 * - Stores subscription on the server
 * - Unsubscribes on cleanup
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const jwtToken = useAppSelector(
    (state: RootState) => state.auth?.jwtToken ?? ''
  )

  // Fetch VAPID public key and subscribe
  const subscribe = async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'denied') return

    setIsLoading(true)
    try {
      // Request permission if not granted
      let perm = Notification.permission
      if (perm !== 'granted') {
        perm = await Notification.requestPermission()
        setPermission(perm)
      }
      if (perm !== 'granted') return

      // Get VAPID public key from server
      const keyResp = await fetch('/api/user/v1/push/vapid-public-key')
      const keyData = await keyResp.json()
      const publicKey = keyData.public_key

      // Register service worker if not already
      const reg = await navigator.serviceWorker.ready

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      await fetch('/api/user/v1/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(sub.toJSON()),
      })

      setIsSubscribed(true)
    } catch (error) {
      logger.error('Failed to subscribe to push:', { error: error })
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        // Notify server
        await fetch('/api/user/v1/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setIsSubscribed(false)
    } catch (error) {
      logger.error('Failed to unsubscribe:', { error: error })
    }
  }

  // Check current subscription status on mount
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    })
  }, [])

  return {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    isSupported:
      typeof Notification !== 'undefined' && 'serviceWorker' in navigator,
  }
}

function _urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
