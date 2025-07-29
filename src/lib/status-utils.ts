import { ItemStatus } from './types'

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

export const STATUS_CONFIG: Record<ItemStatus, StatusConfig> = {
  [ItemStatus.AVAILABLE]: {
    label: 'Available',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Ready for pickup'
  },
  [ItemStatus.PENDING]: {
    label: 'Pickup Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    description: 'Pickup arranged, awaiting completion'
  },
  [ItemStatus.PICKED_UP]: {
    label: 'Picked Up',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Successfully collected'
  },
  [ItemStatus.EXPIRED]: {
    label: 'Expired',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Past pickup deadline'
  }
}

export function getStatusConfig(status: ItemStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG[ItemStatus.AVAILABLE]
}

export function getStatusColor(status: ItemStatus): string {
  const config = getStatusConfig(status)
  return `${config.color} ${config.bgColor} ${config.borderColor}`
}

export function isItemExpired(item: { pickupDeadline?: Date; status: ItemStatus }): boolean {
  if (!item.pickupDeadline) return false
  if (item.status === ItemStatus.PICKED_UP) return false
  
  const now = new Date()
  return item.pickupDeadline < now
}

export function getStatusOptions(isOwner: boolean = false): Array<{ value: ItemStatus; label: string }> {
  const options = [
    { value: ItemStatus.AVAILABLE, label: 'Available' },
    { value: ItemStatus.PENDING, label: 'Pickup Pending' },
  ]

  if (isOwner) {
    options.push({ value: ItemStatus.PICKED_UP, label: 'Picked Up' })
  }

  return options
}

export function canChangeStatus(
  currentStatus: ItemStatus, 
  newStatus: ItemStatus, 
  isOwner: boolean = false
): boolean {
  // Owners can change any status except from PICKED_UP
  if (isOwner && currentStatus !== ItemStatus.PICKED_UP) {
    return true
  }

  // Non-owners can only request pickup (Available -> Pending)
  if (!isOwner) {
    return currentStatus === ItemStatus.AVAILABLE && newStatus === ItemStatus.PENDING
  }

  return false
}