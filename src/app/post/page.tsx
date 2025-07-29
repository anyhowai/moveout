'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ItemForm from '@/components/items/item-form'
import { CreateItemRequest } from '@/lib/types'

export default function PostItemPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateItemRequest) => {
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
      
      if (data.image) {
        formData.append('image', data.image)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post an Item</h1>
        <p className="text-gray-600">
          Share furniture or items you&apos;d like to give away with the community.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <ItemForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  )
}