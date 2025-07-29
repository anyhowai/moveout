'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Item, UrgencyLevel } from '@/lib/types'
import { useGeolocation } from '@/hooks/use-geolocation'

interface MapViewProps {
  items: Item[]
  onMarkerClick?: (item: Item) => void
}

export default function MapView({ items, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null)
  
  const { coordinates: userLocation, isLoading: locationLoading, error: locationError } = useGeolocation()

  useEffect(() => {
    initializeMap()
  }, [])

  useEffect(() => {
    if (map && items.length > 0) {
      addMarkers(items)
    }
  }, [map, items])

  useEffect(() => {
    if (map && userLocation) {
      updateUserLocation(userLocation)
    }
  }, [map, userLocation])

  const initializeMap = async () => {
    if (!mapRef.current) return

    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry'],
      })

      const { Map } = await loader.importLibrary('maps')

      // Default to San Francisco for demo
      const defaultCenter = { lat: 37.7749, lng: -122.4194 }

      const mapInstance = new Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      setMap(mapInstance)

      // Center on user location if available, otherwise use default
      if (userLocation) {
        mapInstance.setCenter(userLocation)
        mapInstance.setZoom(14)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  const updateUserLocation = (location: { lat: number; lng: number }) => {
    if (!map) return

    // Remove existing user marker
    if (userMarker) {
      userMarker.setMap(null)
    }

    // Create new user marker
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285f4',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
    })

    const infoWindow = new google.maps.InfoWindow({
      content: '<div class="p-2"><strong>Your Location</strong></div>',
    })

    marker.addListener('click', () => {
      infoWindow.open(map, marker)
    })

    setUserMarker(marker)
    
    // Center map on user location
    map.setCenter(location)
    map.setZoom(14)
  }

  const addMarkers = (items: Item[]) => {
    if (!map) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers: google.maps.Marker[] = []

    items.forEach((item) => {
      const marker = new google.maps.Marker({
        position: item.coordinates,
        map: map,
        title: item.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getUrgencyColor(item.urgency),
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(item),
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        if (onMarkerClick) {
          onMarkerClick(item)
        }
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
  }

  const getUrgencyColor = (urgency: UrgencyLevel): string => {
    switch (urgency) {
      case UrgencyLevel.URGENT:
        return '#ef4444'
      case UrgencyLevel.MODERATE:
        return '#f59e0b'
      case UrgencyLevel.LOW:
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const createInfoWindowContent = (item: Item): string => {
    const pickupDeadline = item.pickupDeadline 
      ? new Date(item.pickupDeadline).toLocaleDateString() 
      : null

    const getStatusBadge = (status: string) => {
      const statusColors = {
        available: 'bg-green-100 text-green-800 border-green-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        picked_up: 'bg-blue-100 text-blue-800 border-blue-200',
        expired: 'bg-red-100 text-red-800 border-red-200'
      }
      const statusLabels = {
        available: 'Available',
        pending: 'Pickup Pending',
        picked_up: 'Picked Up',
        expired: 'Expired'
      }
      const colorClass = statusColors[status] || statusColors.available
      const label = statusLabels[status] || 'Available'
      return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}">${label}</span>`
    }

    return `
      <div class="p-2 max-w-xs">
        <h3 class="font-semibold text-lg mb-1">${item.title}</h3>
        <div class="flex items-center space-x-2 mb-2">
          ${getStatusBadge(item.status)}
          <div class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full mr-1" style="background-color: ${getUrgencyColor(item.urgency)}"></span>
            <span class="text-xs capitalize">${item.urgency}</span>
          </div>
        </div>
        ${item.description ? `<p class="text-sm text-gray-600 mb-2">${item.description}</p>` : ''}
        ${pickupDeadline ? `<p class="text-xs text-amber-600 mb-2">⏰ Pickup by: ${pickupDeadline}</p>` : ''}
        <p class="text-xs text-gray-500 mb-3">${item.address}</p>
        <div class="flex space-x-2">
          <button 
            onclick="window.getDirections('${item.address}')"
            class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex-1"
          >
            Directions
          </button>
          <button 
            onclick="window.contactOwner('${item.id}')"
            class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-1"
          >
            Contact
          </button>
        </div>
      </div>
    `
  }

  // Add global functions for directions and contact
  useEffect(() => {
    ;(window as any).getDirections = (destination: string) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
      window.open(url, '_blank')
    }

    ;(window as any).contactOwner = (itemId: string) => {
      const item = items.find(i => i.id === itemId)
      if (item && onMarkerClick) {
        onMarkerClick(item)
      }
    }
  }, [items, onMarkerClick])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Location status indicator */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        {locationLoading && (
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Finding your location...</span>
            <span className="text-xs text-gray-600 sm:hidden">Finding location...</span>
          </div>
        )}
        {locationError && (
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 max-w-xs">
            <div className="flex items-center space-x-2 text-amber-600">
              <span className="text-sm">⚠️</span>
              <span className="text-xs sm:text-sm">Location unavailable</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">{locationError}</p>
          </div>
        )}
        {userLocation && !locationLoading && (
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 flex items-center space-x-1 sm:space-x-2">
            <span className="text-blue-600">📍</span>
            <span className="text-xs sm:text-sm text-gray-600">Location found</span>
          </div>
        )}
      </div>

      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Google Maps API Key Required
            </h3>
            <p className="text-sm text-gray-600">
              Add your Google Maps API key to environment variables to enable the map.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}