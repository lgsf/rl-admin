import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Circle } from 'lucide-react'

export function NotificationList() {
  const notifications = useQuery(api.notifications.getNotifications, {
    limit: 20,
  })
  const unreadCount = useQuery(api.notifications.getUnreadCount)

  if (!notifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading notifications...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          {unreadCount !== undefined && unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        <CardDescription>
          Your notifications from the database (live updates)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet. Send a test notification to see it here!
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="mt-1">
                    {notification.read ? (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Circle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}