import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  sandbox_access?: boolean
}

export const useAuthCheck = (requireAuth: boolean = true) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasSandboxAccess, setHasSandboxAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (!user && requireAuth) {
        router.push('/login')
      } else if (user) {
        // Check sandbox access
        if (user.isAnonymous) {
          setHasSandboxAccess(true)
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
              const profile = userDoc.data() as UserProfile
              setHasSandboxAccess(profile.sandbox_access || false)
            }
          } catch (err) {
            console.error('Error checking sandbox access:', err)
          }
        }
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [requireAuth, router])

  return { user, loading, hasSandboxAccess }
}