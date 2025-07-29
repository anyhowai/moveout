import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
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
    
    let pickupDeadline: Date | undefined
    try {
      pickupDeadline = data.pickupDeadline?.toDate ? data.pickupDeadline.toDate() : undefined
    } catch (error) {
      pickupDeadline = undefined
    }

    const item: Item = {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
      pickupDeadline,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const urgency = formData.get('urgency') as string
    const address = formData.get('address') as string
    const contactName = formData.get('contactInfo.name') as string
    const contactPhone = formData.get('contactInfo.phone') as string
    const contactEmail = formData.get('contactInfo.email') as string
    const pickupDeadlineStr = formData.get('pickupDeadline') as string
    const currentUserId = formData.get('currentUserId') as string

    // Verify the item exists and user owns it
    const itemDoc = await getDoc(doc(db, 'items', params.id))
    
    if (!itemDoc.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.ownerId !== currentUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized - you can only edit your own items',
      }
      return NextResponse.json(response, { status: 403 })
    }

    if (!title || !category || !urgency || !address || !contactName) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Parse pickup deadline if provided
    let pickupDeadline: Date | undefined
    if (pickupDeadlineStr && pickupDeadlineStr !== 'undefined') {
      pickupDeadline = new Date(pickupDeadlineStr)
      if (isNaN(pickupDeadline.getTime())) {
        pickupDeadline = undefined
      }
    }

    // Prepare update data
    const updateData: any = {
      title,
      description: description || '',
      category,
      urgency,
      address,
      contactInfo: {
        name: contactName,
        phone: contactPhone || '',
        email: contactEmail || '',
      },
      updatedAt: serverTimestamp(),
    }

    // Only add pickupDeadline if it exists
    if (pickupDeadline) {
      updateData.pickupDeadline = pickupDeadline
    }

    // Update the document
    await updateDoc(doc(db, 'items', params.id), updateData)

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
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('userId')

    if (!currentUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Verify the item exists and user owns it
    const itemDoc = await getDoc(doc(db, 'items', params.id))
    
    if (!itemDoc.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.ownerId !== currentUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized - you can only delete your own items',
      }
      return NextResponse.json(response, { status: 403 })
    }

    // Delete associated image if it exists
    if (itemData.imageUrl) {
      try {
        // Create a reference to the image in storage
        // Note: This assumes the image is stored with the item ID as the filename
        const imageRef = ref(storage, `items/${params.id}`)
        await deleteObject(imageRef)
      } catch (error) {
        console.error('Error deleting image:', error)
        // Continue with item deletion even if image deletion fails
      }
    }

    // Delete the item document
    await deleteDoc(doc(db, 'items', params.id))

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, currentUserId } = body

    if (!currentUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Verify the item exists and user owns it
    const itemDoc = await getDoc(doc(db, 'items', params.id))
    
    if (!itemDoc.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.ownerId !== currentUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unauthorized - you can only update your own items',
      }
      return NextResponse.json(response, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp(),
    }

    // Add fields that are being updated
    if (status !== undefined) {
      updateData.status = status
      updateData.isAvailable = status === 'available'
    }

    // Update the document
    await updateDoc(doc(db, 'items', params.id), updateData)

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: params.id },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating item status:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update item status',
    }
    return NextResponse.json(response, { status: 500 })
  }
}