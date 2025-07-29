'use client'

import { useState, useEffect } from 'react'
import { UserReputation } from '@/lib/types'

interface UserReputationBadgeProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

export default function UserReputationBadge({
  userId,
  size = 'md',
  showDetails = false,
  className = '',
}: UserReputationBadgeProps) {
  const [reputation, setReputation] = useState<UserReputation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReputation()
  }, [userId])

  const fetchReputation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${userId}/reputation`)
      const result = await response.json()

      if (result.success) {
        setReputation(result.data)
      } else {
        setError(result.error || 'Failed to load reputation')
      }
    } catch (error) {
      console.error('Error fetching reputation:', error)
      setError('Failed to load reputation')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error || !reputation) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        New user
      </div>
    )
  }

  const { averageRating, totalRatings } = reputation

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const starSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className={`flex items-center ${starSizes[size]}`}>
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span className="text-yellow-400 relative">
            <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
            <span className="text-gray-300">★</span>
          </span>
        )}
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
    )
  }

  const getReputationBadgeColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 border-green-200'
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (rating >= 3.0) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getReputationText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4.0) return 'Very Good'
    if (rating >= 3.5) return 'Good'
    if (rating >= 3.0) return 'Fair'
    return 'Needs Improvement'
  }

  if (totalRatings === 0) {
    return (
      <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
        <span className="text-gray-500">New user</span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          No ratings yet
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
      {/* Stars and rating */}
      <div className="flex items-center space-x-1">
        {renderStars(averageRating, size)}
        <span className="font-medium text-gray-900">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-gray-500">
          ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* Reputation badge */}
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getReputationBadgeColor(averageRating)}`}>
        {getReputationText(averageRating)}
      </span>

      {/* Detailed breakdown if requested */}
      {showDetails && (
        <div className="ml-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Rating Breakdown</h4>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2 text-xs">
                <span className="w-4">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalRatings > 0 
                        ? `${(reputation.ratingBreakdown[star as keyof typeof reputation.ratingBreakdown] / totalRatings) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <span className="w-8 text-right">
                  {reputation.ratingBreakdown[star as keyof typeof reputation.ratingBreakdown]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
            {reputation.completedPickups} completed pickups
          </div>
        </div>
      )}
    </div>
  )
}