import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  bio?: string;
  urls?: Array<{ value: string; label?: string }>;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Hook to update user profile in both Convex and Clerk
 * Ensures data consistency across both systems
 */
export function useProfileUpdate() {
  const { user: clerkUser } = useUser();
  const updateProfileInConvex = useMutation(api.auth.updateProfile);

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      // Step 1: Update in Convex (our source of truth for extended profile data)
      const convexResult = await updateProfileInConvex(data);

      // Step 2: Update critical fields in Clerk if they changed
      if (clerkUser) {
        const clerkUpdates: any = {};
        let hasClerkUpdates = false;

        // Only sync these fields to Clerk
        if (data.firstName && data.firstName !== clerkUser.firstName) {
          clerkUpdates.firstName = data.firstName;
          hasClerkUpdates = true;
        }
        
        if (data.lastName && data.lastName !== clerkUser.lastName) {
          clerkUpdates.lastName = data.lastName;
          hasClerkUpdates = true;
        }
        
        // Username in Clerk is stored in the username field
        if (data.username && data.username !== clerkUser.username) {
          clerkUpdates.username = data.username;
          hasClerkUpdates = true;
        }

        // Update Clerk if there are changes
        if (hasClerkUpdates) {
          try {
            await clerkUser.update(clerkUpdates);
            console.log("Profile synced with Clerk successfully");
          } catch (clerkError) {
            // Log the error but don't fail the whole operation
            // Convex is our source of truth
            console.error("Failed to sync with Clerk:", clerkError);
            toast.warning("Profile updated but couldn't sync all fields with authentication provider");
          }
        }
      }

      return convexResult;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  return {
    updateProfile,
    isClerkLoaded: !!clerkUser,
  };
}