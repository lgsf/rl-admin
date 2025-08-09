import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export const useStoreUserEffect = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const storeUser = useMutation(api.auth.store);

  useEffect(() => {
    // If the user is not loaded yet, or is not signed in, do nothing
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Store the user in the database
    // This will create or update the user record
    const createOrUpdateUser = async () => {
      try {
        await storeUser();
      } catch (error) {
        console.error("Error storing user:", error);
      }
    };

    createOrUpdateUser();
  }, [isLoaded, isSignedIn, user?.id, storeUser]);

  return {
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
  };
};