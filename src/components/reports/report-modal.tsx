'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Item, ReportCategory, CreateReportRequest } from '@/lib/types'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  item?: Item
  userId?: string
  userName?: string
  onReportSubmitted?: () => void
}

export default function ReportModal({
  isOpen,
  onClose,
  item,
  userId,
  userName,
  onReportSubmitted,
}: ReportModalProps) {
  const { user } = useAuth()
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const reportCategories = [
    { value: ReportCategory.SPAM, label: 'Spam or duplicate posting' },
    { value: ReportCategory.INAPPROPRIATE_CONTENT, label: 'Inappropriate content or images' },
    { value: ReportCategory.FRAUD, label: 'Fraud or scam' },
    { value: ReportCategory.HARASSMENT, label: 'Harassment or abuse' },
    { value: ReportCategory.MISLEADING, label: 'Misleading or false information' },
    { value: ReportCategory.SAFETY_CONCERN, label: 'Safety concern' },
    { value: ReportCategory.COPYRIGHT, label: 'Copyright violation' },
    { value: ReportCategory.OTHER, label: 'Other (please specify)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be signed in to submit a report')
      return
    }

    if (!category || !reason.trim()) {
      setError('Please select a category and provide a reason')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const reportData: CreateReportRequest & { reporterId: string } = {
        reporterId: user.uid,
        ...(item && { reportedItemId: item.id }),
        ...(userId && { reportedUserId: userId }),
        category: category as ReportCategory,
        reason: reason.trim(),
        description: description.trim() || undefined,
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      const result = await response.json()

      if (result.success) {
        onReportSubmitted?.()
        onClose()
        // Reset form
        setCategory('')
        setReason('')
        setDescription('')
      } else {
        setError(result.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportTarget = item ? `item "${item.title}"` : `user ${userName || 'this user'}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Report Content
              </h2>
              <p className="text-gray-600">
                Report {reportTarget} for inappropriate content or behavior.
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

          {/* Content Info */}
          {item && (
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
                  <p className="text-sm text-gray-600">By {item.contactInfo.name}</p>
                  <p className="text-sm text-gray-500">📍 {item.address}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's the issue? *
              </label>
              <div className="space-y-2">
                {reportCategories.map((cat) => (
                  <label key={cat.value} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value as ReportCategory)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Brief description of the issue *
              </label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe the specific issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/200 characters
              </p>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context that might help our review..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> False reports may result in account restrictions. 
                Reports are reviewed by our moderation team and action will be taken if violations are found.
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
                disabled={isSubmitting || !category || !reason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}