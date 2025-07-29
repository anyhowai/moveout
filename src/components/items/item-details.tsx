'use client'

import { Item, UrgencyLevel } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ItemDetailsProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export default function ItemDetails({ item, isOpen, onClose }: ItemDetailsProps) {
  const getUrgencyColor = (urgency: UrgencyLevel): string => {
    switch (urgency) {
      case UrgencyLevel.URGENT:
        return 'bg-red-100 text-red-800 border-red-200'
      case UrgencyLevel.MODERATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case UrgencyLevel.LOW:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyText = (urgency: UrgencyLevel): string => {
    switch (urgency) {
      case UrgencyLevel.URGENT:
        return 'Urgent - Needs pickup ASAP'
      case UrgencyLevel.MODERATE:
        return 'Moderate - Within a week'
      case UrgencyLevel.LOW:
        return 'Low Priority - Flexible timing'
      default:
        return urgency
    }
  }

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`
    window.open(url, '_blank')
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-6">
          {item.imageUrl ? (
            <div className="mb-6">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-6xl">📦</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(item.urgency)}`}
              >
                {getUrgencyText(item.urgency)}
              </span>
            </div>

            {item.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-gray-900 capitalize">{item.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Posted</span>
                  <p className="text-gray-900">{formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="text-gray-900">{formatDate(item.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className="text-gray-900">
                    {item.isAvailable ? 'Available' : 'No longer available'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <div className="flex items-start">
                <span className="inline-block w-5 h-5 mr-2 mt-0.5 text-gray-500">📍</span>
                <div>
                  <p className="text-gray-900">{item.address}</p>
                  <p className="text-sm text-gray-500">
                    {item.coordinates.lat.toFixed(6)}, {item.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name</span>
                  <p className="text-gray-900">{item.contactInfo.name}</p>
                </div>
                {item.contactInfo.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone</span>
                    <p className="text-gray-900">
                      <a
                        href={`tel:${item.contactInfo.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {item.contactInfo.phone}
                      </a>
                    </p>
                  </div>
                )}
                {item.contactInfo.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">
                      <a
                        href={`mailto:${item.contactInfo.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {item.contactInfo.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGetDirections}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Get Directions to This Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}