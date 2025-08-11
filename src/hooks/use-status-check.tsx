import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'

export function useStatusCheck() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const user = useQuery(api.users.getCurrentUser, isSignedIn ? {} : 'skip')

  useEffect(() => {
    // Only check if user is signed in and we have user data
    if (!isSignedIn || !user) return

    // Check if user is on the suspended page already
    const currentPath = window.location.pathname
    if (currentPath === '/account-suspended') {
      // If user is active now, redirect to dashboard
      if (user.status === 'active') {
        router.navigate({ to: '/dashboard' })
      }
      return
    }

    // If user is inactive or suspended, redirect to suspended page
    if (user.status === 'inactive' || user.status === 'suspended') {
      router.navigate({ to: '/account-suspended' })
    }
  }, [user, isSignedIn, router])

  return {
    isActive: user?.status === 'active',
    status: user?.status,
    user
  }
}