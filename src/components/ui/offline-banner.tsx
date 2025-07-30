'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/use-online-status'

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [showBanner, setShowBanner] = useState(!isOnline)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (isOnline) {
      setShowBanner(false)
      
      // Show reconnected message if user was previously offline
      if (wasOffline) {
        setShowReconnected(true)
        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
          setShowReconnected(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    } else {
      setShowBanner(true)
      setShowReconnected(false)
    }
  }, [isOnline, wasOffline])

  useEffect(() => {
    // Listen for connection restored event
    const handleConnectionRestored = () => {
      // Refresh the page data
      window.location.reload()
    }

    window.addEventListener('connectionRestored', handleConnectionRestored)
    return () => {
      window.removeEventListener('connectionRestored', handleConnectionRestored)
    }
  }, [])

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white text-center py-2 px-4 animate-slide-down">
        <div className="flex items-center justify-center space-x-2">
          <span>✅</span>
          <span className="text-sm font-medium">
            Connection restored! Refreshing data...
          </span>
        </div>
      </div>
    )
  }

  if (showBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4">
        <div className="flex items-center justify-center space-x-2">
          <span>📵</span>
          <span className="text-sm font-medium">
            You're offline. Some features may not work properly.
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 text-red-200 hover:text-white"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return null
}