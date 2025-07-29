import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Item, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.getAll('ids')

    if (ids.length === 0) {
      const response: ApiResponse<Item[]> = {
        success: true,
        data: [],
      }
      return NextResponse.json(response)
    }

    // Firestore 'in' queries are limited to 10 items
    if (ids.length > 10) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Maximum 10 IDs allowed per request',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Query items by IDs
    const itemsQuery = query(
      collection(db, 'items'),
      where('__name__', 'in', ids)
    )

    const snapshot = await getDocs(itemsQuery)
    const items: Item[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      
      // Convert Firestore timestamps to Date objects
      const item: Item = {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        imageUrl: data.imageUrl,
        address: data.address,
        coordinates: data.coordinates,
        contactInfo: data.contactInfo,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isAvailable: data.isAvailable,
        status: data.status || 'available',
        ownerId: data.ownerId,
        pickupDeadline: data.pickupDeadline?.toDate() || undefined,
      }
      
      items.push(item)
    })

    const response: ApiResponse<Item[]> = {
      success: true,
      data: items,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching items in bulk:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch items',
    }
    return NextResponse.json(response, { status: 500 })
  }
}