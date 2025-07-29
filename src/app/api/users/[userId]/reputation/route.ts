import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserReputation, ApiResponse } from '@/lib/types'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = params

    if (!userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get user reputation
    const reputationRef = doc(db, 'user_reputation', userId)
    const reputationDoc = await getDoc(reputationRef)

    if (!reputationDoc.exists()) {
      // Return default reputation for new users
      const defaultReputation: Omit<UserReputation, 'lastUpdated' | 'joinedDate'> = {
        userId,
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        completedPickups: 0,
      }

      const response: ApiResponse<Partial<UserReputation>> = {
        success: true,
        data: defaultReputation,
      }

      return NextResponse.json(response)
    }

    const reputationData = reputationDoc.data()
    const reputation: UserReputation = {
      userId: reputationData.userId,
      averageRating: reputationData.averageRating,
      totalRatings: reputationData.totalRatings,
      ratingBreakdown: reputationData.ratingBreakdown,
      completedPickups: reputationData.completedPickups,
      joinedDate: reputationData.joinedDate?.toDate() || new Date(),
      lastUpdated: reputationData.lastUpdated?.toDate() || new Date(),
    }

    const response: ApiResponse<UserReputation> = {
      success: true,
      data: reputation,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user reputation:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch user reputation',
    }
    return NextResponse.json(response, { status: 500 })
  }
}