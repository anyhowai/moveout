export interface Item {
  id: string
  title: string
  description?: string
  category: ItemCategory
  urgency: UrgencyLevel
  imageUrl?: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  contactInfo: {
    name: string
    phone?: string
    email?: string
  }
  createdAt: Date
  updatedAt: Date
  isAvailable: boolean
  status: ItemStatus
  ownerId: string
  pickupDeadline?: Date
}

export enum ItemCategory {
  FURNITURE = 'furniture',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  BOOKS = 'books',
  KITCHEN = 'kitchen',
  DECORATION = 'decoration',
  OTHER = 'other',
}

export enum UrgencyLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  URGENT = 'urgent',
}

export enum ItemStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  EXPIRED = 'expired',
}

export interface CreateItemRequest {
  title: string
  description?: string
  category: ItemCategory
  urgency: UrgencyLevel
  image?: File
  address: string
  contactInfo: {
    name: string
    phone?: string
    email?: string
  }
  pickupDeadline?: Date
}

export interface MapMarker {
  id: string
  position: google.maps.LatLngLiteral
  title: string
  urgency: UrgencyLevel
  item: Item
}

export interface DirectionsRequest {
  origin: string
  destination: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  phone?: string
  createdAt: Date
  lastSeen: Date
  rating?: number
  completedPickups: number
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  recipientId: string
  content: string
  createdAt: Date
  isRead: boolean
}

export interface MessageThread {
  id: string
  itemId: string
  itemTitle?: string
  buyerId: string
  sellerId: string
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
  unreadCount?: {
    [userId: string]: number
  }
}