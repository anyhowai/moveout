'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CreateItemRequest, ItemCategory, UrgencyLevel } from '@/lib/types'
import { geocodeAddress } from '@/lib/utils'
import { validateField, validateImageFile, itemFormRules } from '@/lib/validation'
import AddressAutocomplete from '@/components/ui/address-autocomplete'

interface ItemFormProps {
  onSubmit: (data: CreateItemRequest) => void
  isLoading?: boolean
}

export default function ItemForm({ onSubmit, isLoading = false }: ItemFormProps) {
  const [formData, setFormData] = useState<CreateItemRequest>({
    title: '',
    description: '',
    category: ItemCategory.FURNITURE,
    urgency: UrgencyLevel.MODERATE,
    address: '',
    contactInfo: {
      name: '',
      phone: '',
      email: '',
    },
    pickupDeadline: undefined,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [addressValidated, setAddressValidated] = useState(false)
  
  const validationTimeoutRef = useRef<NodeJS.Timeout>()

  // Real-time field validation
  const validateFieldRealTime = useCallback((fieldName: string, value: string) => {
    const rules = itemFormRules[fieldName as keyof typeof itemFormRules]
    if (!rules) return

    const error = validateField(fieldName, value, rules)
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error ? error.message : ''
    }))
  }, [])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submitting
    const allErrors: Record<string, string> = {}
    
    // Validate form fields
    for (const [fieldName, rules] of Object.entries(itemFormRules)) {
      const value = fieldName.includes('contactInfo.') 
        ? formData.contactInfo[fieldName.split('.')[1] as keyof typeof formData.contactInfo] || ''
        : (formData as any)[fieldName] || ''
      
      const error = validateField(fieldName, value, rules)
      if (error) {
        allErrors[fieldName] = error.message
      }
    }
    
    // Validate image file if present
    if (imageFile) {
      const imageError = validateImageFile(imageFile)
      if (imageError) {
        allErrors.image = imageError.message
      }
    }
    
    
    setValidationErrors(allErrors)
    
    // If there are errors, don't submit
    if (Object.keys(allErrors).some(key => allErrors[key])) {
      return
    }
    
    const submitData: CreateItemRequest = {
      ...formData,
      image: imageFile || undefined,
    }
    
    onSubmit(submitData)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    
    // Update form data
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }))
      
      // Validate contact info field
      validateFieldRealTime(name, value)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
      
      // Validate regular field
      validateFieldRealTime(name, value)
      
    }
  }

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }))
    setAddressValidated(false)
    validateFieldRealTime('address', address)
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setAddressValidated(true)
      setValidationErrors(prev => ({ ...prev, address: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate image file
      const imageError = validateImageFile(file)
      if (imageError) {
        setValidationErrors(prev => ({
          ...prev,
          image: imageError.message
        }))
        // Clear the file input
        e.target.value = ''
        return
      }
      
      // Clear any previous image errors
      setValidationErrors(prev => ({
        ...prev,
        image: ''
      }))
      
      setImageFile(file)
    }
  }

  // Helper component for displaying field errors
  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    const error = validationErrors[fieldName]
    if (!error) return null
    
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <span className="mr-1">⚠️</span>
        {error}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Item Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
            validationErrors.title 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder="e.g., Blue IKEA Couch"
        />
        <ErrorMessage fieldName="title" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
            validationErrors.description 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder="Condition, dimensions, any details..."
        />
        <ErrorMessage fieldName="description" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none"
            style={{ backgroundColor: 'white', colorScheme: 'light' }}
          >
            <option value={ItemCategory.FURNITURE}>Furniture</option>
            <option value={ItemCategory.ELECTRONICS}>Electronics</option>
            <option value={ItemCategory.CLOTHING}>Clothing</option>
            <option value={ItemCategory.BOOKS}>Books</option>
            <option value={ItemCategory.KITCHEN}>Kitchen</option>
            <option value={ItemCategory.DECORATION}>Decoration</option>
            <option value={ItemCategory.OTHER}>Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none" style={{ top: '28px' }}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Urgency *
          </label>
          <select
            id="urgency"
            name="urgency"
            required
            value={formData.urgency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none"
            style={{ backgroundColor: 'white', colorScheme: 'light' }}
          >
            <option value={UrgencyLevel.LOW}>Low - Flexible timing</option>
            <option value={UrgencyLevel.MODERATE}>Moderate - Within a week</option>
            <option value={UrgencyLevel.URGENT}>Urgent - ASAP</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none" style={{ top: '28px' }}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="pickupDeadline" className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Deadline (Optional)
        </label>
        <input
          type="datetime-local"
          id="pickupDeadline"
          name="pickupDeadline"
          value={formData.pickupDeadline ? formData.pickupDeadline.toISOString().slice(0, 16) : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined
            setFormData(prev => ({ ...prev, pickupDeadline: date }))
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          min={new Date().toISOString().slice(0, 16)}
        />
        <p className="mt-1 text-sm text-gray-500">
          When does this item need to be picked up by? Leave empty if flexible.
        </p>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Photo
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
            validationErrors.image 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        <p className="mt-1 text-sm text-gray-500">
          Accepted formats: JPG, PNG, WebP. Max size: 5MB
        </p>
        {imageFile && (
          <p className="mt-1 text-sm text-green-600">
            ✓ Selected: {imageFile.name}
          </p>
        )}
        <ErrorMessage fieldName="image" />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Address *
        </label>
        <AddressAutocomplete
          value={formData.address}
          onChange={handleAddressChange}
          onPlaceSelect={handlePlaceSelect}
          required={true}
          hasError={!!validationErrors.address}
          placeholder="123 Main St, City, State 12345"
        />
        {addressValidated && !validationErrors.address && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <span className="mr-1">✓</span>
            Address validated
          </p>
        )}
        <ErrorMessage fieldName="address" />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="contactInfo.name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="contactInfo.name"
              name="contactInfo.name"
              required
              value={formData.contactInfo.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                validationErrors['contactInfo.name'] 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            <ErrorMessage fieldName="contactInfo.name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                  validationErrors['contactInfo.phone'] 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="(415) 555-1234"
              />
              <ErrorMessage fieldName="contactInfo.phone" />
            </div>

            <div>
              <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="contactInfo.email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
                  validationErrors['contactInfo.email'] 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="your@email.com"
              />
              <ErrorMessage fieldName="contactInfo.email" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Posting...' : 'Post Item'}
        </button>
      </div>
    </form>
  )
}