import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconHash,
  IconLock,
  IconMessages,
  IconPaperclip,
  IconPhotoPlus,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
  IconDownload,
  IconUserPlus,
  IconLogout,
  IconUsers,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import { NewChat } from './components/new-chat'
import { ChannelDiscovery } from './components/channel-discovery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  formatMessageTime,
  formatChannelTime,
  formatMessageDate,
  truncateMessage,
  getInitials,
  getChannelDisplayName,
  getChannelIcon,
} from './utils/format-message'

export default function Chats() {
  const [search, setSearch] = useState('')
  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null)
  const [mobileSelectedChannel, setMobileSelectedChannel] = useState<boolean>(false)
  const [messageInput, setMessageInput] = useState('')
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [channelDiscoveryOpened, setChannelDiscoveryOpened] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch current user
  const currentUser = useQuery(api.users.getCurrentUser)
  
  // Fetch channels
  const channels = useQuery(api.channels.listChannels)
  
  // Fetch messages for selected channel
  const messages = useQuery(
    api.messages.getMessages,
    selectedChannelId ? { channelId: selectedChannelId, limit: 50 } : 'skip'
  )
  
  // Fetch channel members
  const channelMembers = useQuery(
    api.channelMembers.getMembers,
    selectedChannelId ? { channelId: selectedChannelId } : 'skip'
  )
  
  // Mutations
  const sendMessage = useMutation(api.messages.sendMessage)
  const markAsRead = useMutation(api.messages.markChannelAsRead)
  const createChannel = useMutation(api.channels.createChannel)
  const deleteChannel = useMutation(api.channelActions.deleteChannel)
  const leaveChannel = useMutation(api.channelActions.leaveChannel)
  const joinChannel = useMutation(api.channelActions.joinChannel)
  
  // Get selected channel details
  const selectedChannel = channels?.find(c => c._id === selectedChannelId)
  
  // Filter channels based on search
  const filteredChannels = channels?.filter(channel => {
    const displayName = getChannelDisplayName(channel, currentUser?._id || '')
    return displayName.toLowerCase().includes(search.trim().toLowerCase())
  }) || []

  // Group messages by date
  const groupedMessages = messages?.messages?.reduce((acc: Record<string, typeof messages.messages>, message) => {
    const dateKey = formatMessageDate(message.createdAt)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(message)
    return acc
  }, {}) || {}

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannelId) return
    
    try {
      await sendMessage({
        channelId: selectedChannelId,
        content: messageInput.trim(),
      })
      setMessageInput('')
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    }
  }

  // Handle key press in message input
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle export conversation
  const handleExportConversation = () => {
    if (!selectedChannel || !messages) return
    
    const exportData = {
      channel: getChannelDisplayName(selectedChannel, currentUser?._id || ''),
      type: selectedChannel.type,
      exportedAt: new Date().toISOString(),
      messages: messages.messages.map(msg => ({
        sender: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt).toISOString(),
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${selectedChannel._id}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Conversation exported successfully')
  }

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!selectedChannelId || !selectedChannel) return
    
    try {
      // Check if user is owner for non-direct channels
      if (selectedChannel.type !== 'direct') {
        const member = channelMembers?.find(m => m.userId === currentUser?._id)
        if (member?.role !== 'owner') {
          toast.error('Only channel owners can delete channels')
          return
        }
      }
      
      await deleteChannel({ channelId: selectedChannelId })
      setSelectedChannelId(null)
      setMobileSelectedChannel(false)
      toast.success('Conversation deleted successfully')
    } catch (error) {
      toast.error('Failed to delete conversation')
      console.error(error)
    }
  }

  // Handle leave channel
  const handleLeaveChannel = async () => {
    if (!selectedChannelId || !selectedChannel) return
    
    if (selectedChannel.type === 'direct') {
      toast.error('Cannot leave direct messages')
      return
    }
    
    try {
      await leaveChannel({ channelId: selectedChannelId })
      setSelectedChannelId(null)
      setMobileSelectedChannel(false)
      toast.success('Left channel successfully')
    } catch (error) {
      toast.error('Failed to leave channel')
      console.error(error)
    }
  }

  // Handle join channel
  const handleJoinChannel = async () => {
    if (!selectedChannelId || !selectedChannel) return
    
    if (selectedChannel.type !== 'public') {
      toast.error('Can only join public channels')
      return
    }
    
    try {
      await joinChannel({ channelId: selectedChannelId })
      toast.success('Joined channel successfully')
    } catch (error) {
      toast.error('Failed to join channel')
      console.error(error)
    }
  }

  // Check if user is member of selected channel
  const isChannelMember = channelMembers?.some(m => m.userId === currentUser?._id) || false
  const isChannelOwner = channelMembers?.find(m => m.userId === currentUser?._id)?.role === 'owner'

  // Mark channel as read when selected
  useEffect(() => {
    if (selectedChannelId) {
      markAsRead({ channelId: selectedChannelId }).catch(console.error)
    }
  }, [selectedChannelId, markAsRead])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Loading state
  if (channels === undefined || currentUser === undefined) {
    return (
      <Main fixed>
        <section className='flex h-full gap-6'>
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <IconMessages size={20} />
                </div>
              </div>
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          </div>
        </section>
      </Main>
    )
  }

  return (
    <Main fixed>
      <section className='flex h-full gap-6'>
        {/* Left Side - Channel List */}
        <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
          <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
            <div className='flex items-center justify-between py-2'>
              <div className='flex gap-2'>
                <h1 className='text-2xl font-bold'>Inbox</h1>
                <IconMessages size={20} />
              </div>

              <div className='flex gap-1'>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setChannelDiscoveryOpened(true)}
                  className='rounded-lg'
                  title='Browse Channels'
                >
                  <IconHash size={24} className='stroke-muted-foreground' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                  title='New Conversation'
                >
                  <IconEdit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>
            </div>

            <label className='border-input focus-within:ring-ring flex h-12 w-full items-center space-x-0 rounded-md border pl-2 focus-within:ring-1 focus-within:outline-hidden'>
              <IconSearch size={15} className='mr-2 stroke-slate-500' />
              <span className='sr-only'>Search</span>
              <input
                type='text'
                className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                placeholder='Search chat...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
            {filteredChannels.map((channel) => {
              const displayName = getChannelDisplayName(channel, currentUser?._id || '')
              const icon = getChannelIcon(channel.type)
              const lastMessage = channel.lastMessage
              const isSelected = selectedChannelId === channel._id
              
              return (
                <div key={channel._id}>
                  <button
                    type='button'
                    className={cn(
                      `hover:bg-secondary/75 -mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm`,
                      isSelected && 'sm:bg-muted'
                    )}
                    onClick={() => {
                      setSelectedChannelId(channel._id)
                      setMobileSelectedChannel(true)
                    }}
                  >
                    <div className='flex w-full gap-2'>
                      {channel.type === 'direct' && channel.otherUser ? (
                        <Avatar>
                          <AvatarImage src={channel.otherUser.avatar} alt={displayName} />
                          <AvatarFallback>
                            {getInitials(channel.otherUser.firstName, channel.otherUser.lastName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                          {icon === '#' ? (
                            <IconHash size={20} className='text-muted-foreground' />
                          ) : icon === '🔒' ? (
                            <IconLock size={20} className='text-muted-foreground' />
                          ) : (
                            <span className='text-lg'>{icon}</span>
                          )}
                        </div>
                      )}
                      <div className='flex-1 overflow-hidden'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>
                            {displayName}
                          </span>
                          {channel.lastMessageAt && (
                            <span className='text-xs text-muted-foreground'>
                              {formatChannelTime(channel.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <span className='text-muted-foreground line-clamp-1 text-xs'>
                            {lastMessage.sender?._id === currentUser?._id ? 'You: ' : ''}
                            {truncateMessage(lastMessage.content)}
                          </span>
                        )}
                        {channel.unreadCount > 0 && (
                          <Badge variant='default' className='mt-1 h-5 px-1.5 text-xs'>
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  <Separator className='my-1' />
                </div>
              )
            })}
          </ScrollArea>
        </div>

        {/* Right Side - Chat View */}
        {selectedChannel ? (
          <div
            className={cn(
              'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex',
              mobileSelectedChannel && 'left-0 flex'
            )}
          >
            {/* Top Part - Channel Header */}
            <div className='bg-secondary mb-1 flex flex-none justify-between rounded-t-md p-4 shadow-lg'>
              <div className='flex gap-3'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='-ml-2 h-full sm:hidden'
                  onClick={() => setMobileSelectedChannel(false)}
                >
                  <IconArrowLeft />
                </Button>
                <div className='flex items-center gap-2 lg:gap-4'>
                  {selectedChannel.type === 'direct' && selectedChannel.otherUser ? (
                    <Avatar className='size-9 lg:size-11'>
                      <AvatarImage 
                        src={selectedChannel.otherUser.avatar} 
                        alt={selectedChannel.otherUser.username} 
                      />
                      <AvatarFallback>
                        {getInitials(
                          selectedChannel.otherUser.firstName, 
                          selectedChannel.otherUser.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className='flex size-9 items-center justify-center rounded-full bg-muted lg:size-11'>
                      {getChannelIcon(selectedChannel.type) === '#' ? (
                        <IconHash size={24} />
                      ) : (
                        <IconLock size={24} />
                      )}
                    </div>
                  )}
                  <div>
                    <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                      {getChannelDisplayName(selectedChannel, currentUser?._id || '')}
                    </span>
                    <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block text-xs lg:text-sm'>
                      {selectedChannel.type === 'direct' 
                        ? 'Direct Message' 
                        : `${channelMembers?.length || 0} members`}
                    </span>
                  </div>
                </div>
              </div>

              <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-10 rounded-md sm:h-8 sm:w-8 lg:h-10 lg:w-10'
                    >
                      <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem onClick={handleExportConversation}>
                      <IconDownload className='mr-2 h-4 w-4' />
                      Export Conversation
                    </DropdownMenuItem>
                    
                    {selectedChannel.type !== 'direct' && (
                      <>
                        <DropdownMenuSeparator />
                        {selectedChannel.type === 'public' && !isChannelMember && (
                          <DropdownMenuItem onClick={handleJoinChannel}>
                            <IconUserPlus className='mr-2 h-4 w-4' />
                            Join Channel
                          </DropdownMenuItem>
                        )}
                        {isChannelMember && !isChannelOwner && (
                          <DropdownMenuItem onClick={handleLeaveChannel}>
                            <IconLogout className='mr-2 h-4 w-4' />
                            Leave Channel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => toast.info('Invite members coming soon')}
                        >
                          <IconUsers className='mr-2 h-4 w-4' />
                          Invite Members
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDeleteConversation}
                      className='text-destructive focus:text-destructive'
                    >
                      <IconTrash className='mr-2 h-4 w-4' />
                      {selectedChannel.type === 'direct' ? 'Delete Conversation' : 'Delete Channel'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
              <ScrollArea ref={scrollAreaRef} className='flex-1'>
                <div className='flex flex-col gap-4 py-4'>
                  {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                      <div className='text-center text-xs text-muted-foreground mb-4'>
                        {date}
                      </div>
                      {dateMessages?.map((message) => {
                        const isOwnMessage = message.senderId === currentUser?._id
                        const sender = message.sender
                        
                        return (
                          <div
                            key={message._id}
                            className={cn(
                              'mb-4 flex gap-2',
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {!isOwnMessage && sender && (
                              <Avatar className='size-8'>
                                <AvatarImage src={sender.avatar} alt={sender.username} />
                                <AvatarFallback>
                                  {getInitials(sender.firstName, sender.lastName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                'max-w-[70%] rounded-lg px-3 py-2',
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary'
                              )}
                            >
                              {!isOwnMessage && sender && (
                                <div className='text-xs font-medium mb-1'>
                                  {sender.firstName} {sender.lastName}
                                </div>
                              )}
                              <div className='break-words'>{message.content}</div>
                              <div
                                className={cn(
                                  'text-xs opacity-70 mt-1',
                                  isOwnMessage ? 'text-right' : 'text-left'
                                )}
                              >
                                {formatMessageTime(message.createdAt)}
                                {message.editedAt && ' (edited)'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form 
                className='flex w-full flex-none gap-2'
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
              >
                <div className='border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4'>
                  <div className='space-x-1'>
                    <Button
                      size='icon'
                      type='button'
                      variant='ghost'
                      className='h-8 rounded-md'
                    >
                      <IconPlus size={20} className='stroke-muted-foreground' />
                    </Button>
                    <Button
                      size='icon'
                      type='button'
                      variant='ghost'
                      className='h-8 rounded-md'
                    >
                      <IconPaperclip size={20} className='stroke-muted-foreground' />
                    </Button>
                    <Button
                      size='icon'
                      type='button'
                      variant='ghost'
                      className='h-8 rounded-md'
                    >
                      <IconPhotoPlus size={20} className='stroke-muted-foreground' />
                    </Button>
                  </div>
                  <input
                    type='text'
                    className='w-full flex-1 bg-inherit py-2 focus-visible:outline-hidden'
                    placeholder='Type a message...'
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button
                  size='icon'
                  type='submit'
                  disabled={!messageInput.trim()}
                  className='rounded-md'
                >
                  <IconSend size={20} />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className='hidden flex-1 items-center justify-center sm:flex'>
            <div className='text-center'>
              <IconMessages size={64} className='mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium'>Select a conversation</h3>
              <p className='text-sm text-muted-foreground'>
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </section>

      <NewChat
        open={createConversationDialogOpened}
        onOpenChange={setCreateConversationDialog}
      />
      
      <ChannelDiscovery
        open={channelDiscoveryOpened}
        onOpenChange={setChannelDiscoveryOpened}
      />
    </Main>
  )
}