export function TestEnv() {
  console.log("VITE_CLERK_PUBLISHABLE_KEY:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  console.log("Decoded key:", atob(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.replace('pk_test_', '').replace('$', '')));
  return <div>Check console for environment variables</div>;
}