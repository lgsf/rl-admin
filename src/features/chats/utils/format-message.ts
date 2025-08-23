import { format, isToday, isYesterday, isThisWeek, formatDistanceToNow } from 'date-fns'

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'h:mm a')
  }
  
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE h:mm a')
  }
  
  return format(date, 'MMM d, h:mm a')
}

export function formatChannelTime(timestamp: number | undefined): string {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'h:mm a')
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE')
  }
  
  return format(date, 'MMM d')
}

export function formatMessageDate(timestamp: number): string {
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return 'Today'
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  return format(date, 'MMMM d, yyyy')
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

export function truncateMessage(message: string, maxLength: number = 50): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || '??'
}

export function getChannelDisplayName(channel: any, currentUserId: string): string {
  if (channel.type === 'direct') {
    // For DMs, show the other person's name
    if (channel.otherUser) {
      return `${channel.otherUser.firstName} ${channel.otherUser.lastName}`.trim() || channel.otherUser.username
    }
    return 'Direct Message'
  }
  
  return channel.name
}

export function getChannelIcon(type: string): string {
  switch (type) {
    case 'public':
      return '#'
    case 'private':
      return '🔒'
    case 'direct':
      return ''
    default:
      return '#'
  }
}