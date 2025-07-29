import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  getDocs, 
  updateDoc,
  doc,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ItemStatus, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // This endpoint will be called periodically to check for expired items
    const now = new Date()
    
    // Query items that have pickup deadlines and are still available or pending
    const itemsQuery = query(
      collection(db, 'items'),
      where('pickupDeadline', '<=', now),
      where('status', 'in', [ItemStatus.AVAILABLE, ItemStatus.PENDING])
    )

    const itemsSnapshot = await getDocs(itemsQuery)
    const expiredItems: string[] = []

    // Update expired items
    const updatePromises = itemsSnapshot.docs.map(async (itemDoc) => {
      const itemData = itemDoc.data()
      
      // Double-check the item hasn't been picked up
      if (itemData.status !== ItemStatus.PICKED_UP) {
        await updateDoc(doc(db, 'items', itemDoc.id), {
          status: ItemStatus.EXPIRED,
          isAvailable: false,
          updatedAt: serverTimestamp(),
        })
        expiredItems.push(itemDoc.id)
      }
    })

    await Promise.all(updatePromises)

    const response: ApiResponse<{ expiredCount: number; expiredItems: string[] }> = {
      success: true,
      data: {
        expiredCount: expiredItems.length,
        expiredItems,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error expiring items:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to expire items',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// Manual expiration check endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkOnly = searchParams.get('check') === 'true'

    const now = new Date()
    
    // Query items that have pickup deadlines and are still available or pending
    const itemsQuery = query(
      collection(db, 'items'),
      where('pickupDeadline', '<=', now),
      where('status', 'in', [ItemStatus.AVAILABLE, ItemStatus.PENDING])
    )

    const itemsSnapshot = await getDocs(itemsQuery)
    const expirableItems = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      pickupDeadline: doc.data().pickupDeadline?.toDate(),
      status: doc.data().status,
    }))

    if (checkOnly) {
      const response: ApiResponse<{ expirableItems: typeof expirableItems }> = {
        success: true,
        data: { expirableItems },
      }
      return NextResponse.json(response)
    }

    // If not check-only, proceed with expiration
    const expiredItems: string[] = []
    const updatePromises = itemsSnapshot.docs.map(async (itemDoc) => {
      const itemData = itemDoc.data()
      
      if (itemData.status !== ItemStatus.PICKED_UP) {
        await updateDoc(doc(db, 'items', itemDoc.id), {
          status: ItemStatus.EXPIRED,
          isAvailable: false,
          updatedAt: serverTimestamp(),
        })
        expiredItems.push(itemDoc.id)
      }
    })

    await Promise.all(updatePromises)

    const response: ApiResponse<{ expiredCount: number; expiredItems: string[] }> = {
      success: true,
      data: {
        expiredCount: expiredItems.length,
        expiredItems,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error checking/expiring items:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to check/expire items',
    }
    return NextResponse.json(response, { status: 500 })
  }
}