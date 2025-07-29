'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getCurrentLocation, 
  isGeolocationSupported, 
  detectAreaType, 
  getDefaultSearchRadius,
  type Coordinates,
  type GeolocationResult 
} from '@/lib/geolocation-utils'

interface UseEnhancedGeolocationProps {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoRequest?: boolean
}

interface UseEnhancedGeolocationReturn {
  coordinates: Coordinates | null
  isLoading: boolean
  error: string | null
  accuracy: number | null
  isSupported: boolean
  areaType: 'urban' | 'suburban' | 'rural' | null
  defaultRadius: number
  requestLocation: () => Promise<void>
  clearError: () => void
}

const LOCATION_STORAGE_KEY = 'moveout_user_location'
const LOCATION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useEnhancedGeolocation({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 300000, // 5 minutes
  autoRequest = true
}: UseEnhancedGeolocationProps = {}): UseEnhancedGeolocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [areaType, setAreaType] = useState<'urban' | 'suburban' | 'rural' | null>(null)
  const [defaultRadius, setDefaultRadius] = useState(10)

  const isSupported = isGeolocationSupported()

  // Load cached location on mount
  useEffect(() => {
    const loadCachedLocation = () => {
      try {
        const cached = localStorage.getItem(LOCATION_STORAGE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          const age = Date.now() - parsed.timestamp
          
          if (age < LOCATION_CACHE_DURATION) {
            setCoordinates(parsed.coordinates)
            setAccuracy(parsed.accuracy)
            
            const detectedAreaType = detectAreaType(parsed.coordinates)
            setAreaType(detectedAreaType)
            setDefaultRadius(getDefaultSearchRadius(detectedAreaType))
            
            return true
          } else {
            // Clear expired cache
            localStorage.removeItem(LOCATION_STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error('Error loading cached location:', error)
        localStorage.removeItem(LOCATION_STORAGE_KEY)
      }
      return false
    }

    const hasCache = loadCachedLocation()
    
    // Auto-request location if not cached and autoRequest is enabled
    if (!hasCache && autoRequest && isSupported) {
      requestLocation()
    }
  }, [autoRequest, isSupported])

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getCurrentLocation()
      
      setCoordinates(result.coordinates)
      setAccuracy(result.accuracy || null)
      
      const detectedAreaType = detectAreaType(result.coordinates)
      setAreaType(detectedAreaType)
      setDefaultRadius(getDefaultSearchRadius(detectedAreaType))

      // Cache the location
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
          coordinates: result.coordinates,
          accuracy: result.accuracy,
          timestamp: result.timestamp
        }))
      } catch (error) {
        console.warn('Failed to cache location:', error)
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location'
      setError(message)
      console.error('Geolocation error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    coordinates,
    isLoading,
    error,
    accuracy,
    isSupported,
    areaType,
    defaultRadius,
    requestLocation,
    clearError
  }
}