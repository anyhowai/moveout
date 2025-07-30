'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ItemForm from '@/components/items/item-form'
import AuthModal from '@/components/auth/auth-modal'
import { CreateItemRequest } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'

export default function PostItemPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true)
    }
  }, [isLoading, user])

  const handleSubmit = async (data: CreateItemRequest) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('category', data.category)
      formData.append('urgency', data.urgency)
      formData.append('address', data.address)
      formData.append('contactInfo.name', data.contactInfo.name)
      formData.append('contactInfo.phone', data.contactInfo.phone || '')
      formData.append('contactInfo.email', data.contactInfo.email || '')
      formData.append('ownerId', user.id)
      
      if (data.image) {
        formData.append('image', data.image)
      }

      if (data.pickupDeadline) {
        formData.append('pickupDeadline', data.pickupDeadline.toISOString())
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        console.error('Error posting item:', error)
        alert('Error posting item. Please try again.')
      }
    } catch (error) {
      console.error('Error posting item:', error)
      alert('Error posting item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post an Item</h1>
          <p className="text-gray-600">
            Share furniture or items you&apos;d like to give away with the community.
          </p>
        </div>

        {user ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ItemForm onSubmit={handleSubmit} isLoading={isSubmitting} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sign in to post an item
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to post items on MoveOut Map.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}