'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageThread, Message, Item } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import RatingPrompt from '@/components/ratings/rating-prompt'
import RatingModal from '@/components/ratings/rating-modal'

interface MessageChatProps {
  thread: MessageThread
  messages: Message[]
  currentUserId: string
  item?: Item
  onSendMessage: (content: string) => Promise<void>
}

export default function MessageChat({
  thread,
  messages,
  currentUserId,
  item,
  onSendMessage,
}: MessageChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const otherUserId = thread.buyerId === currentUserId ? thread.sellerId : thread.buyerId

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">
          {thread.itemTitle || 'Unknown Item'}
        </h3>
        <p className="text-sm text-gray-600">
          Chatting with {thread.buyerId === currentUserId ? 'seller' : 'buyer'}: {
            thread.buyerId === currentUserId 
              ? (thread.sellerName || 'Unknown User')
              : (thread.buyerName || 'Unknown User')
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rating Prompt for completed pickups */}
      {item && (
        <div className="px-4">
          <RatingPrompt
            item={item}
            otherUserId={otherUserId}
            otherUserName={item.contactInfo.name}
            onRatingClick={() => setShowRatingModal(true)}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Rating Modal */}
      {item && showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          item={item}
          ratedUserId={otherUserId}
          ratedUserName={item.contactInfo.name}
          onRatingSubmitted={() => {
            setShowRatingModal(false)
            // Optionally refresh the component or show a success message
          }}
        />
      )}
    </div>
  )
}