'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

interface FavoritesContextType {
  favorites: Set<string>
  isLoading: boolean
  addFavorite: (itemId: string) => Promise<boolean>
  removeFavorite: (itemId: string) => Promise<boolean>
  isFavorite: (itemId: string) => boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

interface FavoritesProviderProps {
  children: ReactNode
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's favorites when they log in
  useEffect(() => {
    if (user) {
      refreshFavorites()
    } else {
      setFavorites(new Set())
    }
  }, [user])

  const refreshFavorites = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/favorites?userId=${user.uid}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const favoriteIds = new Set(result.data.map((fav: any) => fav.itemId))
          setFavorites(favoriteIds)
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addFavorite = async (itemId: string): Promise<boolean> => {
    if (!user) return false

    // Optimistic update
    const newFavorites = new Set(favorites)
    newFavorites.add(itemId)
    setFavorites(newFavorites)

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          itemId,
        }),
      })

      if (response.ok) {
        return true
      } else {
        // Rollback optimistic update
        const rollbackFavorites = new Set(favorites)
        rollbackFavorites.delete(itemId)
        setFavorites(rollbackFavorites)
        return false
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
      // Rollback optimistic update
      const rollbackFavorites = new Set(favorites)
      rollbackFavorites.delete(itemId)
      setFavorites(rollbackFavorites)
      return false
    }
  }

  const removeFavorite = async (itemId: string): Promise<boolean> => {
    if (!user) return false

    // Optimistic update
    const newFavorites = new Set(favorites)
    newFavorites.delete(itemId)
    setFavorites(newFavorites)

    try {
      const response = await fetch(`/api/favorites?userId=${user.uid}&itemId=${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        return true
      } else {
        // Rollback optimistic update
        const rollbackFavorites = new Set(favorites)
        rollbackFavorites.add(itemId)
        setFavorites(rollbackFavorites)
        return false
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      // Rollback optimistic update
      const rollbackFavorites = new Set(favorites)
      rollbackFavorites.add(itemId)
      setFavorites(rollbackFavorites)
      return false
    }
  }

  const isFavorite = (itemId: string): boolean => {
    return favorites.has(itemId)
  }

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}