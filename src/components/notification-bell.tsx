import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { formatDistanceToNow } from 'date-fns'
import { IconBell, IconCheck, IconTrash, IconX } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Fetch notifications and unread count
  const notifications = useQuery(api.notifications.getNotifications, {
    limit: 10,
    unreadOnly: false,
  })
  const unreadCount = useQuery(api.notifications.getUnreadCount, {})
  
  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)
  const clearAll = useMutation(api.notifications.clearAllNotifications)
  
  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({})
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }
  
  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }
  
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await clearAll({})
      } catch (error) {
        console.error('Failed to clear notifications:', error)
      }
    }
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications ${unreadCount ? `(${unreadCount} unread)` : ''}`}
        >
          <IconBell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount ? (
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications?.notifications && notifications.notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  <IconCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleClearAll}
              >
                <IconTrash className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {!notifications?.notifications || notifications.notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <IconBell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer group",
                    !notification.read && "bg-muted/50"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification._id)
                    }
                  }}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification._id)
                      }}
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications?.notifications && notifications.notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}