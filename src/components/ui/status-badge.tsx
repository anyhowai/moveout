'use client'

import { ItemStatus } from '@/lib/types'
import { getStatusConfig } from '@/lib/status-utils'

interface StatusBadgeProps {
  status: ItemStatus
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export default function StatusBadge({ 
  status, 
  size = 'md', 
  showDescription = false,
  className = '' 
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${config.bgColor} ${config.borderColor} ${sizeClasses[size]} ${className}`}
      title={showDescription ? config.description : undefined}
    >
      {config.label}
    </span>
  )
}