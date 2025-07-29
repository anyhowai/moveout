'use client'

import { useState } from 'react'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface FavoriteButtonProps {
  itemId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTooltip?: boolean
}

export default function FavoriteButton({ 
  itemId, 
  size = 'md', 
  className = '', 
  showTooltip = true 
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const isFav = isFavorite(itemId)

  const sizeClasses = {
    sm: 'w-6 h-6 text-base',
    md: 'w-8 h-8 text-lg',
    lg: 'w-10 h-10 text-xl'
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 2000)
      return
    }

    if (isLoading) return

    setIsAnimating(true)
    
    try {
      if (isFav) {
        await removeFavorite(itemId)
      } else {
        await addFavorite(itemId)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`
          relative inline-flex items-center justify-center rounded-full 
          transition-all duration-200 hover:scale-110 active:scale-95
          ${sizeClasses[size]}
          ${isFav 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-400'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        title={showTooltip ? (isFav ? 'Remove from favorites' : 'Add to favorites') : undefined}
      >
        {/* Heart icon with animation */}
        <div className={`
          transition-transform duration-300 ease-out
          ${isAnimating ? 'animate-bounce scale-125' : ''}
        `}>
          {isFav ? (
            // Filled heart
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            // Outline heart
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-full h-full"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </div>

        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
          </div>
        )}
      </button>

      {/* Login prompt tooltip */}
      {showLoginPrompt && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Please sign in to save favorites
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}