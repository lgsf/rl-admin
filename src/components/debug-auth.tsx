import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export function DebugAuth() {
  const clerkAuth = useAuth();
  const convexAuth = useConvexAuth();

  useEffect(() => {
    console.log("=== AUTH DEBUG ===");
    console.log("Clerk Auth State:", {
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn,
      userId: clerkAuth.userId,
      sessionId: clerkAuth.sessionId,
      getToken: typeof clerkAuth.getToken,
    });
    
    console.log("Convex Auth State:", {
      isLoading: convexAuth.isLoading,
      isAuthenticated: convexAuth.isAuthenticated,
    });

    // Try to get the Convex token
    if (clerkAuth.isSignedIn && clerkAuth.getToken) {
      clerkAuth.getToken({ template: "convex" })
        .then(token => {
          console.log("✅ Got Convex JWT token:", token ? "Token received" : "No token");
        })
        .catch(error => {
          console.error("❌ Error getting Convex JWT token:", error);
        });
    }
  }, [clerkAuth, convexAuth]);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      padding: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white',
      fontSize: '12px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <div>Clerk: {clerkAuth.isSignedIn ? '✅' : '❌'}</div>
      <div>Convex: {convexAuth.isAuthenticated ? '✅' : '❌'}</div>
    </div>
  );
}