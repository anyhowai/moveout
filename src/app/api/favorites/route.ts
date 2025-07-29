import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  addDoc, 
  deleteDoc,
  getDocs, 
  doc,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ApiResponse } from '@/lib/types'

interface Favorite {
  id: string
  userId: string
  itemId: string
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get user's favorites
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    )

    const favoritesSnapshot = await getDocs(favoritesQuery)
    const favorites: Favorite[] = []

    favoritesSnapshot.forEach((doc) => {
      const data = doc.data()
      favorites.push({
        id: doc.id,
        userId: data.userId,
        itemId: data.itemId,
        createdAt: data.createdAt?.toDate() || new Date(),
      })
    })

    const response: ApiResponse<Favorite[]> = {
      success: true,
      data: favorites,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch favorites',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId } = body

    if (!userId || !itemId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID and Item ID are required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if favorite already exists
    const existingQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    )

    const existingSnapshot = await getDocs(existingQuery)
    
    if (!existingSnapshot.empty) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item is already in favorites',
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Add to favorites
    const favoriteData = {
      userId,
      itemId,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'favorites'), favoriteData)

    const response: ApiResponse<{ id: string; itemId: string }> = {
      success: true,
      data: { id: docRef.id, itemId },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error adding favorite:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to add favorite',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const itemId = searchParams.get('itemId')

    if (!userId || !itemId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID and Item ID are required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Find the favorite to delete
    const favoriteQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    )

    const favoriteSnapshot = await getDocs(favoriteQuery)

    if (favoriteSnapshot.empty) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Favorite not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Delete the favorite
    const favoriteDoc = favoriteSnapshot.docs[0]
    await deleteDoc(doc(db, 'favorites', favoriteDoc.id))

    const response: ApiResponse<{ itemId: string }> = {
      success: true,
      data: { itemId },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error removing favorite:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to remove favorite',
    }
    return NextResponse.json(response, { status: 500 })
  }
}