'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/use-online-status'

interface LocationStatusProps {
  coordinates: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null
  isSupported: boolean
  onRetryLocation?: () => void
  className?: string
}

export default function LocationStatus({
  coordinates,
  isLoading,
  error,
  isSupported,
  onRetryLocation,
  className = ''
}: LocationStatusProps) {
  const { isOnline } = useOnlineStatus()
  const [showDetails, setShowDetails] = useState(false)

  if (!isSupported) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-amber-600">⚠️</span>
          <span className="text-sm text-amber-800 font-medium">
            Location not supported
          </span>
        </div>
        <p className="text-xs text-amber-700 mt-1">
          Your browser doesn't support location services. You can still browse all items.
        </p>
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-600">📵</span>
          <span className="text-sm text-red-800 font-medium">
            You're offline
          </span>
        </div>
        <p className="text-xs text-red-700 mt-1">
          Connect to the internet to see items near you.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-800 font-medium">
            Finding your location...
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          This may take a few seconds
        </p>
      </div>
    )
  }

  if (error) {
    const getErrorAdvice = (errorMessage: string) => {
      if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
        return {
          icon: '🔒',
          title: 'Location access denied',
          advice: 'Enable location permissions in your browser settings to see nearby items.',
          showRetry: false
        }
      }
      if (errorMessage.includes('unavailable')) {
        return {
          icon: '📍',
          title: 'Location unavailable',
          advice: 'Your location could not be determined. Try moving to an area with better GPS signal.',
          showRetry: true
        }
      }
      if (errorMessage.includes('timeout')) {
        return {
          icon: '⏱️',
          title: 'Location timeout',
          advice: 'Location request took too long. Check your connection and try again.',
          showRetry: true
        }
      }
      return {
        icon: '❌',
        title: 'Location error',
        advice: 'Unable to get your location. You can still browse all items.',
        showRetry: true
      }
    }

    const errorInfo = getErrorAdvice(error)

    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">{errorInfo.icon}</span>
            <span className="text-sm text-yellow-800 font-medium">
              {errorInfo.title}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-yellow-600 underline hover:text-yellow-800"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
        
        <p className="text-xs text-yellow-700 mt-1">
          {errorInfo.advice}
        </p>

        {showDetails && (
          <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800 font-mono">
            {error}
          </div>
        )}

        {errorInfo.showRetry && onRetryLocation && (
          <button
            onClick={onRetryLocation}
            className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  if (coordinates) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-green-600">📍</span>
          <span className="text-sm text-green-800 font-medium">
            Location found
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Showing items near you
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">📍</span>
          <span className="text-sm text-gray-800 font-medium">
            Location not enabled
          </span>
        </div>
        {onRetryLocation && (
          <button
            onClick={onRetryLocation}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Enable Location
          </button>
        )}
      </div>
      <p className="text-xs text-gray-700 mt-1">
        Enable location to see items near you
      </p>
    </div>
  )
}