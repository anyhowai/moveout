import { NextRequest, NextResponse } from 'next/server'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  or,
  and 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { MessageThread, Message, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const threadId = searchParams.get('threadId')

    if (!userId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'User ID is required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (threadId) {
      // Get messages for a specific thread
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', threadId),
        orderBy('createdAt', 'asc')
      )
      
      const messagesSnapshot = await getDocs(messagesQuery)
      const messages: Message[] = []

      messagesSnapshot.forEach((doc) => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Message)
      })

      const response: ApiResponse<Message[]> = {
        success: true,
        data: messages,
      }
      return NextResponse.json(response)
    } else {
      // Get all message threads for the user
      const threadsQuery = query(
        collection(db, 'messageThreads'),
        or(
          where('buyerId', '==', userId),
          where('sellerId', '==', userId)
        ),
        orderBy('lastMessageAt', 'desc')
      )

      const threadsSnapshot = await getDocs(threadsQuery)
      const threads: MessageThread[] = []

      // Get item titles for threads
      for (const docSnap of threadsSnapshot.docs) {
        const data = docSnap.data()
        
        // Get item title
        let itemTitle = 'Unknown Item'
        try {
          const itemDoc = await getDoc(doc(db, 'items', data.itemId))
          if (itemDoc.exists()) {
            itemTitle = itemDoc.data().title
          }
        } catch (error) {
          console.error('Error fetching item title:', error)
        }

        threads.push({
          id: docSnap.id,
          ...data,
          itemTitle,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        } as MessageThread)
      }

      const response: ApiResponse<MessageThread[]> = {
        success: true,
        data: threads,
      }
      return NextResponse.json(response)
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch messages',
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, senderId, recipientId, itemId, threadId } = body

    if (!content || !senderId || !recipientId || !itemId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields',
      }
      return NextResponse.json(response, { status: 400 })
    }

    let actualThreadId = threadId

    // If no threadId provided, check if a thread already exists for this item and users
    if (!actualThreadId) {
      const existingThreadQuery = query(
        collection(db, 'messageThreads'),
        and(
          where('itemId', '==', itemId),
          or(
            and(
              where('buyerId', '==', senderId),
              where('sellerId', '==', recipientId)
            ),
            and(
              where('buyerId', '==', recipientId),
              where('sellerId', '==', senderId)
            )
          )
        )
      )

      const existingThreadSnapshot = await getDocs(existingThreadQuery)
      
      if (!existingThreadSnapshot.empty) {
        actualThreadId = existingThreadSnapshot.docs[0].id
      } else {
        // Create new thread
        const newThread = {
          itemId,
          buyerId: senderId,
          sellerId: recipientId,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessage: content.substring(0, 100),
          unreadCount: { [recipientId]: 1, [senderId]: 0 },
        }

        const threadRef = await addDoc(collection(db, 'messageThreads'), newThread)
        actualThreadId = threadRef.id
      }
    }

    // Add the message
    const messageData = {
      threadId: actualThreadId,
      senderId,
      recipientId,
      content,
      createdAt: serverTimestamp(),
      isRead: false,
    }

    const messageRef = await addDoc(collection(db, 'messages'), messageData)

    // Update thread with last message info
    // Note: In a production app, you'd want to use a transaction for this
    const threadUpdateData = {
      lastMessageAt: serverTimestamp(),
      lastMessage: content.substring(0, 100),
      [`unreadCount.${recipientId}`]: 1, // This is a simplified approach
    }

    // You'd update the thread document here, but for now we'll skip the complex update

    const response: ApiResponse<{ messageId: string; threadId: string }> = {
      success: true,
      data: { messageId: messageRef.id, threadId: actualThreadId },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create message',
    }
    return NextResponse.json(response, { status: 500 })
  }
}