import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema } from './data/schema'
import { users as mockUsers } from './data/users'

export default function Users() {
  // Fetch users from Convex
  const convexUsers = useQuery(api.users.list, {})
  const usersWithGroups = useQuery(api.users.getUsersWithSystemGroups, {})
  
  // Loading state
  if (convexUsers === undefined) {
    return (
      <UsersProvider>
        <Header fixed>
          <Search />
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
              <p className='text-muted-foreground'>
                Loading users...
              </p>
            </div>
          </div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        </Main>
      </UsersProvider>
    )
  }
  
  // Transform Convex users to match the expected schema
  const transformedUsers = usersWithGroups?.users?.map(user => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    status: user.status,
    role: user.role,
    systemGroups: user.systemGroupNames || [],
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  })) || convexUsers?.map(user => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    status: user.status,
    role: user.role,
    systemGroups: [],
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  })) || []
  
  // Parse user list with schema or use mock data
  const userList = transformedUsers.length > 0 
    ? userListSchema.parse(transformedUsers)
    : userListSchema.parse(mockUsers)

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
