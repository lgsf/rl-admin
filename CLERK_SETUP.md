# Clerk JWT Template Setup for Convex

## Important: Manual Setup Required in Clerk Dashboard

To complete the authentication setup, you need to configure a JWT template in your Clerk Dashboard:

### Steps:

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Navigate to JWT Templates**
   - Go to "Configure" → "JWT Templates"
   - Click "New template"

3. **Create Convex Template**
   - Select "Convex" from the template list (if available)
   - OR create a custom template with:
   - **Name**: Must be exactly `convex` (lowercase)
   - **Token lifetime**: 60 seconds (default)
   - **Claims**: The official Convex template uses:

```json
{
  "aud": "convex",
  "name": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "picture": "{{user.image_url}}",
  "nickname": "{{user.username}}",
  "given_name": "{{user.first_name}}",
  "updated_at": "{{user.updated_at}}",
  "family_name": "{{user.last_name}}",
  "phone_number": "{{user.primary_phone_number}}",
  "email_verified": "{{user.email_verified}}",
  "phone_number_verified": "{{user.phone_number_verified}}"
}
```

4. **Save the Template**
   - Click "Save"
   - Copy the "Issuer" URL (it should look like: `https://working-platypus-51.clerk.accounts.dev`)

5. **Verify Configuration**
   - The issuer URL in `/convex/auth.config.ts` should match your Clerk issuer
   - Current setting: `https://working-platypus-51.clerk.accounts.dev`

## Testing the Integration

After setting up the JWT template:

1. Restart your development server: `npm run dev`
2. Try signing in with Clerk
3. Check Convex Dashboard to see if users are being created

## Troubleshooting

If authentication isn't working:

1. **Check Browser Console** for any Clerk or Convex errors
2. **Verify JWT Template Name** is exactly "convex"
3. **Check Convex Logs**: `npx convex logs`
4. **Verify Environment Variables**:
   - `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
   - `VITE_CONVEX_URL` is set correctly

## Current Status

- ✅ Convex auth.config.ts configured
- ✅ User sync function (auth.store) implemented
- ✅ Frontend hooks configured
- ⏳ **Awaiting**: JWT template creation in Clerk Dashboard

Once you complete the JWT template setup in Clerk, the authentication should work seamlessly!