import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon, CheckCircledIcon, UpdateIcon, CrossCircledIcon, ClockIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { cn } from '@/lib/utils'
import { useAppearanceSync } from '@/hooks/use-appearance-sync'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { useEffect } from 'react'
import { toast } from 'sonner'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  font: z.enum(fonts),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { 
    theme, 
    font, 
    syncStatus, 
    lastSync, 
    updateTheme, 
    updateFont,
    isLoading 
  } = useAppearanceSync()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme || 'system') as 'light' | 'dark' | 'system',
      font: font || 'inter',
    },
  })

  // Update form when sync data changes
  useEffect(() => {
    form.reset({
      theme: (theme || 'system') as 'light' | 'dark' | 'system',
      font: font || 'inter',
    })
  }, [theme, font, form])

  async function onSubmit(data: AppearanceFormValues) {
    try {
      // Update both theme and font through the sync hook
      if (data.font !== font) {
        await updateFont(data.font)
      }
      if (data.theme !== theme) {
        await updateTheme(data.theme)
      }
      
      toast.success('Appearance preferences updated')
    } catch (error) {
      toast.error('Failed to update appearance preferences')
      console.error('Failed to update appearance:', error)
    }
  }

  // Sync status indicator component
  const SyncStatusIndicator = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="gap-1">
          <UpdateIcon className="h-3 w-3 animate-spin" />
          Loading
        </Badge>
      )
    }

    switch (syncStatus) {
      case 'synced':
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircledIcon className="h-3 w-3" />
            Synced
          </Badge>
        )
      case 'syncing':
        return (
          <Badge variant="secondary" className="gap-1">
            <UpdateIcon className="h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <ClockIcon className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <CrossCircledIcon className="h-3 w-3" />
            Sync Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Sync Status Indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Sync Status</h3>
            <p className="text-sm text-muted-foreground">
              Your appearance settings sync across all devices
            </p>
          </div>
          <SyncStatusIndicator />
        </div>

        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-[200px] appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                    disabled={isLoading}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute top-2.5 right-3 h-4 w-4 opacity-50' />
              </div>
              <FormDescription className='font-manrope'>
                Set the font you want to use in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className='grid max-w-md grid-cols-2 gap-8 pt-2'
                disabled={isLoading}
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                        <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Light
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                        <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type='submit' disabled={isLoading}>
            Update preferences
          </Button>
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </form>
    </Form>
  )
}
