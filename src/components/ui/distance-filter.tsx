'use client'

import { useState, useEffect } from 'react'
import { useEnhancedGeolocation } from '@/hooks/use-enhanced-geolocation'
import { getDistanceOptions } from '@/lib/geolocation-utils'

interface DistanceFilterProps {
  onDistanceChange: (distance: number | null) => void
  onLocationChange: (coordinates: { lat: number; lng: number } | null) => void
  className?: string
  disabled?: boolean
}

export default function DistanceFilter({
  onDistanceChange,
  onLocationChange,
  className = '',
  disabled = false
}: DistanceFilterProps) {
  const {
    coordinates,
    isLoading,
    error,
    isSupported,
    areaType,
    defaultRadius,
    requestLocation,
    clearError
  } = useEnhancedGeolocation()

  const [selectedDistance, setSelectedDistance] = useState<number | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)

  const distanceOptions = getDistanceOptions()

  // Set default distance when location is available
  useEffect(() => {
    if (coordinates && selectedDistance === null) {
      setSelectedDistance(defaultRadius)
      onDistanceChange(defaultRadius)
    }
  }, [coordinates, defaultRadius, selectedDistance, onDistanceChange])

  // Notify parent of location changes
  useEffect(() => {
    onLocationChange(coordinates)
  }, [coordinates, onLocationChange])

  const handleDistanceChange = (distance: string) => {
    const numDistance = distance === 'all' ? null : parseInt(distance)
    setSelectedDistance(numDistance)
    onDistanceChange(numDistance)
  }

  const handleEnableLocation = async () => {
    setShowLocationPrompt(false)
    clearError()
    await requestLocation()
  }

  if (!isSupported) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Location not supported
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Distance selector */}
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Distance:
        </label>
        <select
          value={selectedDistance || 'all'}
          onChange={(e) => handleDistanceChange(e.target.value)}
          disabled={disabled || (!coordinates && !error)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="all">Any distance</option>
          {distanceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location status */}
      <div className="flex items-center space-x-2 text-xs">
        {isLoading && (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Getting your location...</span>
          </>
        )}

        {coordinates && !isLoading && (
          <>
            <span className="text-green-600">📍</span>
            <span className="text-green-600">
              Location found ({areaType} area)
            </span>
          </>
        )}

        {error && !isLoading && (
          <>
            <span className="text-amber-600">⚠️</span>
            <span className="text-amber-600">Location unavailable</span>
            <button
              onClick={() => setShowLocationPrompt(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Enable
            </button>
          </>
        )}

        {!coordinates && !error && !isLoading && (
          <>
            <span className="text-gray-500">📍</span>
            <button
              onClick={() => setShowLocationPrompt(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Enable location for distance filtering
            </button>
          </>
        )}
      </div>

      {/* Location permission prompt */}
      {showLocationPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">📍</span>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Enable location for better results
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                We'll show items near you and calculate distances. Your location is never stored or shared.
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEnableLocation}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Enable Location
                </button>
                <button
                  onClick={() => setShowLocationPrompt(false)}
                  className="text-blue-600 text-xs hover:text-blue-800"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-amber-600">⚠️</span>
            <div className="flex-1">
              <p className="text-xs text-amber-700">{error}</p>
            </div>
            <button
              onClick={() => {
                clearError()
                requestLocation()
              }}
              className="text-amber-600 text-xs hover:text-amber-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}