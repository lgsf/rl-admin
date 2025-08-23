'use client'

import { useState } from 'react'
import { IconAlertCircle } from '@tabler/icons-react'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User } from '../data/schema'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'
import { Id } from '../../../../convex/_generated/dataModel'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersStatusDialog({ open, onOpenChange, currentRow }: Props) {
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>(
    currentRow.status === 'active' ? 'inactive' : 'active'
  )
  const [reason, setReason] = useState('')
  const updateStatus = useMutation(api.users.updateStatus)

  const handleStatusChange = async () => {
    try {
      await updateStatus({ 
        userId: currentRow.id as Id<"users">,
        status,
        reason: reason.trim() || undefined
      })
      
      const action = status === 'active' ? 'activated' : 
                    status === 'suspended' ? 'suspended' : 'deactivated'
      toast.success(`User ${currentRow.username} has been ${action} successfully`)
      onOpenChange(false)
      setReason('')
    } catch (error) {
      toast.error('Failed to update user status: ' + (error as Error).message)
    }
  }

  const getTitle = () => {
    if (currentRow.status === 'active') {
      return 'Change User Status'
    }
    return 'Activate User'
  }

  const getDescription = () => {
    if (currentRow.status === 'active') {
      return `User ${currentRow.username} is currently active. You can deactivate or suspend this account.`
    }
    return `User ${currentRow.username} is currently ${currentRow.status}. You can reactivate this account.`
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setReason('')
        setStatus(currentRow.status === 'active' ? 'inactive' : 'active')
        onOpenChange(state)
      }}
      handleConfirm={handleStatusChange}
      title={
        <span className='flex items-center gap-2'>
          <IconAlertCircle className='h-5 w-5' />
          {getTitle()}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            {getDescription()}
          </p>

          <div className='space-y-3'>
            <Label>New Status</Label>
            <RadioGroup value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              {currentRow.status !== 'active' && (
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='active' id='active' />
                  <Label htmlFor='active' className='font-normal cursor-pointer'>
                    Active - User can access the system normally
                  </Label>
                </div>
              )}
              {currentRow.status === 'active' && (
                <>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='inactive' id='inactive' />
                    <Label htmlFor='inactive' className='font-normal cursor-pointer'>
                      Inactive - User cannot log in (temporary)
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='suspended' id='suspended' />
                    <Label htmlFor='suspended' className='font-normal cursor-pointer'>
                      Suspended - User is suspended for policy violations
                    </Label>
                  </div>
                </>
              )}
            </RadioGroup>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reason'>
              Reason for status change (optional)
            </Label>
            <Textarea
              id='reason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Enter a reason for this status change...'
              className='min-h-[80px]'
            />
          </div>

          <div className='rounded-lg bg-muted p-3'>
            <p className='text-sm'>
              <strong>Current Status:</strong> {currentRow.status}
              <br />
              <strong>User Role:</strong> {currentRow.role}
              <br />
              <strong>Email:</strong> {currentRow.email}
            </p>
          </div>
        </div>
      }
      confirmText={
        status === 'active' ? 'Activate User' :
        status === 'suspended' ? 'Suspend User' :
        'Deactivate User'
      }
      destructive={status !== 'active'}
    />
  )
}