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
      // Monkey-patch attachShadow to open the shadow DOM for styling
      if (!(window as any).__shadowDOMPatched) {
        const originalAttachShadow = Element.prototype.attachShadow
        
        Element.prototype.attachShadow = function (init) {
          if (this.localName === 'gmp-place-autocomplete') {
            const shadow = originalAttachShadow.call(this, {
              ...init,
              mode: 'open'
            })
            
            const style = document.createElement('style')
            style.textContent = `
              .widget-container { 
                border: none !important; 
                background: white !important;
              }
              .input-container { 
                padding: 0px !important; 
                background: white !important;
              }
              input { 
                color: #111827 !important; 
                background: white !important;
                border: none !important;
                outline: none !important;
                font-family: inherit !important;
                font-size: 16px !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              input::placeholder {
                color: #9ca3af !important;
                opacity: 1 !important;
              }
            `
            shadow.appendChild(style)
            return shadow
          }
          return originalAttachShadow.call(this, init)
        }
        
        ;(window as any).__shadowDOMPatched = true
      }
      
      const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address']
      })

      // Style the container element to match form inputs
      placeAutocomplete.style.cssText = `
        width: 100%;
        border: ${hasError ? '1px solid #ef4444' : '1px solid #d1d5db'};
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 16px;
        background-color: white;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        box-sizing: border-box;
      `

      // Add focus styles
      const handleFocus = () => {
        placeAutocomplete.style.borderColor = hasError ? '#ef4444' : '#3b82f6'
        placeAutocomplete.style.boxShadow = hasError 
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
          : '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }

      const handleBlur = () => {
        placeAutocomplete.style.borderColor = hasError ? '#ef4444' : '#d1d5db'
        placeAutocomplete.style.boxShadow = 'none'
      }

      placeAutocomplete.addEventListener('focus', handleFocus, true)
      placeAutocomplete.addEventListener('blur', handleBlur, true)

      // Set placeholder
      if (placeholder) {
        placeAutocomplete.setAttribute('placeholder', placeholder)
      }

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
    <div className="relative">
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