'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Item } from '@/lib/types'
import MessageModal from './message-modal'
import AuthModal from '@/components/auth/auth-modal'

interface ContactButtonProps {
  item: Item
  className?: string
}

export default function ContactButton({ item, className = '' }: ContactButtonProps) {
  const { user } = useAuth()
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleContactClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.id === item.ownerId) {
      alert('You cannot message yourself!')
      return
    }

    setShowMessageModal(true)
  }

  return (
    <>
      <button
        onClick={handleContactClick}
        className={`bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
      >
        Contact Owner
      </button>

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        item={item}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}