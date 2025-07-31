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
    <div className={className}>
      {/* Distance selector - aligned with other filters */}
      <select
        value={selectedDistance || 'all'}
        onChange={(e) => handleDistanceChange(e.target.value)}
        disabled={disabled || (!coordinates && !error)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-10 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="all">Any Distance</option>
        {distanceOptions.map(option => (
          <option key={option.value} value={option.value}>
            Within {option.label}
          </option>
        ))}
      </select>

    </div>
  )
}