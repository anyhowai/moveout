import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Item, ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'items', params.id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const data = docSnap.data()
    
    // Handle Firestore timestamps properly
    let createdAt: Date
    let updatedAt: Date
    
    try {
      createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
    } catch (error) {
      createdAt = new Date()
    }
    
    try {
      updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
    } catch (error) {
      updatedAt = new Date()
    }
    
    const item: Item = {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
    } as Item

    const response: ApiResponse<Item> = {
      success: true,
      data: item,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching item:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch item',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const docRef = doc(db, 'items', params.id)

    // Check if item exists
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Update the item
    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date(),
    })

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: params.id },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating item:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update item',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'items', params.id)

    // Check if item exists
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Delete the item
    await deleteDoc(docRef)

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: params.id },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting item:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to delete item',
    }
    return NextResponse.json(response, { status: 500 })
  }
}