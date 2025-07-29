'use client'

import { useState, useEffect } from 'react'
import { useFavorites } from '@/contexts/favorites-context'
import { Item } from '@/lib/types'
import ItemCard from '@/components/items/item-card'
import ItemDetails from '@/components/items/item-details'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ErrorMessage from '@/components/ui/error-message'

interface MyFavoritesTabProps {
  userId: string
}

export default function MyFavoritesTab({ userId }: MyFavoritesTabProps) {
  const { favorites, isLoading: favoritesLoading, refreshFavorites } = useFavorites()
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (favorites.size > 0) {
      fetchFavoriteItems()
    } else {
      setFavoriteItems([])
      setLoading(false)
    }
  }, [favorites])

  const fetchFavoriteItems = async () => {
    if (favorites.size === 0) {
      setFavoriteItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convert Set to array for the API call
      const favoriteIds = Array.from(favorites)
      
      // Fetch items in batches (Firestore has a limit of 10 items per 'in' query)
      const allItems: Item[] = []
      
      for (let i = 0; i < favoriteIds.length; i += 10) {
        const batch = favoriteIds.slice(i, i + 10)
        const params = new URLSearchParams()
        batch.forEach(id => params.append('ids', id))
        
        const response = await fetch(`/api/items/bulk?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          allItems.push(...result.data)
        }
      }

      setFavoriteItems(allItems)
    } catch (error) {
      console.error('Error fetching favorite items:', error)
      setError(error instanceof Error ? error.message : 'Failed to load favorite items')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    refreshFavorites()
    fetchFavoriteItems()
  }

  if (loading || favoritesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" message="Loading your favorites..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <ErrorMessage
          title="Failed to Load Favorites"
          message={error}
          onRetry={handleRefresh}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with view toggle and stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
          <p className="text-gray-600 mt-1">
            {favoriteItems.length} {favoriteItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🔄 Refresh
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {favoriteItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Start exploring items and click the heart icon to save your favorites here.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            Browse Items
          </a>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-gray-400 text-2xl">📦</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📍 {item.address}</span>
                        <span>🏷️ {item.category}</span>
                        <span className="capitalize">⚡ {item.urgency}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'available' ? 'Available' :
                         item.status === 'pending' ? 'Pending' :
                         item.status === 'picked_up' ? 'Picked Up' :
                         'Expired'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetails
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}