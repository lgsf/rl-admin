import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Users, Building, Hash, UserCheck, Send, Shield, User } from 'lucide-react'

export function GroupNotificationTest() {
  const notifyOrganization = useMutation(api.notificationGroups.notifyOrganization)
  const notifyByRole = useMutation(api.notificationGroups.notifyByRole)
  const notifyChannel = useMutation(api.notificationGroups.notifyChannel)
  const notifyBySystemRole = useMutation(api.notificationGroups.notifyBySystemRole)
  const userGroups = useQuery(api.notificationGroups.getUserGroups)

  const [targetType, setTargetType] = useState<'organization' | 'role' | 'channel' | 'systemRole'>('organization')
  const [selectedOrg, setSelectedOrg] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('')
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'member' | 'viewer'>('member')
  const [selectedSystemRole, setSelectedSystemRole] = useState<'superadmin' | 'admin' | 'manager' | 'cashier' | 'user'>('user')
  const [notificationData, setNotificationData] = useState({
    type: 'group_notification',
    title: '',
    message: '',
  })
  const [sending, setSending] = useState(false)

  const handleSendGroupNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Please fill in title and message')
      return
    }

    setSending(true)
    try {
      let result
      
      switch (targetType) {
        case 'organization':
          if (!selectedOrg) {
            toast.error('Please select an organization')
            setSending(false)
            return
          }
          result = await notifyOrganization({
            organizationId: selectedOrg as any,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
          })
          toast.success(`Sent to ${result.notificationsSent} organization members`)
          break
          
        case 'role':
          if (!selectedOrg) {
            toast.error('Please select an organization')
            setSending(false)
            return
          }
          result = await notifyByRole({
            organizationId: selectedOrg as any,
            role: selectedRole,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
          })
          toast.success(`Sent to ${result.notificationsSent} users with role: ${selectedRole}`)
          break
          
        case 'channel':
          if (!selectedChannel) {
            toast.error('Please select a channel')
            setSending(false)
            return
          }
          result = await notifyChannel({
            channelId: selectedChannel as any,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            excludeSender: true,
          })
          toast.success(`Sent to ${result.notificationsSent} channel members`)
          break
          
        case 'systemRole':
          result = await notifyBySystemRole({
            systemRole: selectedSystemRole,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            organizationId: selectedOrg ? selectedOrg as any : undefined,
          })
          toast.success(`Sent to ${result.notificationsSent} users with system role: ${selectedSystemRole}`)
          break
      }

      // Reset form
      setNotificationData({
        type: 'group_notification',
        title: '',
        message: '',
      })
    } catch (error) {
      console.error('Error sending group notification:', error)
      toast.error('Failed to send group notification')
    } finally {
      setSending(false)
    }
  }

  // Templates for quick testing
  const templates = [
    {
      title: 'Team Meeting Reminder',
      message: 'Don\'t forget about our team meeting at 3 PM today in the main conference room.',
      type: 'meeting_reminder',
    },
    {
      title: 'System Maintenance',
      message: 'The system will undergo maintenance from 2 AM to 4 AM tonight. Please save your work.',
      type: 'maintenance',
    },
    {
      title: 'New Feature Available',
      message: 'We\'ve just released a new reporting feature. Check it out in the Reports section!',
      type: 'feature_announcement',
    },
    {
      title: 'Policy Update',
      message: 'Our data retention policy has been updated. Please review the changes in the documentation.',
      type: 'policy_update',
    },
  ]

  if (!userGroups) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading groups...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group Notifications
        </CardTitle>
        <CardDescription>
          Send notifications to groups of users based on organization, role, or channel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Selection */}
        <div className="space-y-4">
          <Label>Target Type</Label>
          <RadioGroup value={targetType} onValueChange={(value: any) => setTargetType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="organization" id="org" />
              <Label htmlFor="org" className="flex items-center gap-2 cursor-pointer">
                <Building className="h-4 w-4" />
                Entire Organization
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="role" id="role" />
              <Label htmlFor="role" className="flex items-center gap-2 cursor-pointer">
                <UserCheck className="h-4 w-4" />
                Organization Role (Owner, Admin, Member, Viewer)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="channel" id="channel" />
              <Label htmlFor="channel" className="flex items-center gap-2 cursor-pointer">
                <Hash className="h-4 w-4" />
                Channel Members
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="systemRole" id="systemRole" />
              <Label htmlFor="systemRole" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4" />
                System Role (Admin, Manager, User, etc.)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Dynamic Selection Based on Target Type */}
        {(targetType === 'organization' || targetType === 'role') && (
          <div className="space-y-2">
            <Label>Select Organization</Label>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an organization" />
              </SelectTrigger>
              <SelectContent>
                {userGroups.organizations.length === 0 ? (
                  <SelectItem value="none" disabled>No organizations available</SelectItem>
                ) : (
                  userGroups.organizations.map((org) => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.name} 
                      <Badge variant="outline" className="ml-2 text-xs">
                        {org.userRole}
                      </Badge>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {targetType === 'role' && (
          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {targetType === 'channel' && (
          <div className="space-y-2">
            <Label>Select Channel</Label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {userGroups.channels.length === 0 ? (
                  <SelectItem value="none" disabled>No channels available</SelectItem>
                ) : (
                  userGroups.channels.map((channel) => (
                    <SelectItem key={channel._id} value={channel._id}>
                      #{channel.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {channel.type}
                      </Badge>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {targetType === 'systemRole' && (
          <>
            <div className="space-y-2">
              <Label>Select System Role</Label>
              <Select value={selectedSystemRole} onValueChange={(value: any) => setSelectedSystemRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Limit to Organization (Optional)</Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="All organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All organizations</SelectItem>
                  {userGroups.organizations.map((org) => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Quick Templates */}
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setNotificationData(template)}
              >
                {template.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Notification Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Input
              id="type"
              value={notificationData.type}
              onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value })}
              placeholder="e.g., announcement, alert, update"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={notificationData.title}
              onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
              placeholder="Notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={notificationData.message}
              onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
              placeholder="Notification message..."
              rows={3}
            />
          </div>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendGroupNotification} 
          disabled={sending}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? 'Sending...' : 'Send Group Notification'}
        </Button>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">Note:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Organization notifications go to all members</li>
            <li>• Role notifications target specific permission levels</li>
            <li>• Channel notifications exclude the sender by default</li>
            <li>• System role notifications target users by their platform role</li>
            <li>• You need to be part of an organization or channel to send notifications to it</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}