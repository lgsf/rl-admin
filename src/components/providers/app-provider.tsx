import { useStoreUserEffect } from "@/hooks/use-store-user";

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Sync Clerk user with Convex on login
  useStoreUserEffect();
  
  return <>{children}</>;
}