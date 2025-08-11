import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  Bell,
  BellOff,
  Trash2,
  Check,
  X,
  Users,
  User,
  Shield,
  Building
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function ComprehensiveNotificationTest() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [selectedTab, setSelectedTab] = useState('direct')
  const [isSending, setIsSending] = useState(false)
  const [testResults, setTestResults] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning'
    message: string
    timestamp: Date
  }>>([])

  // Mutations
  const sendTestNotification = useMutation(api.notifications.sendTestNotification)
  const sendSystemNotification = useMutation(api.systemNotifications.notifyBySystemRole)
  const sendToAllUsers = useMutation(api.systemNotifications.notifyAllUsers)
  const sendGroupNotification = useMutation(api.groupNotifications.notifyGroup)
  
  // Queries
  const currentUser = useQuery(api.users.getCurrentUser)
  const systemGroups = useQuery(api.groups.getSystemGroups)
  const organizationGroups = useQuery(api.groups.getUserGroups, { includeSystemGroups: false })
  const notifications = useQuery(api.notifications.getNotifications, { limit: 5 })
  const unreadCount = useQuery(api.notifications.getUnreadCount)

  // Form states
  const [directForm, setDirectForm] = useState({
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification message',
  })

  const [systemForm, setSystemForm] = useState({
    role: 'all',
    type: 'system',
    title: 'System Notification',
    message: 'Important system announcement',
  })

  const [groupForm, setGroupForm] = useState({
    groupId: '',
    type: 'group',
    title: 'Group Notification',
    message: 'Message for group members',
  })

  const addTestResult = (type: 'success' | 'error' | 'warning', message: string) => {
    const result = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      message,
      timestamp: new Date()
    }
    setTestResults(prev => [result, ...prev].slice(0, 10))
  }

  const handleSendDirect = async () => {
    if (!directForm.title || !directForm.message) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSending(true)
    try {
      await sendTestNotification({
        type: directForm.type,
        title: directForm.title,
        message: directForm.message,
      })
      
      toast.success('Notification sent successfully!')
      addTestResult('success', `Direct notification sent: ${directForm.title}`)
    } catch (error: any) {
      console.error('Failed to send notification:', error)
      toast.error(error.message || 'Failed to send notification')
      addTestResult('error', `Failed: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendSystem = async () => {
    if (!systemForm.title || !systemForm.message) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSending(true)
    try {
      if (systemForm.role === 'all') {
        // Use notifyAllUsers for sending to all users
        await sendToAllUsers({
          type: systemForm.type,
          title: systemForm.title,
          message: systemForm.message,
          excludeInactive: true,
        })
        toast.success('Notification sent to all users!')
        addTestResult('success', 'System notification sent to all users')
      } else {
        // Use notifyBySystemRole for specific roles
        await sendSystemNotification({
          targetRole: systemForm.role as "superadmin" | "admin" | "manager" | "user",
          type: systemForm.type,
          title: systemForm.title,
          message: systemForm.message,
          includeHigherRoles: false,
        })
        toast.success(`System notification sent to ${systemForm.role}!`)
        addTestResult('success', `System notification sent to role: ${systemForm.role}`)
      }
    } catch (error: any) {
      console.error('Failed to send system notification:', error)
      toast.error(error.message || 'Failed to send system notification')
      addTestResult('error', `System notification failed: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendGroup = async () => {
    if (!groupForm.groupId || !groupForm.title || !groupForm.message) {
      toast.error('Please select a group and fill in all fields')
      return
    }

    setIsSending(true)
    try {
      await sendGroupNotification({
        groupId: groupForm.groupId as Id<"groups">,
        type: groupForm.type,
        title: groupForm.title,
        message: groupForm.message,
        excludeSender: false,
      })
      
      toast.success('Group notification sent!')
      addTestResult('success', `Group notification sent: ${groupForm.title}`)
    } catch (error: any) {
      console.error('Failed to send group notification:', error)
      toast.error(error.message || 'Failed to send group notification')
      addTestResult('error', `Group notification failed: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  // Quick test templates
  const quickTests = [
    { type: 'success', title: '✅ Success', message: 'Operation completed successfully' },
    { type: 'error', title: '❌ Error', message: 'An error occurred' },
    { type: 'warning', title: '⚠️ Warning', message: 'Please review this action' },
    { type: 'info', title: 'ℹ️ Info', message: 'Here is some information' },
    { type: 'task', title: '📋 Task Update', message: 'Task has been updated' },
    { type: 'message', title: '💬 New Message', message: 'You have a new message' },
    { type: 'system', title: '🔧 System Update', message: 'System maintenance scheduled' },
    { type: 'security', title: '🔒 Security Alert', message: 'New login detected' },
  ]

  // Show loading state if Clerk is not loaded
  if (!clerkLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show error if user is not logged in
  if (!clerkUser) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Not Logged In</h3>
              <p className="text-sm text-muted-foreground">
                Please log in to test the notification system
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification System Status
            </span>
            <div className="flex items-center gap-4">
              <Badge variant={currentUser ? "default" : "destructive"}>
                {currentUser ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">
                Unread: {unreadCount ?? 0}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current User</p>
              <p className="font-medium">{currentUser?.username ?? 'Loading...'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User Role</p>
              <p className="font-medium">{currentUser?.role ?? 'Loading...'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">System Groups</p>
              <p className="font-medium">{systemGroups?.length ?? 0} groups</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Recent Notifications</p>
              <p className="font-medium">{notifications?.notifications?.length ?? 0} notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>Send pre-configured test notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickTests.map((test) => (
              <Button
                key={test.type}
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsSending(true)
                  try {
                    await sendTestNotification({
                      type: test.type,
                      title: test.title,
                      message: test.message,
                    })
                    toast.success(`${test.title} sent!`)
                    addTestResult('success', `Quick test: ${test.title}`)
                  } catch (error: any) {
                    toast.error('Failed to send')
                    addTestResult('error', `Quick test failed: ${error.message}`)
                  } finally {
                    setIsSending(false)
                  }
                }}
                disabled={isSending}
              >
                {test.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Testing Interface</CardTitle>
          <CardDescription>Send notifications using different methods</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="direct">
                <User className="h-4 w-4 mr-2" />
                Direct
              </TabsTrigger>
              <TabsTrigger value="system">
                <Shield className="h-4 w-4 mr-2" />
                System Role
              </TabsTrigger>
              <TabsTrigger value="group">
                <Users className="h-4 w-4 mr-2" />
                Group
              </TabsTrigger>
            </TabsList>

            {/* Direct Notification */}
            <TabsContent value="direct" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="direct-type">Type</Label>
                    <Select 
                      value={directForm.type} 
                      onValueChange={(value) => setDirectForm({...directForm, type: value})}
                    >
                      <SelectTrigger id="direct-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direct-title">Title</Label>
                    <Input
                      id="direct-title"
                      value={directForm.title}
                      onChange={(e) => setDirectForm({...directForm, title: e.target.value})}
                      placeholder="Notification title"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direct-message">Message</Label>
                  <Textarea
                    id="direct-message"
                    value={directForm.message}
                    onChange={(e) => setDirectForm({...directForm, message: e.target.value})}
                    placeholder="Notification message..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSendDirect} 
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Direct Notification
                </Button>
              </div>
            </TabsContent>

            {/* System Role Notification */}
            <TabsContent value="system" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-role">Target Role</Label>
                    <Select 
                      value={systemForm.role} 
                      onValueChange={(value) => setSystemForm({...systemForm, role: value})}
                    >
                      <SelectTrigger id="system-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="superadmin">Superadmins</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="manager">Managers</SelectItem>
                        <SelectItem value="user">Regular Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system-title">Title</Label>
                    <Input
                      id="system-title"
                      value={systemForm.title}
                      onChange={(e) => setSystemForm({...systemForm, title: e.target.value})}
                      placeholder="System notification title"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-message">Message</Label>
                  <Textarea
                    id="system-message"
                    value={systemForm.message}
                    onChange={(e) => setSystemForm({...systemForm, message: e.target.value})}
                    placeholder="System notification message..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSendSystem} 
                  disabled={isSending || !currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')}
                  className="w-full"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send System Notification
                </Button>
                {currentUser && currentUser.role !== 'admin' && currentUser.role !== 'superadmin' && (
                  <p className="text-sm text-muted-foreground text-center">
                    Only admins and superadmins can send system notifications
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Group Notification */}
            <TabsContent value="group" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-select">Target Group</Label>
                  <Select 
                    value={groupForm.groupId} 
                    onValueChange={(value) => setGroupForm({...groupForm, groupId: value})}
                  >
                    <SelectTrigger id="group-select">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemGroups?.map((group: any) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name} (System)
                        </SelectItem>
                      ))}
                      {organizationGroups?.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-title">Title</Label>
                  <Input
                    id="group-title"
                    value={groupForm.title}
                    onChange={(e) => setGroupForm({...groupForm, title: e.target.value})}
                    placeholder="Group notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-message">Message</Label>
                  <Textarea
                    id="group-message"
                    value={groupForm.message}
                    onChange={(e) => setGroupForm({...groupForm, message: e.target.value})}
                    placeholder="Group notification message..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSendGroup} 
                  disabled={isSending || !groupForm.groupId}
                  className="w-full"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Group Notification
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test Results</span>
            {testResults.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestResults([])}
              >
                Clear
              </Button>
            )}
          </CardTitle>
          <CardDescription>Recent test activity and results</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {testResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No test results yet. Send a notification to see results here.
              </p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-start gap-2 p-2 rounded-lg border"
                  >
                    {result.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    {result.type === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {result.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm">{result.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest notifications from the system</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications?.notifications && notifications.notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.notifications.map((notif) => (
                <div key={notif._id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Bell className={`h-4 w-4 mt-0.5 ${notif.read ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {notif.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {!notif.read && <Badge variant="default" className="text-xs">Unread</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No notifications yet. Send some test notifications to see them here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}