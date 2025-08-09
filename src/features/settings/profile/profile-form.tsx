import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens.'),
  email: z.string().email('Please enter a valid email address.'),
  bio: z.string().max(160, 'Bio must not be longer than 160 characters.').optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const userProfile = useQuery(api.auth.getUserProfile)
  const updateProfile = useMutation(api.auth.updateProfile)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  
  // Check username availability
  const usernameCheck = useQuery(
    api.auth.checkUsernameAvailability,
    checkingUsername ? { username: checkingUsername } : 'skip'
  )

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      urls: [],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  // Update form when user data loads
  useEffect(() => {
    if (userProfile) {
      form.reset({
        username: userProfile.username || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        urls: userProfile.urls?.map(url => ({ value: url.value })) || [],
      })
    }
  }, [userProfile, form])

  // Update username availability when check completes
  useEffect(() => {
    if (usernameCheck !== undefined && checkingUsername) {
      setUsernameAvailable(usernameCheck?.available ?? null)
    }
  }, [usernameCheck, checkingUsername])

  // Check username availability when it changes
  const handleUsernameChange = (value: string) => {
    if (value === userProfile?.username) {
      setUsernameAvailable(true)
      setCheckingUsername(null)
      return
    }

    if (value.length >= 2) {
      setCheckingUsername(value)
    } else {
      setUsernameAvailable(null)
      setCheckingUsername(null)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true)
      
      await updateProfile({
        username: data.username,
        email: data.email,
        bio: data.bio || '',
        urls: data.urls?.map(url => ({ value: url.value })) || [],
      })

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (userProfile === undefined) {
    return (
      <div className='space-y-8'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-24 w-full' />
        </div>
      </div>
    )
  }

  // Calculate days until username can be changed
  const getDaysUntilUsernameChange = () => {
    if (!userProfile?.lastUsernameChange) return 0
    const daysSince = (Date.now() - userProfile.lastUsernameChange) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(30 - daysSince))
  }

  const daysUntilChange = getDaysUntilUsernameChange()
  const canChangeUsername = daysUntilChange === 0

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input 
                    placeholder='Enter your username' 
                    {...field}
                    disabled={!canChangeUsername}
                    onChange={(e) => {
                      field.onChange(e)
                      handleUsernameChange(e.target.value)
                    }}
                  />
                  {field.value && field.value.length >= 2 && (
                    <div className='absolute right-2 top-2.5'>
                      {checkingUsername === field.value && usernameCheck === undefined ? (
                        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                      ) : usernameAvailable === true ? (
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                      ) : usernameAvailable === false ? (
                        <XCircle className='h-4 w-4 text-red-500' />
                      ) : null}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                {canChangeUsername ? (
                  'This is your public display name. You can only change this once every 30 days.'
                ) : (
                  <span className='text-amber-600'>
                    Username can be changed in {daysUntilChange} days.
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type='email'
                  placeholder='your@email.com'
                  {...field}
                  disabled // Email is managed by Clerk
                />
              </FormControl>
              <FormDescription>
                Your email is managed through your authentication provider.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/160 characters. You can <span>@mention</span> other users and organizations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className='space-y-4'>
          <div>
            <FormLabel>URLs</FormLabel>
            <FormDescription>
              Add links to your website, blog, or social media profiles.
            </FormDescription>
          </div>
          
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Input 
                        placeholder='https://example.com'
                        {...field} 
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => remove(index)}
                      >
                        <XCircle className='h-4 w-4' />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ value: '' })}
          >
            Add URL
          </Button>
        </div>
        
        <div className='flex gap-4'>
          <Button 
            type='submit' 
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              'Update profile'
            )}
          </Button>
          
          {form.formState.isDirty && (
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          )}
        </div>
        
        {userProfile?.updatedAt && (
          <p className='text-sm text-muted-foreground'>
            Last updated: {new Date(userProfile.updatedAt).toLocaleDateString()}
          </p>
        )}
      </form>
    </Form>
  )
}