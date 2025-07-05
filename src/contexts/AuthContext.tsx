'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  email?: string
  sandbox_access?: boolean
  created_at?: Date
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInAnonymous: () => Promise<void>
  logout: () => Promise<void>
  hasSandboxAccess: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile)
          } else {
            // For anonymous users or users without profile
            setProfile({
              email: user.email || undefined,
              sandbox_access: user.isAnonymous || false,
            })
          }
        } catch (err) {
          console.error('Error fetching user profile:', err)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signInAnonymous = async () => {
    try {
      setError(null)
      await signInAnonymously(auth)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const hasSandboxAccess = user?.isAnonymous || profile?.sandbox_access || false

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signInAnonymous,
    logout,
    hasSandboxAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}