'use client'

import { useState, useEffect } from 'react'
import { MessageThread, Message, Item } from '@/lib/types'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ErrorMessage from '@/components/ui/error-message'
import MessageThreadList from '@/components/messages/message-thread-list'
import MessageChat from '@/components/messages/message-chat'

interface MyMessagesTabProps {
  userId: string
}

export default function MyMessagesTab({ userId }: MyMessagesTabProps) {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchThreads()
  }, [userId])

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id)
      fetchItem(selectedThread.itemId)
    }
  }, [selectedThread])

  const fetchThreads = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/messages?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const threadData = result.data || []
        setThreads(threadData)
        
        // Auto-select first thread if none selected
        if (!selectedThread && threadData.length > 0) {
          setSelectedThread(threadData[0])
        }
      } else {
        throw new Error(result.error || 'Failed to fetch threads')
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      setError(error instanceof Error ? error.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}&threadId=${threadId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      // Don't set error state for individual message loading
    }
  }

  const fetchItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCurrentItem(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching item:', error)
      // Don't set error state for individual item loading
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedThread) return

    try {
      const recipientId = selectedThread.buyerId === userId 
        ? selectedThread.sellerId 
        : selectedThread.buyerId

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: userId,
          recipientId,
          itemId: selectedThread.itemId,
          threadId: selectedThread.id,
        }),
      })

      if (response.ok) {
        // Refresh messages and threads
        await fetchMessages(selectedThread.id)
        await fetchThreads()
      } else {
        const error = await response.json()
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleThreadSelect = (thread: MessageThread) => {
    setSelectedThread(thread)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" message="Loading your messages..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <ErrorMessage
          title="Failed to Load Messages"
          message={error}
          onRetry={fetchThreads}
        />
      </div>
    )
  }

  const totalUnread = threads.reduce((total, thread) => {
    return total + (thread.unreadCount?.[userId] || 0)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            My Messages ({threads.length})
          </h2>
          {totalUnread > 0 && (
            <span className="bg-blue-600 text-white text-sm rounded-full px-3 py-1">
              {totalUnread} unread
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {threads.length === 0 
            ? "No conversations yet"
            : `${threads.length} conversation${threads.length === 1 ? '' : 's'}`
          }
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600 mb-4">
            Start conversations by contacting item owners or wait for buyers to reach out to you.
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Browse Items
          </a>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] flex">
          {/* Thread list */}
          <div className="w-1/3 border-r border-gray-200">
            <MessageThreadList
              threads={threads}
              selectedThread={selectedThread}
              onThreadSelect={handleThreadSelect}
              currentUserId={userId}
            />
          </div>
          
          {/* Chat area */}
          <div className="flex-1">
            {selectedThread ? (
              <MessageChat
                thread={selectedThread}
                messages={messages}
                currentUserId={userId}
                item={currentItem || undefined}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a message thread to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}