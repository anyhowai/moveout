'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Get or create user document in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          // Update existing user
          const userData = userSnap.data()
          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || userData.displayName || '',
            photoURL: firebaseUser.photoURL || userData.photoURL,
            phone: userData.phone,
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastSeen: new Date(),
            rating: userData.rating,
            completedPickups: userData.completedPickups || 0,
          }
          
          // Update last seen
          await updateDoc(userRef, {
            lastSeen: serverTimestamp(),
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          })
          
          setUser(appUser)
        } else {
          // Create new user document
          const newUser: Omit<User, 'id'> = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous User',
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            lastSeen: new Date(),
            completedPickups: 0,
          }
          
          await setDoc(userRef, {
            ...newUser,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
          })
          
          setUser({ id: firebaseUser.uid, ...newUser })
        }
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
    } catch (error) {
      console.error('Error signing up with email:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return
    
    const userRef = doc(db, 'users', user.id)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}