import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
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
