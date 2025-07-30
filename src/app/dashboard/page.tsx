'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/auth/auth-modal'
import LoadingSpinner from '@/components/ui/loading-spinner'
import MyListingsTab from '@/components/dashboard/my-listings-tab'
import MyMessagesTab from '@/components/dashboard/my-messages-tab'
import MyFavoritesTab from '@/components/dashboard/my-favorites-tab'
import ProfileTab from '@/components/dashboard/profile-tab'

type DashboardTab = 'listings' | 'messages' | 'favorites' | 'profile'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>('listings')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true)
    }
  }, [isLoading, user])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" message="Loading dashboard..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Sign in to access your dashboard and manage your listings.
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

  const tabs = [
    { id: 'listings' as const, label: 'My Listings', icon: '📦' },
    { id: 'messages' as const, label: 'My Messages', icon: '💬' },
    { id: 'favorites' as const, label: 'My Favorites', icon: '💝' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.displayName}! Manage your listings and messages.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'listings' && <MyListingsTab userId={user.id} />}
          {activeTab === 'messages' && <MyMessagesTab userId={user.id} />}
          {activeTab === 'favorites' && <MyFavoritesTab userId={user.id} />}
          {activeTab === 'profile' && <ProfileTab user={user} />}
        </div>
      </div>
    </div>
  )
}