'use client'

import { useState, useEffect, useMemo } from 'react'
import MapView from '@/components/map/map-view'
import ItemCard from '@/components/items/item-card'
import ItemDetails from '@/components/items/item-details'
import SearchFilters from '@/components/ui/search-filters'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ErrorMessage from '@/components/ui/error-message'
import MessageModal from '@/components/messages/message-modal'
import { useItemExpiration } from '@/hooks/use-item-expiration'
import { useFavorites } from '@/contexts/favorites-context'
import { filterItemsByDistance, type Coordinates } from '@/lib/geolocation-utils'
import { Item, ItemCategory, UrgencyLevel } from '@/lib/types'

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [messageItem, setMessageItem] = useState<Item | null>(null)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'all'>('all')
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  // Set up item expiration checking
  useItemExpiration({
    enabled: true,
    intervalMinutes: 5, // Check every 5 minutes
    onItemsExpired: () => {
      // Refresh the items list when items expire
      fetchItems()
    },
  })

  useEffect(() => {
    fetchItems()
  }, [])

  // Handle favorite toggle events from map info windows
  useEffect(() => {
    const handleToggleFavorite = async (event: Event) => {
      const customEvent = event as CustomEvent
      const itemId = customEvent.detail
      if (isFavorite(itemId)) {
        await removeFavorite(itemId)
      } else {
        await addFavorite(itemId)
      }
    }

    window.addEventListener('toggleFavorite', handleToggleFavorite)
    return () => {
      window.removeEventListener('toggleFavorite', handleToggleFavorite)
    }
  }, [addFavorite, removeFavorite, isFavorite])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/items')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setItems(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch items')
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setError(error instanceof Error ? error.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on search criteria
  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesUrgency = selectedUrgency === 'all' || item.urgency === selectedUrgency
      
      return matchesSearch && matchesCategory && matchesUrgency && item.isAvailable
    })

    // Apply distance filtering if location and distance are available
    if (userLocation && selectedDistance) {
      filtered = filterItemsByDistance(filtered, userLocation, selectedDistance)
    }

    return filtered
  }, [items, searchTerm, selectedCategory, selectedUrgency, userLocation, selectedDistance])

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
  }

  const handleMapMarkerClick = (item: Item) => {
    // For map clicks, we want to show the message modal directly
    setMessageItem(item)
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Find Items Near You
          </h2>
          <p className="text-gray-600">
            Browse furniture and items available for pickup.
          </p>
        </div>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" message="Loading items..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Find Items Near You
          </h2>
          <p className="text-gray-600">
            Browse furniture and items available for pickup.
          </p>
        </div>
        <div className="flex items-center justify-center h-96">
          <ErrorMessage
            title="Failed to Load Items"
            message={error}
            onRetry={fetchItems}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Items Near You
        </h2>
        <p className="text-gray-600">
          Browse furniture and items available for pickup.
        </p>
      </div>

      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedUrgency={selectedUrgency}
        onUrgencyChange={setSelectedUrgency}
        itemCount={filteredItems.length}
        onDistanceChange={setSelectedDistance}
        onLocationChange={setUserLocation}
        selectedDistance={selectedDistance}
        showDistanceFilter={true}
      />

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>
      
      {viewMode === 'map' ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="h-96 lg:h-[600px]">
            <MapView items={filteredItems} onMarkerClick={handleMapMarkerClick} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">
                {items.length === 0 
                  ? "Be the first to post an item!" 
                  : "Try adjusting your search filters."}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">Urgent</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Needs pickup ASAP</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">Moderate</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Pickup within a week</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">Low</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Flexible timing</p>
        </div>
      </div>

      {selectedItem && (
        <ItemDetails
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {messageItem && (
        <MessageModal
          isOpen={!!messageItem}
          onClose={() => setMessageItem(null)}
          item={messageItem}
        />
      )}
    </div>
  )
}