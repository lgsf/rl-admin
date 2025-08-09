import { createFileRoute } from '@tanstack/react-router'
import { NotificationTestPage } from '@/features/settings/notification-test'

export const Route = createFileRoute('/_authenticated/settings/notification-test')({
  component: NotificationTestPage,
})