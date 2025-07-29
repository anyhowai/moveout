'use client'

import { ItemCategory, UrgencyLevel } from '@/lib/types'
import DistanceFilter from '@/components/ui/distance-filter'

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: ItemCategory | 'all'
  onCategoryChange: (category: ItemCategory | 'all') => void
  selectedUrgency: UrgencyLevel | 'all'
  onUrgencyChange: (urgency: UrgencyLevel | 'all') => void
  itemCount: number
  onDistanceChange?: (distance: number | null) => void
  onLocationChange?: (coordinates: { lat: number; lng: number } | null) => void
  selectedDistance?: number | null
  showDistanceFilter?: boolean
}

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  itemCount,
  onDistanceChange,
  onLocationChange,
  selectedDistance,
  showDistanceFilter = true,
}: SearchFiltersProps) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: ItemCategory.FURNITURE, label: 'Furniture' },
    { value: ItemCategory.ELECTRONICS, label: 'Electronics' },
    { value: ItemCategory.CLOTHING, label: 'Clothing' },
    { value: ItemCategory.BOOKS, label: 'Books' },
    { value: ItemCategory.KITCHEN, label: 'Kitchen' },
    { value: ItemCategory.DECORATION, label: 'Decoration' },
    { value: ItemCategory.OTHER, label: 'Other' },
  ]

  const urgencyLevels = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: UrgencyLevel.URGENT, label: 'Urgent', color: 'text-red-600' },
    { value: UrgencyLevel.MODERATE, label: 'Moderate', color: 'text-yellow-600' },
    { value: UrgencyLevel.LOW, label: 'Low Priority', color: 'text-green-600' },
  ]

  const handleClearFilters = () => {
    onSearchChange('')
    onCategoryChange('all')
    onUrgencyChange('all')
    if (onDistanceChange) {
      onDistanceChange(null)
    }
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedUrgency !== 'all' || (selectedDistance !== null && selectedDistance !== undefined)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-0 flex-1 sm:flex-none sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as ItemCategory | 'all')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0 flex-1 sm:flex-none sm:w-48">
            <select
              value={selectedUrgency}
              onChange={(e) => onUrgencyChange(e.target.value as UrgencyLevel | 'all')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {urgencyLevels.map((urgency) => (
                <option key={urgency.value} value={urgency.value}>
                  {urgency.label}
                </option>
              ))}
            </select>
          </div>

          {showDistanceFilter && onDistanceChange && onLocationChange && (
            <div className="min-w-0 flex-1 sm:flex-none sm:w-64">
              <DistanceFilter
                onDistanceChange={onDistanceChange}
                onLocationChange={onLocationChange}
              />
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} found
          {hasActiveFilters && ' with current filters'}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            <div className="flex gap-1">
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {categories.find(c => c.value === selectedCategory)?.label}
                </span>
              )}
              {selectedUrgency !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {urgencyLevels.find(u => u.value === selectedUrgency)?.label}
                </span>
              )}
              {selectedDistance && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Within {selectedDistance} miles
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}