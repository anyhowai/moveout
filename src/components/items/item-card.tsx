'use client'

import { memo, useCallback, useMemo } from 'react'
import { Item, UrgencyLevel } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/status-badge'
import FavoriteButton from '@/components/ui/favorite-button'
import UserReputationBadge from '@/components/ratings/user-reputation-badge'

interface ItemCardProps {
  item: Item & { distance?: { formatted: string } }
  onClick?: () => void
  showDistance?: boolean
  distance?: string
}

function ItemCard({ item, onClick, showDistance, distance }: ItemCardProps) {
  // Memoize urgency styling
  const urgencyStyles = useMemo(() => {
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
          return 'Urgent'
        case UrgencyLevel.MODERATE:
          return 'Moderate'
        case UrgencyLevel.LOW:
          return 'Low Priority'
        default:
          return urgency
      }
    }

    return {
      color: getUrgencyColor(item.urgency),
      text: getUrgencyText(item.urgency)
    }
  }, [item.urgency])

  // Memoized formatted dates
  const formattedCreatedAt = useMemo(() => formatDate(item.createdAt), [item.createdAt])
  const formattedPickupDeadline = useMemo(() => 
    item.pickupDeadline ? formatDate(item.pickupDeadline) : null, 
    [item.pickupDeadline]
  )

  // Stable event handlers
  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const handleGetDirections = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`
    window.open(url, '_blank')
  }, [item.address])

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="relative">
        {item.imageUrl ? (
          <div className="w-full h-48 bg-gray-200">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📦</div>
          </div>
        )}
        
        {/* Favorite button positioned in top-right corner */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-1 shadow-sm">
          <FavoriteButton itemId={item.id} size="sm" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex flex-col items-end space-y-1">
            <StatusBadge status={item.status} size="sm" />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${urgencyStyles.color}`}
            >
              {urgencyStyles.text}
            </span>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="inline-block w-4 h-4 mr-2">📍</span>
            <span className="truncate">{item.address}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <span className="inline-block w-4 h-4 mr-2">🏷️</span>
              <span className="capitalize">{item.category}</span>
            </div>
            
            {(showDistance && distance) || item.distance ? (
              <span className="text-blue-600 font-medium">
                {item.distance?.formatted || distance}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Posted {formattedCreatedAt}</span>
            <span>By {item.contactInfo.name}</span>
          </div>

          <div className="mt-3">
            <UserReputationBadge userId={item.ownerId} size="sm" />
          </div>

          {formattedPickupDeadline && (
            <div className="flex items-center text-sm text-amber-600 font-medium">
              <span className="inline-block w-4 h-4 mr-2">⏰</span>
              <span>Pickup by {formattedPickupDeadline}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleGetDirections}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ItemCard)