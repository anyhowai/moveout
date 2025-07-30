'use client'

import { useState } from 'react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  showDetails?: boolean
  details?: string
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary'
  }>
}

export default function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  showDetails = false,
  details,
  actions = []
}: ErrorMessageProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    
    setRetrying(true)
    try {
      await onRetry()
    } catch (error) {
      // Error will be handled by the parent component
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {showDetails && details && (
        <div className="mb-4">
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showFullDetails ? 'Hide' : 'Show'} technical details
          </button>
          {showFullDetails && (
            <div className="mt-2 p-3 bg-gray-100 rounded text-left text-xs text-gray-700 font-mono">
              {details}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {retrying && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
        
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              action.variant === 'secondary'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}