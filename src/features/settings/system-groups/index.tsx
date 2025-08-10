import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import ContentSection from '../components/content-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SettingsSystemGroups() {
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Check if user has access to this feature
  const hasAccess = useQuery(api.systemGroups.checkFeatureAccess, { 
    feature: "notification_panel" 
  });
  
  // Get user's group details
  const userGroupDetails = useQuery(api.systemGroups.getUserGroupDetails, {});
  
  // Initialize system groups mutation
  const initializeGroups = useMutation(api.systemGroups.initializeSystemGroups);

  if (hasAccess === false) {
    return (
      <ContentSection
        title='System Groups'
        desc='Manage platform-wide system groups for notification targeting'
      >
        <Alert className="border-red-600 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            Access denied. This page is only available to platform administrators.
          </AlertDescription>
        </Alert>
      </ContentSection>
    );
  }

  const handleInitializeGroups = async () => {
    setIsInitializing(true);
    try {
      const result = await initializeGroups();
      toast.success(result.message || 'System groups initialized successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize system groups');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <ContentSection
      title='System Groups'
      desc='Manage platform-wide system groups for notification targeting and feature access control'
    >
      <div className="space-y-6">
        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">System Role: </span>
                <Badge variant="default" className="ml-2">
                  {userGroupDetails?.role || 'Unknown'}
                </Badge>
              </div>
              
              {userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">System Groups: </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userGroupDetails.systemGroups.map((group) => (
                      <Badge key={group._id} variant="secondary">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Initialize System Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Initialize System Groups
            </CardTitle>
            <CardDescription>
              {userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 
                ? 'System groups have been initialized. All users have been added to appropriate groups based on their roles.'
                : 'Set up the default system groups. This should be done once during initial setup.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 ? (
                    <>
                      <strong>System groups are already initialized.</strong>
                      <p className="mt-2 text-sm">
                        The initialization process adds all existing users to the appropriate system groups based on their roles:
                      </p>
                      <ul className="mt-2 ml-4 list-disc text-sm">
                        <li>All users → "All Platform Users" group</li>
                        <li>Admins & Superadmins → "Platform Administrators" group</li>
                        <li>Managers & above → "Platform Managers" group</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      This will create the following system groups and add all existing users:
                      <ul className="mt-2 ml-4 list-disc text-sm">
                        <li><strong>All Platform Users</strong> - Every registered user</li>
                        <li><strong>Platform Administrators</strong> - Superadmins and admins</li>
                        <li><strong>Platform Managers</strong> - Managers and above</li>
                      </ul>
                    </>
                  )}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleInitializeGroups}
                disabled={isInitializing || (userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0)}
                variant={userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 ? "secondary" : "default"}
                className="w-full sm:w-auto"
              >
                {isInitializing ? 'Initializing...' : 
                 userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 
                   ? 'System Groups Already Initialized' 
                   : 'Initialize System Groups'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Groups List */}
        {userGroupDetails?.systemGroups && userGroupDetails.systemGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active System Groups
              </CardTitle>
              <CardDescription>
                These are the platform-wide groups currently configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userGroupDetails.systemGroups.map((group) => (
                  <div key={group._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {group.description}
                          </p>
                        )}
                        {group.metadata && (
                          <div className="mt-2">
                            {(group.metadata as any).features && (
                              <div className="flex flex-wrap gap-1">
                                {(group.metadata as any).features.map((feature: string) => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {group.slug}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            System groups are used for platform-wide notification targeting and feature access control. 
            They are separate from organization-specific groups and are managed at the platform level.
          </AlertDescription>
        </Alert>
      </div>
    </ContentSection>
  );
}