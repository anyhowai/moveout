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
  coordinates?: {
    lat: number
    lng: number
  }
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
  buyerName?: string
  sellerName?: string
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
  unreadCount?: {
    [userId: string]: number
  }
}

export interface Rating {
  id: string
  itemId: string
  raterId: string
  ratedUserId: string
  rating: number // 1-5 stars
  review?: string
  createdAt: Date
  pickupExperience: PickupExperience
}

export enum PickupExperience {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export interface UserReputation {
  userId: string
  averageRating: number
  totalRatings: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  completedPickups: number
  joinedDate: Date
  lastUpdated: Date
}

export interface CreateRatingRequest {
  itemId: string
  ratedUserId: string
  rating: number
  review?: string
  pickupExperience: PickupExperience
}

export interface Report {
  id: string
  reporterId: string
  reportedItemId?: string
  reportedUserId?: string
  category: ReportCategory
  reason: string
  description?: string
  status: ReportStatus
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  moderatorNotes?: string
}

export enum ReportCategory {
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FRAUD = 'fraud',
  HARASSMENT = 'harassment',
  MISLEADING = 'misleading',
  SAFETY_CONCERN = 'safety_concern',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface CreateReportRequest {
  reportedItemId?: string
  reportedUserId?: string
  category: ReportCategory
  reason: string
  description?: string
}