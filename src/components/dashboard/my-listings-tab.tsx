'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Item, ItemStatus, ItemCategory } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/status-badge'
import StatusSelector from '@/components/ui/status-selector'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ErrorMessage from '@/components/ui/error-message'

interface MyListingsTabProps {
  userId: string
}

export default function MyListingsTab({ userId }: MyListingsTabProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchUserItems()
  }, [userId])

  const fetchUserItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/items?ownerId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setItems(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch items')
      }
    } catch (error) {
      console.error('Error fetching user items:', error)
      setError(error instanceof Error ? error.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, isAvailable: newStatus === ItemStatus.AVAILABLE }
        : item
    ))
  }

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/items/${itemId}?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId))
        alert('Item deleted successfully!')
      } else {
        const error = await response.json()
        console.error('Error deleting item:', error)
        alert('Failed to delete item. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  const filteredItems = items.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  )

  const getStatusCounts = () => {
    const counts = {
      all: items.length,
      available: items.filter(item => item.status === ItemStatus.AVAILABLE).length,
      pending: items.filter(item => item.status === ItemStatus.PENDING).length,
      picked_up: items.filter(item => item.status === ItemStatus.PICKED_UP).length,
      expired: items.filter(item => item.status === ItemStatus.EXPIRED).length,
    }
    return counts
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" message="Loading your listings..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <ErrorMessage
          title="Failed to Load Listings"
          message={error}
          onRetry={fetchUserItems}
        />
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="text-lg font-semibold text-gray-900">
            My Listings ({statusCounts.all})
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-600">{statusCounts.available} Available</span>
            <span className="text-yellow-600">{statusCounts.pending} Pending</span>
            <span className="text-blue-600">{statusCounts.picked_up} Picked Up</span>
            {statusCounts.expired > 0 && (
              <span className="text-red-600">{statusCounts.expired} Expired</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>

          {/* Post new item */}
          <a
            href="/post"
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Post New Item
          </a>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ItemStatus | 'all')}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          <option value="all">All ({statusCounts.all})</option>
          <option value={ItemStatus.AVAILABLE}>Available ({statusCounts.available})</option>
          <option value={ItemStatus.PENDING}>Pending ({statusCounts.pending})</option>
          <option value={ItemStatus.PICKED_UP}>Picked Up ({statusCounts.picked_up})</option>
          <option value={ItemStatus.EXPIRED}>Expired ({statusCounts.expired})</option>
        </select>
      </div>

      {/* Items display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? 'No items posted yet' : `No ${statusFilter} items`}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "Start by posting your first item to the community."
              : "Try changing the filter to see items with different statuses."}
          </p>
          {statusFilter === 'all' && (
            <a
              href="/post"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Post Your First Item
            </a>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ItemCardProps {
  item: Item
  viewMode: 'grid' | 'list'
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void
  onDelete: (itemId: string, itemTitle: string) => void
}

function ItemCard({ item, viewMode, onStatusChange, onDelete }: ItemCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                <p className="text-sm text-gray-500">Posted {formatDate(item.createdAt)}</p>
              </div>
              <StatusBadge status={item.status} size="sm" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <StatusSelector
              itemId={item.id}
              currentStatus={item.status}
              ownerId={item.ownerId}
              onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
            />
            <button
              onClick={() => onDelete(item.id, item.title)}
              className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📦</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{item.title}</h3>
          <StatusBadge status={item.status} size="sm" />
        </div>

        <p className="text-sm text-gray-600 capitalize mb-2">{item.category}</p>
        <p className="text-sm text-gray-500 mb-4">Posted {formatDate(item.createdAt)}</p>

        {item.pickupDeadline && (
          <p className="text-sm text-amber-600 font-medium mb-4">
            ⏰ Pickup by {formatDate(item.pickupDeadline)}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <StatusSelector
            itemId={item.id}
            currentStatus={item.status}
            ownerId={item.ownerId}
            onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
          />
          
          <div className="flex items-center space-x-2">
            <a
              href={`/post?edit=${item.id}`}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
              title="Edit item"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </a>
            
            <button
              onClick={() => onDelete(item.id, item.title)}
              className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}