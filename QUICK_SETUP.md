# 🚀 Quick Setup: Supabase Email Templates for parksafe.hu

## Step-by-Step Instructions

### 1️⃣ Open Supabase Dashboard

1. Go to: https://app.supabase.com
2. Login with your credentials
3. Select project: **peszabolcs's Project** (ID: `xkboeigznjtpdycqfzyq`)

---

### 2️⃣ Configure URL Settings (IMPORTANT - Do This First!)

1. Click on **Authentication** in the left sidebar
2. Click on **URL Configuration** tab
3. Set the following:

**Site URL:**
```
https://parksafe.hu
```

**Redirect URLs** (add all of these):
```
https://parksafe.hu/*
http://localhost:3000/*
```
**Note**: The `/*` wildcard allows all paths on these domains, which is needed for the password reset flow.

4. Click **Save**

---

### 3️⃣ Configure Email Templates

1. Still in **Authentication**, click on **Email Templates** tab
2. You'll see several templates. We need to update the **"Reset Password"** template

#### Update "Reset Password" Template:

1. Click on **"Reset Password"** in the list
2. Update the **Subject Line** to:
   ```
   Reset your ParkSafe password
   ```

3. **Copy the entire HTML code below** and paste it into the **Message Body (HTML)** field:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ParkSafe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #34aa56 0%, #2d8a47 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 16px 0;
        }
        p {
            font-size: 16px;
            color: #475569;
            margin: 0 0 20px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: scale(1.02);
        }
        .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #34aa56;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #94a3b8;
        }
        .footer a {
            color: #34aa56;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚲 ParkSafe</div>
        </div>
        
        <div class="content">
            <h1>Reset Your Password</h1>
            
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your ParkSafe account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            
            <div class="info-box">
                <p><strong>⏱️ This link will expire in 1 hour</strong></p>
                <p>For your security, password reset links are only valid for 60 minutes.</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">{{ .ConfirmationURL }}</p>
        </div>
        
        <div class="footer">
            <p>ParkSafe - Urban Cycling Reimagined</p>
            <p>
                <a href="https://parksafe.hu">Visit our website</a> · 
                <a href="mailto:support@parksafe.hu">Contact support</a>
            </p>
            <p style="margin-top: 20px;">&copy; 2025 ParkSafe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

4. Click **Save**

---

### 4️⃣ Test the Email Flow

Now that everything is configured, test it:

1. Open your app: http://localhost:3000 (or run `npm run dev` first)
2. Navigate to: http://localhost:3000/forgot-password
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email inbox
6. Click the reset link in the email
7. You should be redirected to `/reset-password`
8. Enter a new password and confirm it
9. Click "Change Password"
10. You'll be redirected to login with your new password

---

## ✅ Configuration Checklist

- [ ] Opened Supabase Dashboard
- [ ] Selected correct project (xkboeigznjtpdycqfzyq)
- [ ] Set Site URL to `https://parksafe.hu`
- [ ] Added all 4 redirect URLs
- [ ] Saved URL configuration
- [ ] Updated "Reset Password" email template
- [ ] Saved email template
- [ ] Tested the flow locally
- [ ] Verified email arrives in inbox
- [ ] Clicked reset link from email
- [ ] Successfully reset password
- [ ] Logged in with new password

---

## 🎨 What the Email Will Look Like

When users receive the password reset email, they'll see:

- **ParkSafe branding** with green gradient header
- **Clear "Reset Password" button** - easy to click
- **Security information** - 1 hour expiration notice
- **Fallback link** - in case button doesn't work
- **Professional footer** with link to parksafe.hu
- **Mobile-friendly design** - works on all devices

---

## 🔍 Troubleshooting

### Email not arriving?
1. ✅ Check spam/junk folder
2. ✅ Verify email template is saved in Supabase
3. ✅ Check Authentication → Logs in Supabase Dashboard
4. ✅ Make sure the user email exists in your database

### Reset link not working?
1. ✅ Verify all 4 redirect URLs are added to Supabase
2. ✅ Check that Site URL is set to `https://parksafe.hu`
3. ✅ Make sure link hasn't expired (1 hour limit)
4. ✅ Check browser console for errors

### Still having issues?
- Check Supabase Dashboard → Authentication → Logs for detailed error messages
- Verify your `.env` file has correct Supabase credentials
- Make sure Next.js dev server is running

---

## 📧 Production Deployment

When you're ready to deploy to production (parksafe.hu):

1. ✅ Make sure Site URL in Supabase is `https://parksafe.hu`
2. ✅ All redirect URLs include production domain
3. ✅ Test password reset on production domain
4. ✅ Consider setting up custom SMTP for better email deliverability
5. ✅ Monitor Supabase Auth logs for any issues

---

## 🎯 Quick Links

- **Supabase Dashboard**: https://app.supabase.com/project/xkboeigznjtpdycqfzyq
- **Authentication Settings**: https://app.supabase.com/project/xkboeigznjtpdycqfzyq/auth/users
- **Email Templates**: https://app.supabase.com/project/xkboeigznjtpdycqfzyq/auth/templates
- **Local Dev**: http://localhost:3000/forgot-password

---

**That's it! You're all set up! 🎉**

The password reset flow is now fully configured and ready to use.
