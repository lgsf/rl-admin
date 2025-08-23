import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  IconSearch,
  IconHash,
  IconUsers,
  IconCalendar,
  IconUserPlus,
  IconCheck,
} from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ChannelDiscoveryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChannelDiscovery({ open, onOpenChange }: ChannelDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [joinedChannels, setJoinedChannels] = useState<Set<Id<"channels">>>(new Set())

  // Fetch public channels
  const publicChannels = useQuery(
    api.channelActions.searchPublicChannels,
    { searchTerm: searchQuery || undefined }
  )
  
  // Join channel mutation
  const joinChannel = useMutation(api.channelActions.joinChannel)
  
  // Handle join channel
  const handleJoinChannel = async (channelId: Id<"channels">) => {
    try {
      await joinChannel({ channelId })
      setJoinedChannels(prev => new Set(prev).add(channelId))
      toast.success('Successfully joined channel')
    } catch (error) {
      toast.error('Failed to join channel')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Discover Channels</DialogTitle>
          <DialogDescription>
            Browse and join public channels in your organization
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search Bar */}
          <div className='relative'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' size={20} />
            <input
              type='text'
              placeholder='Search channels...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Channel List */}
          <ScrollArea className='h-[400px]'>
            {publicChannels === undefined ? (
              <div className='space-y-3'>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className='h-20 w-full' />
                ))}
              </div>
            ) : publicChannels.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {searchQuery ? 'No channels found matching your search' : 'No public channels available'}
              </div>
            ) : (
              <div className='space-y-3'>
                {publicChannels.map((channel) => {
                  const isJoined = channel.isMember || joinedChannels.has(channel._id)
                  
                  return (
                    <div
                      key={channel._id}
                      className='flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex gap-3 flex-1'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                          <IconHash size={20} className='text-muted-foreground' />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium'>{channel.name}</h4>
                            {channel.memberCount > 0 && (
                              <Badge variant='secondary' className='text-xs'>
                                <IconUsers size={12} className='mr-1' />
                                {channel.memberCount}
                              </Badge>
                            )}
                          </div>
                          {channel.description && (
                            <p className='text-sm text-muted-foreground line-clamp-2'>
                              {channel.description}
                            </p>
                          )}
                          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <IconCalendar size={14} />
                              Created {new Date(channel.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size='sm'
                        variant={isJoined ? 'secondary' : 'default'}
                        disabled={isJoined}
                        onClick={() => handleJoinChannel(channel._id)}
                      >
                        {isJoined ? (
                          <>
                            <IconCheck size={16} className='mr-1' />
                            Joined
                          </>
                        ) : (
                          <>
                            <IconUserPlus size={16} className='mr-1' />
                            Join
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}