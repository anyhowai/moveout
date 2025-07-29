import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Report, CreateReportRequest, ReportStatus, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reporterId = searchParams.get('reporterId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let reportsQuery = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    )

    if (reporterId) {
      reportsQuery = query(
        collection(db, 'reports'),
        where('reporterId', '==', reporterId),
        orderBy('createdAt', 'desc')
      )
    }

    // Apply additional filters if provided
    if (status) {
      reportsQuery = query(
        reportsQuery,
        where('status', '==', status)
      )
    }

    if (category) {
      reportsQuery = query(
        reportsQuery,
        where('category', '==', category)
      )
    }

    const reportsSnapshot = await getDocs(reportsQuery)
    const reports: Report[] = []

    reportsSnapshot.forEach((doc) => {
      const data = doc.data()
      reports.push({
        id: doc.id,
        reporterId: data.reporterId,
        reportedItemId: data.reportedItemId,
        reportedUserId: data.reportedUserId,
        category: data.category,
        reason: data.reason,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        resolvedAt: data.resolvedAt?.toDate(),
        resolvedBy: data.resolvedBy,
        moderatorNotes: data.moderatorNotes,
      })
    })

    const response: ApiResponse<Report[]> = {
      success: true,
      data: reports,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching reports:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch reports',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReportRequest & { reporterId: string } = await request.json()
    const { 
      reporterId, 
      reportedItemId, 
      reportedUserId, 
      category, 
      reason, 
      description 
    } = body

    if (!reporterId || !category || !reason) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: reporterId, category, reason',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!reportedItemId && !reportedUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Must specify either reportedItemId or reportedUserId',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (reporterId === reportedUserId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Users cannot report themselves',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check for duplicate reports (same reporter, same target, same category)
    let duplicateQuery
    if (reportedItemId) {
      duplicateQuery = query(
        collection(db, 'reports'),
        where('reporterId', '==', reporterId),
        where('reportedItemId', '==', reportedItemId),
        where('category', '==', category)
      )
    } else {
      duplicateQuery = query(
        collection(db, 'reports'),
        where('reporterId', '==', reporterId),
        where('reportedUserId', '==', reportedUserId),
        where('category', '==', category)
      )
    }

    const duplicateSnapshot = await getDocs(duplicateQuery)
    if (!duplicateSnapshot.empty) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'You have already reported this content for the same reason',
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Create report
    const reportData = {
      reporterId,
      ...(reportedItemId && { reportedItemId }),
      ...(reportedUserId && { reportedUserId }),
      category,
      reason: reason.trim(),
      ...(description && { description: description.trim() }),
      status: ReportStatus.PENDING,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'reports'), reportData)

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: docRef.id },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create report',
    }
    return NextResponse.json(response, { status: 500 })
  }
}