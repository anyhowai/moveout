'use client'

import { useState, useCallback, useRef } from 'react'
import { CreateItemRequest, ItemCategory, UrgencyLevel } from '@/lib/types'
import { geocodeAddress } from '@/lib/utils'

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
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean
    isValid: boolean | null
    message: string
  }>({
    isValidating: false,
    isValid: null,
    message: ''
  })
  
  const validationTimeoutRef = useRef<NodeJS.Timeout>()

  const validateAddress = useCallback(async (address: string) => {
    if (!address.trim()) {
      setAddressValidation({
        isValidating: false,
        isValid: null,
        message: ''
      })
      return
    }

    setAddressValidation(prev => ({
      ...prev,
      isValidating: true
    }))

    try {
      const coordinates = await geocodeAddress(address)
      if (coordinates) {
        setAddressValidation({
          isValidating: false,
          isValid: true,
          message: '✓ Address verified'
        })
      } else {
        setAddressValidation({
          isValidating: false,
          isValid: false,
          message: '✗ Address not found. Please check spelling and try again.'
        })
      }
    } catch (error) {
      setAddressValidation({
        isValidating: false,
        isValid: false,
        message: '✗ Unable to verify address. Please check your connection.'
      })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if address is valid before submitting
    if (addressValidation.isValid === false) {
      alert('Please enter a valid address before submitting.')
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
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
      
      // Validate address with debouncing
      if (name === 'address') {
        // Clear existing timeout
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current)
        }
        
        // Reset validation state immediately
        setAddressValidation({
          isValidating: false,
          isValid: null,
          message: ''
        })
        
        // Set new timeout for validation (wait 1 second after user stops typing)
        if (value.trim()) {
          validationTimeoutRef.current = setTimeout(() => {
            validateAddress(value)
          }, 1000)
        }
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="e.g., Blue IKEA Couch"
        />
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="Condition, dimensions, any details..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value={ItemCategory.FURNITURE}>Furniture</option>
            <option value={ItemCategory.ELECTRONICS}>Electronics</option>
            <option value={ItemCategory.CLOTHING}>Clothing</option>
            <option value={ItemCategory.BOOKS}>Books</option>
            <option value={ItemCategory.KITCHEN}>Kitchen</option>
            <option value={ItemCategory.DECORATION}>Decoration</option>
            <option value={ItemCategory.OTHER}>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Urgency *
          </label>
          <select
            id="urgency"
            name="urgency"
            required
            value={formData.urgency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value={UrgencyLevel.LOW}>Low - Flexible timing</option>
            <option value={UrgencyLevel.MODERATE}>Moderate - Within a week</option>
            <option value={UrgencyLevel.URGENT}>Urgent - ASAP</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Photo
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        {imageFile && (
          <p className="mt-1 text-sm text-gray-500">
            Selected: {imageFile.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Address *
        </label>
        <div className="relative">
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
              addressValidation.isValid === true
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                : addressValidation.isValid === false
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="123 Main St, City, State 12345"
          />
          {addressValidation.isValidating && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          {addressValidation.isValid === true && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-green-500">✓</span>
            </div>
          )}
          {addressValidation.isValid === false && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-red-500">✗</span>
            </div>
          )}
        </div>
        {addressValidation.message && (
          <p className={`mt-1 text-sm ${
            addressValidation.isValid === true
              ? 'text-green-600'
              : addressValidation.isValid === false
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            {addressValidation.message}
          </p>
        )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="(555) 123-4567"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="your@email.com"
              />
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
          disabled={isLoading || addressValidation.isValid === false}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Posting...' : 'Post Item'}
        </button>
      </div>
    </form>
  )
}