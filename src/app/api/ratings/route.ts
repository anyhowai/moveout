import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  getDoc,
  updateDoc,
  query, 
  where,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Rating, CreateRatingRequest, UserReputation, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const itemId = searchParams.get('itemId')

    if (!userId && !itemId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Either userId or itemId is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    let ratingsQuery
    if (userId) {
      // Get ratings for a specific user (as the rated user)
      ratingsQuery = query(
        collection(db, 'ratings'),
        where('ratedUserId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    } else if (itemId) {
      // Get ratings for a specific item
      ratingsQuery = query(
        collection(db, 'ratings'),
        where('itemId', '==', itemId),
        orderBy('createdAt', 'desc')
      )
    }

    const ratingsSnapshot = await getDocs(ratingsQuery!)
    const ratings: Rating[] = []

    ratingsSnapshot.forEach((doc) => {
      const data = doc.data()
      ratings.push({
        id: doc.id,
        itemId: data.itemId,
        raterId: data.raterId,
        ratedUserId: data.ratedUserId,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate() || new Date(),
        pickupExperience: data.pickupExperience,
      })
    })

    const response: ApiResponse<Rating[]> = {
      success: true,
      data: ratings,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch ratings',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRatingRequest & { raterId: string } = await request.json()
    const { itemId, raterId, ratedUserId, rating, review, pickupExperience } = body

    if (!itemId || !raterId || !ratedUserId || !rating || !pickupExperience) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: itemId, raterId, ratedUserId, rating, pickupExperience',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Rating must be an integer between 1 and 5',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (raterId === ratedUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Users cannot rate themselves',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if rating already exists for this item and rater
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('itemId', '==', itemId),
      where('raterId', '==', raterId)
    )
    const existingRatingSnapshot = await getDocs(existingRatingQuery)

    if (!existingRatingSnapshot.empty) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'You have already rated this pickup experience',
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Validate that the item exists and is picked up
    const itemDoc = await getDoc(doc(db, 'items', itemId))
    if (!itemDoc.exists()) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Item not found',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const itemData = itemDoc.data()
    if (itemData.status !== 'picked_up') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Can only rate completed pickups',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Use transaction to ensure data consistency
    const result = await runTransaction(db, async (transaction) => {
      // Create rating
      const ratingData = {
        itemId,
        raterId,
        ratedUserId,
        rating,
        review: review || null,
        pickupExperience,
        createdAt: serverTimestamp(),
      }

      const ratingRef = await addDoc(collection(db, 'ratings'), ratingData)

      // Update user reputation
      const reputationRef = doc(db, 'user_reputation', ratedUserId)
      const reputationDoc = await transaction.get(reputationRef)

      if (reputationDoc.exists()) {
        const currentReputation = reputationDoc.data() as UserReputation
        const newTotalRatings = currentReputation.totalRatings + 1
        const newAverageRating = 
          (currentReputation.averageRating * currentReputation.totalRatings + rating) / newTotalRatings

        const newRatingBreakdown = { ...currentReputation.ratingBreakdown }
        newRatingBreakdown[rating as keyof typeof newRatingBreakdown] += 1

        transaction.update(reputationRef, {
          averageRating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
          totalRatings: newTotalRatings,
          ratingBreakdown: newRatingBreakdown,
          lastUpdated: serverTimestamp(),
        })
      } else {
        // Create initial reputation
        const initialReputation: Omit<UserReputation, 'userId' | 'joinedDate' | 'lastUpdated'> = {
          averageRating: rating,
          totalRatings: 1,
          ratingBreakdown: {
            5: rating === 5 ? 1 : 0,
            4: rating === 4 ? 1 : 0,
            3: rating === 3 ? 1 : 0,
            2: rating === 2 ? 1 : 0,
            1: rating === 1 ? 1 : 0,
          },
          completedPickups: 1,
        }

        transaction.set(reputationRef, {
          ...initialReputation,
          userId: ratedUserId,
          joinedDate: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        })
      }

      return ratingRef.id
    })

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: result },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating rating:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create rating',
    }
    return NextResponse.json(response, { status: 500 })
  }
}