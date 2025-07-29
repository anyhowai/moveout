export interface Coordinates {
  lat: number
  lng: number
}

export interface GeolocationResult {
  coordinates: Coordinates
  accuracy?: number
  timestamp: number
}

export interface DistanceResult {
  distance: number
  unit: 'miles' | 'km'
  formatted: string
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
  unit: 'miles' | 'km' = 'miles'
): DistanceResult {
  const R = unit === 'miles' ? 3959 : 6371 // Earth's radius in miles or kilometers
  
  const dLat = toRadians(point2.lat - point1.lat)
  const dLng = toRadians(point2.lng - point1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return {
    distance,
    unit,
    formatted: formatDistance(distance, unit)
  }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number, unit: 'miles' | 'km' = 'miles'): string {
  if (distance < 0.1) {
    return unit === 'miles' ? '< 0.1 mi' : '< 0.1 km'
  }
  
  if (distance < 1) {
    return `${distance.toFixed(1)} ${unit === 'miles' ? 'mi' : 'km'}`
  }
  
  if (distance < 10) {
    return `${distance.toFixed(1)} ${unit === 'miles' ? 'mi' : 'km'}`
  }
  
  return `${Math.round(distance)} ${unit === 'miles' ? 'mi' : 'km'}`
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        let message = 'Unknown error occurred'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        
        reject(new Error(message))
      },
      options
    )
  })
}

/**
 * Check if geolocation is supported and available
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator
}

/**
 * Get distance options for filter dropdown
 */
export function getDistanceOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'Within 1 mile' },
    { value: 2, label: 'Within 2 miles' },
    { value: 5, label: 'Within 5 miles' },
    { value: 10, label: 'Within 10 miles' },
    { value: 25, label: 'Within 25 miles' },
    { value: 50, label: 'Within 50 miles' },
    { value: 100, label: 'Within 100 miles' },
  ]
}

/**
 * Filter items by distance from user location
 */
export function filterItemsByDistance<T extends { coordinates: Coordinates }>(
  items: T[],
  userLocation: Coordinates,
  maxDistance: number
): (T & { distance: DistanceResult })[] {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(userLocation, item.coordinates)
    }))
    .filter(item => item.distance.distance <= maxDistance)
    .sort((a, b) => a.distance.distance - b.distance.distance)
}

/**
 * Get optimal map zoom level based on distance filter
 */
export function getMapZoomForDistance(distance: number): number {
  if (distance <= 1) return 15
  if (distance <= 2) return 14
  if (distance <= 5) return 13
  if (distance <= 10) return 12
  if (distance <= 25) return 11
  if (distance <= 50) return 10
  return 9
}

/**
 * Detect if user is in urban area based on coordinates (simplified)
 */
export function detectAreaType(coordinates: Coordinates): 'urban' | 'suburban' | 'rural' {
  // This is a simplified detection - in production you'd use a more sophisticated service
  // For now, we'll use some basic US city coordinates as reference
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, name: 'NYC' }, // New York
    { lat: 34.0522, lng: -118.2437, name: 'LA' }, // Los Angeles
    { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
    { lat: 37.7749, lng: -122.4194, name: 'SF' }, // San Francisco
    { lat: 29.7604, lng: -95.3698, name: 'Houston' },
  ]
  
  const nearestCity = majorCities.reduce((nearest, city) => {
    const distance = calculateDistance(coordinates, city)
    return distance.distance < nearest.distance ? { ...city, distance: distance.distance } : nearest
  }, { distance: Infinity } as any)
  
  if (nearestCity.distance < 10) return 'urban'
  if (nearestCity.distance < 50) return 'suburban'
  return 'rural'
}

/**
 * Get default search radius based on area type
 */
export function getDefaultSearchRadius(areaType: 'urban' | 'suburban' | 'rural'): number {
  switch (areaType) {
    case 'urban': return 5
    case 'suburban': return 15
    case 'rural': return 50
    default: return 10
  }
}