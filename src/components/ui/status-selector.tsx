'use client'

import { useState } from 'react'
import { ItemStatus } from '@/lib/types'
import { getStatusOptions, canChangeStatus } from '@/lib/status-utils'
import { useAuth } from '@/contexts/auth-context'

interface StatusSelectorProps {
  itemId: string
  currentStatus: ItemStatus
  ownerId: string
  onStatusChange?: (newStatus: ItemStatus) => void
  className?: string
}

export default function StatusSelector({
  itemId,
  currentStatus,
  ownerId,
  onStatusChange,
  className = ''
}: StatusSelectorProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const isOwner = user?.uid === ownerId

  const handleStatusChange = async (newStatus: ItemStatus) => {
    if (!user || !canChangeStatus(currentStatus, newStatus, isOwner)) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          currentUserId: user.uid,
        }),
      })

      if (response.ok) {
        onStatusChange?.(newStatus)
      } else {
        const error = await response.json()
        console.error('Error updating status:', error)
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user) return null

  const statusOptions = getStatusOptions(isOwner)
  const availableOptions = statusOptions.filter(option => 
    canChangeStatus(currentStatus, option.value, isOwner) || option.value === currentStatus
  )

  if (availableOptions.length <= 1) return null

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Status:
      </label>
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as ItemStatus)}
        disabled={isUpdating}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-gray-900"
      >
        {availableOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
    </div>
  )
}