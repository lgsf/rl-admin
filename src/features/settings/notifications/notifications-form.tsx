import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useEffect } from 'react'

const notificationsFormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: (iss) =>
      iss.input === undefined
        ? 'Please select a notification type.'
        : undefined,
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function NotificationsForm() {
  const preferences = useQuery(api.notificationPreferences.getNotificationPreferences)
  const updatePreferences = useMutation(api.notificationPreferences.updateNotificationPreferences)
  const sendTestNotification = useMutation(api.notifications.sendTestNotification)

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      type: 'all',
      communication_emails: false,
      marketing_emails: false,
      social_emails: true,
      security_emails: true,
      mobile: false,
    },
  })

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      form.reset({
        type: preferences.inApp?.type || 'all',
        communication_emails: preferences.email?.communication || false,
        marketing_emails: preferences.email?.marketing || false,
        social_emails: preferences.email?.social || true,
        security_emails: preferences.email?.security || true,
        mobile: preferences.mobile || false,
      })
    }
  }, [preferences, form])

  async function onSubmit(data: NotificationsFormValues) {
    try {
      await updatePreferences({
        inApp: {
          type: data.type,
          enabled: data.type !== 'none',
        },
        email: {
          communication: data.communication_emails,
          marketing: data.marketing_emails,
          social: data.social_emails,
          security: data.security_emails,
        },
        mobile: data.mobile,
      })
      
      toast.success('Notification preferences updated')
      
      // Send a test notification to confirm it's working
      if (data.type !== 'none') {
        await sendTestNotification({
          type: 'settings_updated',
          title: 'Settings Updated',
          message: 'Your notification preferences have been updated successfully.',
        })
      }
    } catch (error) {
      toast.error('Failed to update notification preferences')
      console.error('Failed to update preferences:', error)
    }
  }

  if (!preferences) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem className='relative space-y-3'>
              <FormLabel>Notify me about...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className='flex flex-col space-y-1'
                >
                  <FormItem className='flex items-center space-y-0 space-x-3'>
                    <FormControl>
                      <RadioGroupItem value='all' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      All new messages
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-y-0 space-x-3'>
                    <FormControl>
                      <RadioGroupItem value='mentions' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      Direct messages and mentions
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-y-0 space-x-3'>
                    <FormControl>
                      <RadioGroupItem value='none' />
                    </FormControl>
                    <FormLabel className='font-normal'>Nothing</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='relative'>
          <h3 className='mb-4 text-lg font-medium'>Email Notifications</h3>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='communication_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Communication emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about your account activity.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='marketing_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Marketing emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about new products, features, and more.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='social_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Social emails</FormLabel>
                    <FormDescription>
                      Receive emails for friend requests, follows, and more.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='security_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Security emails</FormLabel>
                    <FormDescription>
                      Receive emails about your account activity and security.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name='mobile'
          render={({ field }) => (
            <FormItem className='relative flex flex-row items-start space-y-0 space-x-3'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>
                  Use different settings for my mobile devices
                </FormLabel>
                <FormDescription>
                  You can manage your mobile notifications in the{' '}
                  <Link
                    to='/settings'
                    className='underline decoration-dashed underline-offset-4 hover:decoration-solid'
                  >
                    mobile settings
                  </Link>{' '}
                  page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type='submit'>Update notifications</Button>
      </form>
    </Form>
  )
}
