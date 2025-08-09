import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}