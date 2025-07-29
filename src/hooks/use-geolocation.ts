'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  coordinates: {
    lat: number
    lng: number
  } | null
  isLoading: boolean
  error: string | null
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
  })

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 600000, // 10 minutes
  } = options

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        isLoading: false,
        error: 'Geolocation is not supported by this browser.',
      })
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isLoading: false,
          error: null,
        })
      },
      (error) => {
        let errorMessage = 'An unknown error occurred.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied by user.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }

        setState({
          coordinates: null,
          isLoading: false,
          error: errorMessage,
        })
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }

  useEffect(() => {
    // Automatically get location on mount if available
    if (navigator.geolocation) {
      getCurrentLocation()
    }
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}