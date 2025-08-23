import { Outlet } from '@tanstack/react-router'
import {
  IconBrowserCheck,
  IconNotification,
  IconPalette,
  IconTool,
  IconUser,
  IconTestPipe,
  IconShield,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import SidebarNav from './components/sidebar-nav'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useMemo } from 'react'

export default function Settings() {
  // Check if user has admin access
  const hasAdminAccess = useQuery(api.systemGroups.checkFeatureAccess, { 
    feature: "notification_panel" 
  });

  // Filter menu items based on user role
  const filteredMenuItems = useMemo(() => {
    const baseItems = [
      {
        title: 'Profile',
        icon: <IconUser size={18} />,
        href: '/settings',
      },
      {
        title: 'Account',
        icon: <IconTool size={18} />,
        href: '/settings/account',
      },
      {
        title: 'Appearance',
        icon: <IconPalette size={18} />,
        href: '/settings/appearance',
      },
      {
        title: 'Notifications',
        icon: <IconNotification size={18} />,
        href: '/settings/notifications',
      },
      {
        title: 'Notification Test',
        icon: <IconTestPipe size={18} />,
        href: '/settings/notification-test',
      },
      {
        title: 'Display',
        icon: <IconBrowserCheck size={18} />,
        href: '/settings/display',
      },
    ];

    // Only show System Groups to admins
    if (hasAdminAccess) {
      baseItems.push({
        title: 'System Groups',
        icon: <IconShield size={18} />,
        href: '/settings/system-groups',
      });
    }

    return baseItems;
  }, [hasAdminAccess]);

  return (
    <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={filteredMenuItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
    </Main>
  )
}

