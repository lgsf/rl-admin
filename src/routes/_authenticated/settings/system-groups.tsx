import { createFileRoute } from '@tanstack/react-router';
import SettingsSystemGroups from '@/features/settings/system-groups';

export const Route = createFileRoute('/_authenticated/settings/system-groups')({
  component: SettingsSystemGroups,
});