import Cookies from 'js-cookie'
import { Outlet } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatusCheck } from '@/hooks/use-status-check'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const { isLoaded, isSignedIn } = useUser()
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  
  // Check user status (this hook handles the redirect internally)
  useStatusCheck()

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    )
  }

  // Not signed in - redirect to sign in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          {children ? children : <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
