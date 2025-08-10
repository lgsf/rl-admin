import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ContentSection from '../components/content-section'

export default function SettingsGroups() {
  return (
    <ContentSection
      title='Organization Groups'
      desc='Manage groups within your organization'
    >
      <Card>
        <CardHeader>
          <CardTitle>Organization Groups</CardTitle>
          <CardDescription>
            Create and manage groups for organizing users within your
            organization. These groups can be used for permissions,
            notifications, and access control.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Organization groups feature is coming soon...
          </p>
        </CardContent>
      </Card>
    </ContentSection>
  )
}
