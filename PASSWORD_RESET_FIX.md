# 🔧 FIX: Password Reset Redirect Issue

## Problem
When clicking the password reset link in the email, users are redirected to the profile page instead of the reset-password page.

## Solution

### ✅ Code Fix Applied
The AuthContext has been updated to detect `PASSWORD_RECOVERY` events and automatically redirect to `/reset-password`.

### ⚙️ Supabase Configuration Required

You need to configure TWO different settings in Supabase:

---

## 1️⃣ Update URL Configuration

1. Go to: https://app.supabase.com/project/xkboeigznjtpdycqfzyq/auth/url-configuration
2. Set **Site URL** to: `https://parksafe.hu`
3. In **Redirect URLs**, make sure you have:
   ```
   https://parksafe.hu/*
   http://localhost:3000/*
   ```
   (The `/*` wildcard allows all paths on these domains)

4. Click **Save**

---

## 2️⃣ Check Auth Event Handler

The code fix I just applied will:
- Listen for `PASSWORD_RECOVERY` auth events
- Automatically redirect to `/reset-password` when detected
- Work for both localhost and production

---

## How It Works Now

### Old Flow (Broken):
1. User clicks link in email ❌
2. Supabase logs them in automatically
3. App redirects to `/profile`
4. User never sees password reset form

### New Flow (Fixed):
1. User clicks link in email ✅
2. Supabase logs them in automatically
3. **App detects PASSWORD_RECOVERY event**
4. **App redirects to `/reset-password`**
5. User can set new password
6. User is redirected to login

---

## Testing

1. **Stop your dev server** (Ctrl+C in terminal)
2. **Restart it**: `npm run dev`
3. Go to: http://localhost:3000/forgot-password
4. Enter your email
5. Click "Send Reset Link"
6. Check your email
7. **Click the reset link**
8. ✅ You should now be redirected to `/reset-password`
9. Enter your new password
10. ✅ Password is updated successfully

---

## Troubleshooting

### Still redirecting to profile?
1. Make sure you restarted the dev server after the code change
2. Clear your browser cache and cookies
3. Try in incognito/private mode
4. Check browser console for errors

### Link expired?
Password reset links are valid for 1 hour. Request a new one if needed.

### Can't set password?
Make sure:
- Password is at least 6 characters
- Both password fields match
- You're on the `/reset-password` page (not `/profile`)

---

## What Changed in the Code

**File**: `src/contexts/AuthContext.tsx`

Added detection for PASSWORD_RECOVERY events:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
    // Detect password recovery and redirect
    if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
        return;
    }
    
    fetchUserProfile(session);
});
```

This ensures users are always sent to the correct page when clicking a password reset link.

---

## ✅ Ready to Test!

The fix is now in place. Restart your dev server and test the flow!
