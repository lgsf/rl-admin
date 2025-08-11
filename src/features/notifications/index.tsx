import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { format } from 'date-fns'
import { 
  IconBell, 
  IconSearch, 
  IconFilter,
  IconCheck,
  IconChecks,
  IconTrash,
  IconInfoCircle,
  IconAlertCircle,
  IconCircleCheck,
  IconAlertTriangle
} from '@tabler/icons-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Id } from '../../../convex/_generated/dataModel'

type NotificationType = 'info' | 'success' | 'warning' | 'error'
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')

  // Fetch notifications
  const notificationsResult = useQuery(api.notifications.getNotifications, { 
    limit: 100 
  })
  const notifications = notificationsResult?.notifications || []
  
  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markMultipleAsRead = useMutation(api.notifications.markMultipleAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)
  const deleteMultiple = useMutation(api.notifications.deleteMultiple)

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false
    if (readFilter === 'read' && !notification.read) return false
    if (readFilter === 'unread' && notification.read) return false
    return true
  })

  // Loading state
  if (notificationsResult === undefined) {
    return (
      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Notifications</h2>
            <p className='text-muted-foreground'>
              Loading notifications...
            </p>
          </div>
        </div>
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-24 w-full' />
          ))}
        </div>
      </Main>
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications?.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifications?.map(n => n._id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.size > 0) {
      await markMultipleAsRead({ 
        notificationIds: Array.from(selectedIds) as Id<"notifications">[] 
      })
      setSelectedIds(new Set())
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size > 0) {
      await deleteMultiple({ 
        notificationIds: Array.from(selectedIds) as Id<"notifications">[] 
      })
      setSelectedIds(new Set())
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <IconCircleCheck className="h-5 w-5 text-green-500" />
      case 'warning':
        return <IconAlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <IconAlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <IconInfoCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: NotificationPriority) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'warning',
      urgent: 'destructive'
    }
    return (
      <Badge variant={variants[priority] as any} className="text-xs">
        {priority}
      </Badge>
    )
  }

  const getTypeBadge = (type: NotificationType) => {
    const variants = {
      info: 'default',
      success: 'success',
      warning: 'warning',
      error: 'destructive'
    }
    return (
      <Badge variant={variants[type] as any} className="text-xs">
        {type}
      </Badge>
    )
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    high: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
  }

  return (
    <Main>
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Notifications</h2>
        <p className='text-muted-foreground'>
          Manage and view all your notifications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <IconBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time notifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Priority
            </CardTitle>
            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.high}</div>
            <p className="text-xs text-muted-foreground">
              High & urgent items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkSelectedAsRead}
            >
              <IconChecks className="mr-2 h-4 w-4" />
              Mark as Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Notifications</CardTitle>
            {filteredNotifications && filteredNotifications.length > 0 && (
              <Checkbox
                checked={selectedIds.size === filteredNotifications.length}
                onCheckedChange={handleSelectAll}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredNotifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconBell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || readFilter !== 'all'
                    ? 'No notifications match your filters'
                    : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications?.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                      !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.has(notification._id)}
                      onCheckedChange={() => handleSelect(notification._id)}
                      className="mt-1"
                    />
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type as NotificationType)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                          </span>
                          <div className="flex gap-1">
                            {getTypeBadge(notification.type as NotificationType)}
                            {getPriorityBadge(notification.priority as NotificationPriority)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead({ 
                              notificationId: notification._id 
                            })}
                          >
                            <IconCheck className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification({ 
                            notificationId: notification._id 
                          })}
                          className="text-destructive hover:text-destructive"
                        >
                          <IconTrash className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </Main>
  )
}