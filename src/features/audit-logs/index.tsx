import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { format } from 'date-fns'
import { Main } from '@/components/layout/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconSearch } from '@tabler/icons-react'

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [resourceFilter, setResourceFilter] = useState<string>('')
  
  const logs = useQuery(api.auditLogs.list, {
    action: actionFilter || undefined,
    resource: resourceFilter || undefined,
    limit: 200,
  })

  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      log.userName?.toLowerCase().includes(search) ||
      log.userEmail?.toLowerCase().includes(search) ||
      log.targetUserName?.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search)
    )
  })

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('delete')) return 'destructive'
    if (action.includes('create')) return 'success'
    if (action.includes('update') || action.includes('edit')) return 'warning'
    if (action.includes('status')) return 'secondary'
    return 'default'
  }

  const formatAction = (action: string) => {
    return action
      .split('.')
      .join(' ')
      .split('_')
      .join(' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const renderChanges = (changes: any) => {
    if (!changes) return null
    
    return (
      <div className="text-xs space-y-1">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium capitalize">{key}:</span>
            <span className="text-muted-foreground">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Loading state
  if (logs === undefined) {
    return (
      <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Audit Logs</h2>
              <p className='text-muted-foreground'>
                Loading activity logs...
              </p>
            </div>
          </div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
      </Main>
    )
  }

  return (
    <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Audit Logs</h2>
            <p className='text-muted-foreground'>
              View system activity and changes made by users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={actionFilter || "all"} onValueChange={(value) => setActionFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user.created">User Created</SelectItem>
              <SelectItem value="user.updated">User Updated</SelectItem>
              <SelectItem value="user.deleted">User Deleted</SelectItem>
              <SelectItem value="user.status_changed">Status Changed</SelectItem>
              <SelectItem value="user.role_updated">Role Updated</SelectItem>
              <SelectItem value="user.invited">User Invited</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resourceFilter || "all"} onValueChange={(value) => setResourceFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="organizations">Organizations</SelectItem>
              <SelectItem value="groups">Groups</SelectItem>
              <SelectItem value="notifications">Notifications</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          {log.userEmail && (
                            <div className="text-xs text-muted-foreground">
                              {log.userEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getActionBadgeVariant(log.action) as any}
                          className="font-mono text-xs"
                        >
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium capitalize">{log.resource}</div>
                          {log.targetUserName && (
                            <div className="text-xs text-muted-foreground">
                              {log.targetUserName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderChanges(log.changes)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
    </Main>
  )
}