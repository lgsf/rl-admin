'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { userTypes } from '../data/data'
import { User } from '../data/schema'
import { Id } from '../../../../convex/_generated/dataModel'

const formSchema = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  lastName: z.string().min(1, 'Last Name is required.'),
  username: z.string().min(1, 'Username is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
  }),
  role: z.string().min(1, 'Role is required.'),
  systemGroups: z.array(z.string()).optional(),
  isEdit: z.boolean(),
})
type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const updateUser = useMutation(api.users.update)
  const updateRoleAndGroups = useMutation(api.users.updateRoleAndGroups)
  const createUser = useMutation(api.users.create)
  const systemGroupsData = useQuery(api.users.getUsersWithSystemGroups, {})
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          systemGroups: currentRow.systemGroups || [],
          isEdit,
        }
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          phoneNumber: '',
          systemGroups: [],
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit && currentRow) {
        // Update basic user info (email cannot be updated via this mutation)
        await updateUser({
          userId: currentRow.id as Id<"users">,
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          phoneNumber: values.phoneNumber,
        })
        
        // Update role and system groups if changed
        const systemGroupIds = systemGroupsData?.systemGroups
          .filter(g => values.systemGroups?.includes(g.name))
          .map(g => g._id)
        
        await updateRoleAndGroups({
          userId: currentRow.id as Id<"users">,
          role: values.role as "superadmin" | "admin" | "manager" | "user",
          systemGroups: systemGroupIds,
        })
        
        toast.success('User updated successfully')
      } else {
        // Create new user (password will be set via Clerk on first login)
        await createUser({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          phoneNumber: values.phoneNumber,
          role: values.role as "superadmin" | "admin" | "manager" | "user",
          status: "invited" as const,
        })
        
        toast.success('User created successfully')
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save user: ' + (error as Error).message)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john_doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+123456789'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Role
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a role'
                      className='col-span-4'
                      items={userTypes.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {isEdit && systemGroupsData && (
                <FormField
                  control={form.control}
                  name='systemGroups'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right pt-2'>
                        System Groups
                      </FormLabel>
                      <div className='col-span-4 space-y-2'>
                        {systemGroupsData.systemGroups.map((group) => (
                          <div key={group._id} className='flex items-center space-x-2'>
                            <Checkbox
                              id={group._id}
                              checked={field.value?.includes(group.name)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                if (checked) {
                                  field.onChange([...current, group.name])
                                } else {
                                  field.onChange(current.filter((g) => g !== group.name))
                                }
                              }}
                            />
                            <Label
                              htmlFor={group._id}
                              className='text-sm font-normal cursor-pointer'
                            >
                              {group.name}
                              {group.description && (
                                <span className='text-muted-foreground ml-2'>
                                  ({group.description})
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}