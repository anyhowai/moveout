'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseItemExpirationProps {
  enabled?: boolean
  intervalMinutes?: number
  onItemsExpired?: (expiredItems: string[]) => void
}

export function useItemExpiration({
  enabled = true,
  intervalMinutes = 10, // Check every 10 minutes by default
  onItemsExpired,
}: UseItemExpirationProps = {}) {
  const intervalRef = useRef<NodeJS.Timeout>()

  const checkExpiredItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items/expire', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.expiredCount > 0) {
          console.log(`Expired ${result.data.expiredCount} items:`, result.data.expiredItems)
          onItemsExpired?.(result.data.expiredItems)
        }
      }
    } catch (error) {
      console.error('Error checking for expired items:', error)
    }
  }, [onItemsExpired])

  const manualCheck = useCallback(async () => {
    return checkExpiredItems()
  }, [checkExpiredItems])

  useEffect(() => {
    if (!enabled) return

    // Run initial check after a short delay
    const initialTimeout = setTimeout(checkExpiredItems, 5000)

    // Set up periodic checks
    intervalRef.current = setInterval(checkExpiredItems, intervalMinutes * 60 * 1000)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, intervalMinutes, checkExpiredItems])

  return { manualCheck }
}