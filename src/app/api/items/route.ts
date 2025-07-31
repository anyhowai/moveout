import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Item, CreateItemRequest, ApiResponse, ItemStatus } from '@/lib/types'
import { geocodeAddress, generateId } from '@/lib/utils'
import { validateField, validateImageFile, itemFormRules } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase is configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Firebase configuration missing')
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const urgency = searchParams.get('urgency')
    const ownerId = searchParams.get('ownerId')

    // Build Firestore query
    let q = query(collection(db, 'items'))

    // If filtering by owner, get all their items regardless of availability
    if (ownerId) {
      q = query(q, where('ownerId', '==', ownerId))
    } else {
      // For public view, only show available items
      q = query(q, where('isAvailable', '==', true))
    }

    if (category) {
      q = query(q, where('category', '==', category))
    }
    if (urgency) {
      q = query(q, where('urgency', '==', urgency))
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    
    const items: Item[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
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
      
      items.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        pickupDeadline,
      } as Item)
    })

    const response: ApiResponse<Item[]> = {
      success: true,
      data: items,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching items:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch items',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const ownerId = formData.get('ownerId') as string
    const image = formData.get('image') as File | null
    const coordinatesStr = formData.get('coordinates') as string

    // Server-side validation using the same validation rules as client
    const validationErrors: string[] = []
    
    // Validate required fields first
    if (!title || !category || !urgency || !address || !contactName || !ownerId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields',
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate each field against rules
    const fieldsToValidate = {
      title,
      description: description || '',
      address,
      'contactInfo.name': contactName,
      'contactInfo.email': contactEmail || '',
      'contactInfo.phone': contactPhone || ''
    }
    
    for (const [fieldName, value] of Object.entries(fieldsToValidate)) {
      const rules = itemFormRules[fieldName as keyof typeof itemFormRules]
      if (rules) {
        const error = validateField(fieldName, value, rules)
        if (error) {
          validationErrors.push(error.message)
        }
      }
    }
    
    // Validate category and urgency values
    const validCategories = ['furniture', 'electronics', 'clothing', 'books', 'kitchen', 'decoration', 'other']
    const validUrgencies = ['low', 'moderate', 'urgent']
    
    if (!validCategories.includes(category)) {
      validationErrors.push('Invalid category')
    }
    
    if (!validUrgencies.includes(urgency)) {
      validationErrors.push('Invalid urgency level')
    }
    
    // Validate image file if provided
    if (image && image.size > 0) {
      const imageError = validateImageFile(image)
      if (imageError) {
        validationErrors.push(imageError.message)
      }
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Parse and validate pickup deadline if provided
    let pickupDeadline: Date | undefined
    if (pickupDeadlineStr && pickupDeadlineStr !== 'undefined') {
      pickupDeadline = new Date(pickupDeadlineStr)
      if (isNaN(pickupDeadline.getTime())) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid pickup deadline format',
        }
        return NextResponse.json(response, { status: 400 })
      }
      
      // Ensure pickup deadline is in the future
      if (pickupDeadline.getTime() <= Date.now()) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Pickup deadline must be in the future',
        }
        return NextResponse.json(response, { status: 400 })
      }
    }

    // Get coordinates - either from Places API or fallback to geocoding
    let coordinates: { lat: number; lng: number } | null = null
    
    // Try to parse coordinates from Places API first
    if (coordinatesStr && coordinatesStr !== 'undefined') {
      try {
        coordinates = JSON.parse(coordinatesStr)
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    // Fall back to geocoding if no coordinates provided
    if (!coordinates) {
      coordinates = await geocodeAddress(address)
    }
    
    // Use default coordinates if geocoding fails
    if (!coordinates) {
      coordinates = { lat: 37.7749, lng: -122.4194 }
    }

    let imageUrl: string | undefined

    // Upload image if provided
    if (image && image.size > 0) {
      try {
        const imageId = generateId()
        const imageRef = ref(storage, `items/${imageId}`)
        await uploadBytes(imageRef, image)
        imageUrl = await getDownloadURL(imageRef)
      } catch (error) {
        console.error('Error uploading image:', error)
        // Continue without image rather than failing the entire request
      }
    }

    // Create the item document - only include optional fields if they exist
    const itemData = {
      title,
      description: description || '',
      category,
      urgency,
      address,
      coordinates,
      contactInfo: {
        name: contactName,
        phone: contactPhone || '',
        email: contactEmail || '',
      },
      ownerId,
      status: ItemStatus.AVAILABLE,
      isAvailable: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(imageUrl && { imageUrl }), // Only add imageUrl if it exists
      ...(pickupDeadline && { pickupDeadline }), // Only add pickupDeadline if it exists
    }

    const docRef = await addDoc(collection(db, 'items'), itemData)

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: docRef.id },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create item',
    }
    return NextResponse.json(response, { status: 500 })
  }
}