import {
  IconBell,
  IconBrowserCheck,
  IconChecklist,
  IconFileText,
  IconLayoutDashboard,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'rladmin',
    email: 'admin@rladmin.com',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'RL Admin',
      logo: Command,
      plan: 'React + TypeScript',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: IconPackages,
        },
        {
          title: 'Chats',
          url: '/chats',
          icon: IconMessages,
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: 'Notifications',
          url: '/notifications',
          icon: IconBell,
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: IconFileText,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
      ],
    },
  ],
}
