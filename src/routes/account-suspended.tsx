import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconAlertTriangle, IconMail } from '@tabler/icons-react'
import { useAuth } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/account-suspended')({
  component: AccountSuspended,
})

function AccountSuspended() {
  const { signOut } = useAuth()
  const user = useQuery(api.users.getCurrentUser, {})

  const handleSignOut = async () => {
    await signOut()
  }

  const getStatusMessage = () => {
    if (user?.status === 'suspended') {
      return {
        title: 'Account Suspended',
        description: 'Your account has been suspended due to a policy violation.',
        message: 'Please contact your administrator for more information about why your account was suspended and how to resolve this issue.',
        icon: <IconAlertTriangle className="h-12 w-12 text-destructive" />,
        iconBg: 'bg-destructive/10',
      }
    }
    return {
      title: 'Account Inactive',
      description: 'Your account is currently inactive.',
      message: 'Your account has been deactivated. Please contact your administrator to request reactivation.',
      icon: <IconAlertTriangle className="h-12 w-12 text-warning" />,
      iconBg: 'bg-warning/10',
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: 'hsl(var(--destructive) / 0.1)' }}>
            {statusInfo.icon}
          </div>
          <div>
            <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
            <CardDescription className="mt-2">
              {statusInfo.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {statusInfo.message}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Account Details:</p>
              <div className="space-y-1">
                <p>Email: {user?.email}</p>
                <p>Username: {user?.username}</p>
                <p>Status: <span className="capitalize">{user?.status}</span></p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'mailto:support@example.com'}
              >
                <IconMail className="mr-2 h-4 w-4" />
                Contact Administrator
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            If you believe this is a mistake, please contact your system administrator
            immediately for assistance.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}