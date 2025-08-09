import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  // Not signed in - redirect to sign in
  if (!isSignedIn) {
    // Check if we're already on an auth page
    const isAuthPage = location.pathname.includes('/sign-in') || 
                       location.pathname.includes('/sign-up') ||
                       location.pathname.includes('/clerk');
    
    if (!isAuthPage) {
      return <Navigate to="/sign-in" />;
    }
  }

  return <>{children}</>;
}