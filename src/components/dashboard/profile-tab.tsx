'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface ProfileTabProps {
  user: User
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phone: user.phone || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    completedPickups: 0,
    memberSince: user.createdAt || new Date(),
  })

  useEffect(() => {
    fetchUserStats()
  }, [user.id])

  const fetchUserStats = async () => {
    try {
      // Fetch user's items to calculate stats
      const response = await fetch(`/api/items?ownerId=${user.id}`)
      
      if (response.ok) {
        const result = await response.json()
        const items = result.data || []
        
        const totalItems = items.length
        const activeItems = items.filter((item: any) => 
          item.status === 'available' || item.status === 'pending'
        ).length
        const completedPickups = items.filter((item: any) => 
          item.status === 'picked_up'
        ).length

        setStats({
          totalItems,
          activeItems,
          completedPickups,
          memberSince: user.createdAt || new Date(),
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd update the user profile here
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName || '',
      phone: user.phone || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-medium">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">
            Member since {formatDate(stats.memberSince)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalItems}</div>
          <div className="text-sm text-blue-800 font-medium">Total Items Posted</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.activeItems}</div>
          <div className="text-sm text-green-800 font-medium">Active Listings</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.completedPickups}</div>
          <div className="text-sm text-purple-800 font-medium">Completed Pickups</div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed. Contact support if you need to update this.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Display Name</label>
                <p className="mt-1 text-gray-900">{user.displayName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Member Since</label>
                <p className="mt-1 text-gray-900">{formatDate(stats.memberSince)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications for new messages and status updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Delete Account
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  )
}