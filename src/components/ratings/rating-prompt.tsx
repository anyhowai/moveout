'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Item } from '@/lib/types'

interface RatingPromptProps {
  item: Item
  otherUserId: string
  otherUserName: string
  onRatingClick: () => void
  className?: string
}

export default function RatingPrompt({
  item,
  otherUserId,
  otherUserName,
  onRatingClick,
  className = '',
}: RatingPromptProps) {
  const { user } = useAuth()
  const [hasRated, setHasRated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkIfRated()
  }, [item.id, user?.id])

  const checkIfRated = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/ratings?itemId=${item.id}`)
      const result = await response.json()

      if (result.success) {
        // Check if current user has already rated this item
        const userRating = result.data?.find((rating: any) => rating.raterId === user.id)
        setHasRated(!!userRating)
      }
    } catch (error) {
      console.error('Error checking rating status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only show prompt if item is picked up and user hasn't rated yet
  if (item.status !== 'picked_up' || hasRated || isLoading || !user) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">⭐</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            How was your pickup experience?
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Help others by sharing your experience with {otherUserName}.
          </p>
          
          <button
            onClick={onRatingClick}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="mr-1">⭐</span>
            Rate Experience
          </button>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setHasRated(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}