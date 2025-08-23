import { useEffect, useState } from 'react'
import {
  IconCheck,
  IconHash,
  IconLock,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import { useQuery, useMutation } from 'convex/react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { getInitials } from '../utils/format-message'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChat({ onOpenChange, open }: Props) {
  const [mode, setMode] = useState<'channel' | 'dm'>('dm')
  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState<'public' | 'private'>('public')
  const [selectedUsers, setSelectedUsers] = useState<Id<'users'>[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Fetch current user and organization users
  const currentUser = useQuery(api.users.getCurrentUser)
  const organizationUsers = useQuery(api.users.list, {
    organizationId: currentUser?.organizationId,
  })

  // Mutations
  const createChannel = useMutation(api.channels.createChannel)
  const createDirectMessage = useMutation(api.channels.getOrCreateDirectMessage)

  // Filter out current user from the list
  const availableUsers =
    organizationUsers?.filter((u) => u._id !== currentUser?._id) || []

  const handleSelectUser = (userId: Id<'users'>) => {
    if (mode === 'dm') {
      // For DM, only allow one user
      setSelectedUsers([userId])
    } else {
      // For channels, allow multiple users
      if (!selectedUsers.includes(userId)) {
        setSelectedUsers([...selectedUsers, userId])
      } else {
        handleRemoveUser(userId)
      }
    }
  }

  const handleRemoveUser = (userId: Id<'users'>) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId))
  }

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      if (mode === 'dm') {
        if (selectedUsers.length === 0) {
          toast.error('Please select a user to start a conversation')
          return
        }

        await createDirectMessage({
          recipientId: selectedUsers[0],
        })

        toast.success('Conversation started')
      } else {
        if (!channelName.trim()) {
          toast.error('Please enter a channel name')
          return
        }

        await createChannel({
          name: channelName.trim(),
          type: channelType,
          description: undefined,
          participants: selectedUsers,
        })

        toast.success(`Channel #${channelName} created`)
      }

      // Reset form
      setChannelName('')
      setSelectedUsers([])
      setMode('dm')
      setChannelType('public')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create: ' + (error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
      setChannelName('')
      setMode('dm')
      setChannelType('public')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a direct message or create a new channel
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Mode Selection */}
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as 'channel' | 'dm')}
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='dm' id='dm' />
              <Label
                htmlFor='dm'
                className='flex cursor-pointer items-center gap-2'
              >
                <IconUser size={16} />
                Direct Message
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='channel' id='channel' />
              <Label
                htmlFor='channel'
                className='flex cursor-pointer items-center gap-2'
              >
                <IconHash size={16} />
                Create Channel
              </Label>
            </div>
          </RadioGroup>

          {/* Channel Settings */}
          {mode === 'channel' && (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='channel-name'>Channel Name</Label>
                <Input
                  id='channel-name'
                  placeholder='general'
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className='mt-1'
                />
              </div>

              <RadioGroup
                value={channelType}
                onValueChange={(v) => setChannelType(v as 'public' | 'private')}
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='public' id='public' />
                  <Label
                    htmlFor='public'
                    className='flex cursor-pointer items-center gap-2'
                  >
                    <IconHash size={16} />
                    Public - Anyone in your organization can join
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='private' id='private' />
                  <Label
                    htmlFor='private'
                    className='flex cursor-pointer items-center gap-2'
                  >
                    <IconLock size={16} />
                    Private - Only invited members can join
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* User Selection */}
          <div className='space-y-2'>
            <Label>
              {mode === 'dm' ? 'Send message to:' : 'Add members (optional):'}
            </Label>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className='mb-2 flex flex-wrap gap-2'>
                {selectedUsers.map((userId) => {
                  const user = availableUsers.find((u) => u._id === userId)
                  if (!user) return null

                  return (
                    <Badge key={userId} variant='secondary'>
                      {user.firstName} {user.lastName}
                      <button
                        className='hover:bg-muted ml-1 rounded-full outline-hidden'
                        onClick={() => handleRemoveUser(userId)}
                      >
                        <IconX className='h-3 w-3' />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* User Search */}
            <Command className='rounded-lg border'>
              <CommandInput
                placeholder='Search users...'
                className='text-foreground'
              />
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup heading='Organization Members'>
                  {availableUsers.map((user) => (
                    <CommandItem
                      key={user._id}
                      onSelect={() => handleSelectUser(user._id)}
                      className='flex items-center justify-between gap-2'
                    >
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium'>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            @{user.username} • {user.role}
                          </span>
                        </div>
                      </div>

                      {selectedUsers.includes(user._id) && (
                        <IconCheck className='h-4 w-4' />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              (mode === 'dm' && selectedUsers.length === 0) ||
              (mode === 'channel' && !channelName.trim())
            }
            className='w-full'
          >
            {isCreating
              ? 'Creating...'
              : mode === 'dm'
                ? 'Start Conversation'
                : 'Create Channel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
