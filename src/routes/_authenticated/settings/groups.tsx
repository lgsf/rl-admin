import { createFileRoute } from '@tanstack/react-router'
import SettingsGroups from '@/features/settings/groups'

export const Route = createFileRoute('/_authenticated/settings/groups')({
  component: SettingsGroups,
})