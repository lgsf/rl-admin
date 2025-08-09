import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        routing="path" 
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl"
          }
        }}
      />
    </div>
  ),
})
