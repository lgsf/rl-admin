import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  MessageSquare,
  UserPlus,
  Calendar,
  DollarSign,
  Shield,
  Zap,
  Package,
  Settings,
  Send
} from 'lucide-react'
import { NotificationList } from './notification-list'
import { GroupNotificationTest } from './group-notification-test'

// Notification templates for different scenarios
const notificationTemplates = [
  // Task notifications
  {
    category: 'Tasks',
    icon: CheckCircle,
    color: 'text-green-500',
    templates: [
      {
        id: 'task_assigned',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Update user dashboard"',
        icon: '📋',
      },
      {
        id: 'task_completed',
        type: 'task_completed',
        title: 'Task Completed',
        message: 'John Doe completed "Fix login bug"',
        icon: '✅',
      },
      {
        id: 'task_due_soon',
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "Submit monthly report" is due in 2 hours',
        icon: '⏰',
      },
      {
        id: 'task_overdue',
        type: 'task_overdue',
        title: 'Task Overdue',
        message: 'Task "Review PR #123" is overdue by 1 day',
        icon: '🚨',
      },
    ],
  },
  // Message notifications
  {
    category: 'Messages',
    icon: MessageSquare,
    color: 'text-blue-500',
    templates: [
      {
        id: 'message_received',
        type: 'message_received',
        title: 'New Message',
        message: 'Sarah: "Hey, can you review my code?"',
        icon: '💬',
      },
      {
        id: 'message_mention',
        type: 'message_mention',
        title: 'You were mentioned',
        message: '@you Check out the new feature in #general',
        icon: '@',
      },
      {
        id: 'channel_invite',
        type: 'channel_invite',
        title: 'Channel Invitation',
        message: 'You\'ve been invited to #product-updates',
        icon: '📢',
      },
    ],
  },
  // Social notifications
  {
    category: 'Social',
    icon: UserPlus,
    color: 'text-purple-500',
    templates: [
      {
        id: 'user_followed',
        type: 'user_followed',
        title: 'New Follower',
        message: 'Alex Thompson started following you',
        icon: '👤',
      },
      {
        id: 'team_invite',
        type: 'team_invite',
        title: 'Team Invitation',
        message: 'You\'ve been invited to join "Development Team"',
        icon: '👥',
      },
      {
        id: 'user_mentioned',
        type: 'user_mentioned',
        title: 'Mentioned in Comment',
        message: 'Mike mentioned you in a comment on "Q4 Planning"',
        icon: '💭',
      },
    ],
  },
  // System notifications
  {
    category: 'System',
    icon: Settings,
    color: 'text-gray-500',
    templates: [
      {
        id: 'system_update',
        type: 'system_update',
        title: 'System Update',
        message: 'New features have been added to the dashboard',
        icon: '🚀',
      },
      {
        id: 'maintenance',
        type: 'maintenance',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tonight at 2 AM',
        icon: '🔧',
      },
      {
        id: 'security_alert',
        type: 'security_alert',
        title: 'Security Alert',
        message: 'New login from unknown device detected',
        icon: '🔒',
      },
    ],
  },
  // Payment notifications
  {
    category: 'Payments',
    icon: DollarSign,
    color: 'text-green-600',
    templates: [
      {
        id: 'payment_success',
        type: 'payment_success',
        title: 'Payment Successful',
        message: 'Your payment of $99.00 has been processed',
        icon: '💳',
      },
      {
        id: 'payment_failed',
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Payment failed. Please update your payment method',
        icon: '❌',
      },
      {
        id: 'subscription_expiring',
        type: 'subscription_expiring',
        title: 'Subscription Expiring',
        message: 'Your Pro subscription expires in 3 days',
        icon: '📅',
      },
    ],
  },
  // Application notifications
  {
    category: 'Applications',
    icon: Package,
    color: 'text-orange-500',
    templates: [
      {
        id: 'app_installed',
        type: 'app_installed',
        title: 'App Installed',
        message: 'Slack integration has been successfully installed',
        icon: '📦',
      },
      {
        id: 'app_update',
        type: 'app_update',
        title: 'App Update Available',
        message: 'New version of GitHub integration is available',
        icon: '🔄',
      },
      {
        id: 'app_error',
        type: 'app_error',
        title: 'Integration Error',
        message: 'Jira integration encountered an error',
        icon: '⚠️',
      },
    ],
  },
]

export function NotificationTestPage() {
  const { user } = useUser()
  const sendTestNotification = useMutation(api.notifications.sendTestNotification)
  const createNotification = useMutation(api.notifications.createNotification)
  const [customOpen, setCustomOpen] = useState(false)
  const [customForm, setCustomForm] = useState({
    type: '',
    title: '',
    message: '',
  })
  const [sending, setSending] = useState<string | null>(null)

  const handleSendNotification = async (template: any) => {
    setSending(template.id)
    try {
      await sendTestNotification({
        type: template.type,
        title: template.title,
        message: template.message,
      })
      toast.success(`${template.title} notification sent!`)
    } catch (error) {
      toast.error('Failed to send notification')
      console.error(error)
    } finally {
      setSending(null)
    }
  }

  const handleSendCustom = async () => {
    if (!customForm.type || !customForm.title || !customForm.message) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await sendTestNotification({
        type: customForm.type,
        title: customForm.title,
        message: customForm.message,
      })
      toast.success('Custom notification sent!')
      setCustomOpen(false)
      setCustomForm({ type: '', title: '', message: '' })
    } catch (error) {
      toast.error('Failed to send notification')
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Live Notification List */}
      <NotificationList />
      
      {/* Group Notification Testing */}
      <GroupNotificationTest />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Testing Center</h1>
          <p className="text-muted-foreground mt-1">
            Test different notification types to verify the notification system
          </p>
        </div>
        
        {/* Custom Notification Dialog */}
        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Custom Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send Custom Notification</DialogTitle>
              <DialogDescription>
                Create a custom notification with your own content
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Input
                  id="type"
                  value={customForm.type}
                  onChange={(e) => setCustomForm({ ...customForm, type: e.target.value })}
                  placeholder="custom_notification"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  placeholder="Notification Title"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={customForm.message}
                  onChange={(e) => setCustomForm({ ...customForm, message: e.target.value })}
                  placeholder="Your notification message..."
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSendCustom}>Send Notification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Click any notification template to send it to yourself</li>
            <li>• Notifications will appear in real-time if you have the notification bell implemented</li>
            <li>• Check the Convex dashboard to see stored notifications</li>
            <li>• Use custom notification to test specific scenarios</li>
            <li>• All notifications respect your preference settings</li>
          </ul>
        </CardContent>
      </Card>

      {/* Notification Templates */}
      <div className="space-y-6">
        {notificationTemplates.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className={`h-5 w-5 ${category.color}`} />
                {category.category} Notifications
              </CardTitle>
              <CardDescription>
                Test {category.category.toLowerCase()}-related notification scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleSendNotification(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {template.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {template.message}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.type}
                            </Badge>
                            {sending === template.id ? (
                              <span className="text-xs text-muted-foreground">Sending...</span>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                Send
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Bulk notification testing</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              for (const category of notificationTemplates) {
                const template = category.templates[0]
                await handleSendNotification(template)
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }}
          >
            Send One of Each Category
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              for (let i = 0; i < 5; i++) {
                await sendTestNotification({
                  type: 'bulk_test',
                  title: `Bulk Test ${i + 1}`,
                  message: `This is bulk test notification ${i + 1} of 5`,
                })
                await new Promise(resolve => setTimeout(resolve, 200))
              }
              toast.success('5 bulk notifications sent!')
            }}
          >
            Send 5 Quick Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await sendTestNotification({
                type: 'urgent_test',
                title: '🚨 URGENT: Action Required',
                message: 'This is a high-priority notification requiring immediate attention',
              })
              toast.success('Urgent notification sent!')
            }}
          >
            Send Urgent Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}