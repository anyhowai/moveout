'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Item, PickupExperience, CreateRatingRequest } from '@/lib/types'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item
  ratedUserId: string
  ratedUserName: string
  onRatingSubmitted?: () => void
}

export default function RatingModal({
  isOpen,
  onClose,
  item,
  ratedUserId,
  ratedUserName,
  onRatingSubmitted,
}: RatingModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [pickupExperience, setPickupExperience] = useState<PickupExperience | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be signed in to submit a rating')
      return
    }

    if (rating === 0) {
      setError('Please select a star rating')
      return
    }

    if (!pickupExperience) {
      setError('Please select your pickup experience')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const ratingData: CreateRatingRequest & { raterId: string } = {
        itemId: item.id,
        raterId: user.id,
        ratedUserId,
        rating,
        review: review.trim() || undefined,
        pickupExperience: pickupExperience as PickupExperience,
      }

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      })

      const result = await response.json()

      if (result.success) {
        onRatingSubmitted?.()
        onClose()
        // Reset form
        setRating(0)
        setReview('')
        setPickupExperience('')
      } else {
        setError(result.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      setError('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (starRating: number) => {
    switch (starRating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return ''
    }
  }

  const getPickupExperienceLabel = (experience: PickupExperience) => {
    switch (experience) {
      case PickupExperience.EXCELLENT: return 'Excellent - Everything went perfectly'
      case PickupExperience.GOOD: return 'Good - Minor issues but overall positive'
      case PickupExperience.FAIR: return 'Fair - Some problems but manageable'
      case PickupExperience.POOR: return 'Poor - Significant issues encountered'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rate Your Experience
              </h2>
              <p className="text-gray-600">
                How was your pickup experience with <strong>{ratedUserName}</strong>?
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xl">📦</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.address}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="text-3xl transition-colors duration-150 hover:scale-110 transform"
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {(hoveredRating || rating) > 0 && (
                <p className="text-sm text-gray-600">
                  {getRatingText(hoveredRating || rating)}
                </p>
              )}
            </div>

            {/* Pickup Experience */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pickup Experience
              </label>
              <div className="space-y-2">
                {Object.values(PickupExperience).map((experience) => (
                  <label key={experience} className="flex items-center">
                    <input
                      type="radio"
                      name="pickupExperience"
                      value={experience}
                      checked={pickupExperience === experience}
                      onChange={(e) => setPickupExperience(e.target.value as PickupExperience)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {getPickupExperienceLabel(experience)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Written Review (Optional)
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share details about your pickup experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {review.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !pickupExperience}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}