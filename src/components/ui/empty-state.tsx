'use client'

import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryActions?: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>
  suggestions?: string[]
}

export default function EmptyState({
  icon = '📦',
  title,
  description,
  primaryAction,
  secondaryActions = [],
  suggestions = []
}: EmptyStateProps) {
  const ActionButton = ({ action, isPrimary = false }: { action: any, isPrimary?: boolean }) => {
    const baseClasses = `px-4 py-2 rounded-md text-sm font-medium transition-colors btn-hover-lift ${
      isPrimary 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`

    if (action.href) {
      return (
        <Link href={action.href} className={baseClasses}>
          {action.label}
        </Link>
      )
    }

    return (
      <button onClick={action.onClick} className={baseClasses}>
        {action.label}
      </button>
    )
  }

  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          {primaryAction && (
            <ActionButton action={primaryAction} isPrimary />
          )}
          {secondaryActions.map((action, index) => (
            <ActionButton key={index} action={action} />
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Try these suggestions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Predefined empty states for common scenarios
export function NoItemsFound({ 
  hasFilters = false, 
  onClearFilters 
}: { 
  hasFilters?: boolean
  onClearFilters?: () => void 
}) {
  if (hasFilters) {
    return (
      <EmptyState
        icon="🔍"
        title="No items match your filters"
        description="Try adjusting your search criteria to find more items."
        primaryAction={{
          label: "Clear All Filters",
          onClick: onClearFilters
        }}
        secondaryActions={[
          {
            label: "Browse All Items",
            onClick: onClearFilters
          }
        ]}
        suggestions={[
          "Try a larger distance radius",
          "Remove category or urgency filters", 
          "Check your spelling in the search box"
        ]}
      />
    )
  }

  return (
    <EmptyState
      icon="📦"
      title="No items available yet"
      description="Be the first to help your community by posting an item!"
      primaryAction={{
        label: "Post Your First Item",
        href: "/post"
      }}
      secondaryActions={[
        {
          label: "Learn How It Works",
          href: "/about"
        }
      ]}
      suggestions={[
        "Post furniture you no longer need",
        "Share electronics before moving",
        "Help others find great items"
      ]}
    />
  )
}

export function LocationNeeded({ onEnableLocation }: { onEnableLocation?: () => void }) {
  return (
    <EmptyState
      icon="📍"
      title="Enable location to see nearby items"
      description="Allow location access to discover items close to you and get accurate distances."
      primaryAction={{
        label: "Enable Location",
        onClick: onEnableLocation
      }}
      secondaryActions={[
        {
          label: "Browse All Items",
          onClick: () => {} // Will show all items
        }
      ]}
      suggestions={[
        "Allow location in your browser settings",
        "Items will be sorted by distance",
        "You'll see pickup driving directions"
      ]}
    />
  )
}

export function OfflineState() {
  return (
    <EmptyState
      icon="📵"
      title="You're offline"
      description="Connect to the internet to see the latest items and post new ones."
      secondaryActions={[
        {
          label: "Try Again",
          onClick: () => window.location.reload()
        }
      ]}
      suggestions={[
        "Check your internet connection",
        "Try refreshing the page",
        "Some cached data may still be available"
      ]}
    />
  )
}