'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MessageThread, Message } from '@/lib/types'
import AuthModal from '@/components/auth/auth-modal'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ErrorMessage from '@/components/ui/error-message'
import MessageThreadList from '@/components/messages/message-thread-list'
import MessageChat from '@/components/messages/message-chat'

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    } else if (user) {
      fetchThreads()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (selectedThread && user) {
      fetchMessages(selectedThread.id)
    }
  }, [selectedThread, user])

  const fetchThreads = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/messages?userId=${user.uid}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setThreads(result.data || [])
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
    if (!user) return

    try {
      const response = await fetch(`/api/messages?userId=${user.uid}&threadId=${threadId}`)
      
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

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedThread) return

    try {
      const recipientId = selectedThread.buyerId === user.uid 
        ? selectedThread.sellerId 
        : selectedThread.buyerId

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: user.uid,
          recipientId,
          itemId: selectedThread.itemId,
          threadId: selectedThread.id,
        }),
      })

      if (response.ok) {
        // Refresh messages
        await fetchMessages(selectedThread.id)
        // Refresh threads to update last message
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

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" message="Loading messages..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view and send messages with other users.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        <div className="flex items-center justify-center h-64">
          <ErrorMessage
            title="Failed to Load Messages"
            message={error}
            onRetry={fetchThreads}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] flex">
        <div className="w-1/3 border-r border-gray-200">
          <MessageThreadList
            threads={threads}
            selectedThread={selectedThread}
            onThreadSelect={setSelectedThread}
            currentUserId={user.uid}
          />
        </div>
        
        <div className="flex-1">
          {selectedThread ? (
            <MessageChat
              thread={selectedThread}
              messages={messages}
              currentUserId={user.uid}
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
    </div>
  )
}