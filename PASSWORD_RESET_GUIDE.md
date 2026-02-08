# Password Reset Flow - Complete Setup Guide

## 🔄 Flow Overview

1. **User forgets password** → Goes to `/forgot-password`
2. **User enters email** → Clicks "Send reset link"
3. **Supabase sends email** → Email contains link: `parksafe.hu/reset-password?token=xxxxx`
4. **User clicks link** → Redirected to `/reset-password`
5. **User enters new password** → Password is updated
6. **User is redirected to login** → Can log in with new password

## ✅ What's Been Implemented

### 1. Pages Created

- **`/forgot-password`** - Where users request a password reset
- **`/reset-password`** - Where users set their new password (with token validation)

### 2. Auth Context Updated

Added two new functions to `AuthContext`:
- `requestPasswordReset(email)` - Sends the password reset email
- `updatePassword(newPassword)` - Updates the user's password

### 3. TypeScript Types Updated

Added the new functions to `AuthContextType` interface.

## 🔧 Supabase Configuration Required

### Step 1: Configure Email Templates in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Find the **"Reset Password"** template
4. Update the template with this configuration:

**Subject:**
```
Reset your password
```

**Body (HTML):**
```html
<h2>Reset your password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

### Step 2: Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/reset-password` (for development)
   - `https://parksafe.hu/reset-password` (for production)

### Step 3: Email Settings

1. Go to **Authentication** → **Email**
2. Ensure **Enable email confirmations** is turned ON
3. Set **Confirm email** to whatever suits your needs
4. **IMPORTANT**: The link Supabase sends will automatically include the token

## 🎯 Key Security Features

### Token-Based Reset (NOT Auto-Login)

The implementation ensures:
- ✅ User MUST provide a new password (no auto-login)
- ✅ Token is validated before showing the password form
- ✅ Expired tokens show an error message
- ✅ After password update, user is logged out and redirected to login

### How It Works

1. When user clicks the email link, Supabase sets a **recovery session**
2. The `/reset-password` page checks for this session
3. If valid → Shows password form
4. If invalid → Shows error and link to request new reset
5. After password update → User is logged out (must log in with new password)

## 📝 How to Use

### For Users

1. Go to `parksafe.hu/forgot-password`
2. Enter your email address
3. Check your email for the reset link
4. Click the link (goes to `parksafe.hu/reset-password?token=xxxxx`)
5. Enter your new password (twice for confirmation)
6. Click "Update password"
7. You'll be redirected to login - use your new password!

### Adding Link to Login Page

Add this to your login page where appropriate:

```tsx
<a 
  href="/forgot-password"
  className="text-sm text-blue-600 hover:text-blue-500"
>
  Forgot your password?
</a>
```

## 🧪 Testing

### Test the Flow

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/forgot-password`
3. Enter a valid user email from your Supabase auth users
4. Check the email inbox (or Supabase logs if using test email)
5. Click the reset link
6. Enter a new password
7. Verify you can log in with the new password

### Common Issues & Solutions

**Issue:** Email not received
- Check Supabase Dashboard → Authentication → Logs
- Verify email settings are configured
- Check spam folder
- For development, check if you need to confirm email sending

**Issue:** "Invalid or expired reset link"
- Links expire after a certain time (configurable in Supabase)
- Request a new link
- Ensure redirect URL is configured correctly

**Issue:** User auto-logged in without entering password
- This shouldn't happen with our implementation
- We explicitly check for session and require password entry
- After update, we call `signOut()` to force re-login

## 🎨 Customization

### Styling

Both pages use Tailwind CSS. You can customize:
- Colors (currently using `indigo-600`)
- Layout structure
- Error/success message styling
- Button styles

### Email Template

Customize in Supabase Dashboard:
- Add your logo
- Change colors to match your brand
- Add additional information
- Change the email copy

### Redirect Logic

In `AuthContext.tsx`, you can change where users are redirected:

```tsx
const requestPasswordReset = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`; // Change this
    // ...
};
```

## 📋 Complete File Summary

| File | Purpose |
|------|---------|
| `src/app/forgot-password/page.tsx` | Request password reset page |
| `src/app/reset-password/page.tsx` | Set new password page |
| `src/contexts/AuthContext.tsx` | Auth functions for password reset |
| `src/types/index.ts` | TypeScript interfaces |

## 🚀 Next Steps

1. ✅ Configure Supabase email templates
2. ✅ Add redirect URLs in Supabase settings
3. ✅ Add "Forgot password?" link to your login page
4. ✅ Test the entire flow
5. ✅ Customize styling to match your brand
6. ✅ Set up production email provider (if needed)

## 💡 Pro Tips

- **Email Provider**: For production, consider using a dedicated email service (SendGrid, AWS SES) via Supabase
- **Rate Limiting**: Supabase has built-in rate limiting for password resets
- **User Feedback**: The forms show clear success/error messages
- **Session Management**: After password reset, we force logout to ensure security

---

That's it! Your password reset flow is ready to use. 🎉
