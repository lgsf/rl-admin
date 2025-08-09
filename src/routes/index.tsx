import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/')({
  component: RootRoute,
})

function RootRoute() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />
  }

  // Redirect to dashboard if signed in
  return <Navigate to="/dashboard" />
}