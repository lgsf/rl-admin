# 🚨 URGENT: Clerk JWT Template Setup Required

## The Issue
You're getting the error: **"JWT template not found - No JWT template exists with name: convex"**

This means the Clerk Dashboard doesn't have the required JWT template for Convex integration.

## ✅ Quick Fix Steps

### 1. Open Clerk Dashboard
Go to: https://dashboard.clerk.com

### 2. Select Your Application
Choose the application: **working-platypus-51**

### 3. Navigate to JWT Templates
- In the left sidebar, click on **"Configure"**
- Then click on **"JWT Templates"**

### 4. Create New Template
Click **"+ New template"** button

### 5. Choose Convex Template (Preferred)
If you see **"Convex"** in the template list:
- Select it
- It will auto-configure everything
- Click **"Save"**

### 6. OR Create Custom Template
If Convex template isn't available, create a custom one:

**IMPORTANT: The name MUST be exactly `convex` (lowercase)**

Fill in these fields:
- **Name**: `convex` (⚠️ MUST be exactly this)
- **Token lifetime**: `60` (seconds)
- **Custom claims** (paste this JSON):

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

### 7. Save the Template
Click **"Save"** button

### 8. Copy the Issuer URL
After saving, you'll see an **"Issuer"** URL that looks like:
`https://working-platypus-51.clerk.accounts.dev`

### 9. Verify Configuration
Check that `/convex/auth.config.ts` has the correct domain:
```typescript
export default {
  providers: [
    {
      domain: "https://working-platypus-51.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

## 🔄 After Setup

1. **Refresh your app** in the browser
2. **Try signing in again**
3. The error should be gone!

## 🎯 What This Does

The JWT template tells Clerk what information to include when authenticating with Convex:
- User's name, email, and avatar
- Username and verification status
- Custom claims that Convex uses to create/update users

## ⚠️ Common Mistakes to Avoid

1. **Wrong template name**: Must be exactly `convex` (lowercase)
2. **Missing claims**: Make sure all the JSON claims are included
3. **Wrong issuer URL**: Must match your Clerk instance

## 📝 Verification

Once configured correctly:
1. Sign in to your app
2. Check Convex Dashboard (https://dashboard.convex.dev)
3. Look in the `users` table - you should see your user created

## Need Help?

If you're still getting errors after setting up the JWT template:
1. Double-check the template name is exactly `convex`
2. Make sure you saved the template
3. Try signing out and back in
4. Check browser console for any new errors

---

**This is blocking authentication!** Please complete these steps before continuing.