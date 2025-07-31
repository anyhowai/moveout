'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: any) => void
  placeholder?: string
  required?: boolean
  className?: string
  hasError?: boolean
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelect,
  placeholder = "Start typing an address...",
  required = false,
  className = "",
  hasError = false
}: AddressAutocompleteProps) {
  const autocompleteContainer = useRef<HTMLDivElement>(null)
  const placeAutocompleteRef = useRef<any>(null)
  const onChangeRef = useRef(onChange)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const [isLoaded, setIsLoaded] = useState(false)

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange
    onPlaceSelectRef.current = onPlaceSelect
  }, [onChange, onPlaceSelect])

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
      } else {
        setTimeout(checkGoogleMaps, 200)
      }
    }
    
    const timeoutId = setTimeout(checkGoogleMaps, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!isLoaded || !autocompleteContainer.current || placeAutocompleteRef.current) {
      return
    }

    try {
      const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address']
      })

      // Listen for place selection
      placeAutocomplete.addEventListener('gmp-select', async (event: any) => {
        try {
          const placePrediction = event.placePrediction
          const place = placePrediction.toPlace()
          
          await place.fetchFields({ 
            fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'] 
          })
          
          const details = place.toJSON()
          
          if (details.formattedAddress) {
            onChangeRef.current(details.formattedAddress)
            if (onPlaceSelectRef.current) {
              onPlaceSelectRef.current(details)
            }
          }
        } catch (error) {
          console.error('Error processing place selection:', error)
        }
      })

      autocompleteContainer.current.innerHTML = ''
      autocompleteContainer.current.appendChild(placeAutocomplete)
      placeAutocompleteRef.current = placeAutocomplete

      return () => {
        if (autocompleteContainer.current) {
          autocompleteContainer.current.innerHTML = ''
        }
        placeAutocompleteRef.current = null
      }
    } catch (error) {
      console.error('Error creating PlaceAutocompleteElement:', error)
    }
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
        Loading address autocomplete...
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={autocompleteContainer} className="w-full" />
      <input
        type="hidden"
        name="address"
        value={value}
        required={required}
      />
    </div>
  )
}