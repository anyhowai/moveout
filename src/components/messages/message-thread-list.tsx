'use client'

import { MessageThread } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface MessageThreadListProps {
  threads: MessageThread[]
  selectedThread: MessageThread | null
  onThreadSelect: (thread: MessageThread) => void
  currentUserId: string
}

export default function MessageThreadList({
  threads,
  selectedThread,
  onThreadSelect,
  currentUserId,
}: MessageThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm">No messages yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-900">Conversations</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {threads.map((thread) => {
          const isSelected = selectedThread?.id === thread.id
          const otherUserId = thread.buyerId === currentUserId ? thread.sellerId : thread.buyerId
          const unreadCount = thread.unreadCount?.[currentUserId] || 0

          return (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate">
                  Item: {thread.itemTitle || 'Unknown Item'}
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-2">
                {thread.lastMessage}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {thread.buyerId === currentUserId ? 'Seller' : 'Buyer'}: {otherUserId}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(thread.lastMessageAt)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}