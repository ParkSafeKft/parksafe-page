# Supabase Email Templates for ParkSafe

This document contains the proper email templates for Supabase authentication flows, specifically for password reset functionality.

## How to Configure Email Templates in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `xkboeigznjtpdycqfzyq`
3. Navigate to **Authentication** → **Email Templates**
4. Replace the default templates with the ones below

---

## 1. Reset Password Email Template

**Template Name:** Reset Password (Magic Link)

### Subject Line
```
Reset your ParkSafe password
```

### Email Body (HTML)

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

---

## 2. Confirm Email Change Template

**Template Name:** Change Email Address

### Subject Line
```
Confirm your email change - ParkSafe
```

### Email Body (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - ParkSafe</title>
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
        .info-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #92400e;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚲 ParkSafe</div>
        </div>
        
        <div class="content">
            <h1>Confirm Email Change</h1>
            
            <p>Hello,</p>
            
            <p>We received a request to change the email address associated with your ParkSafe account.</p>
            
            <p>To confirm this change, click the button below:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Change</a>
            
            <div class="info-box">
                <p><strong>⚠️ Security Notice</strong></p>
                <p>If you didn't request this change, please contact our support team immediately.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>ParkSafe - Urban Cycling Reimagined</p>
            <p>&copy; 2025 ParkSafe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. Magic Link Email (Email Signup/Login)

**Template Name:** Magic Link

### Subject Line
```
Your ParkSafe login link
```

### Email Body (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login to ParkSafe</title>
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
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚲 ParkSafe</div>
        </div>
        
        <div class="content">
            <h1>Login to ParkSafe</h1>
            
            <p>Click the button below to securely log in to your ParkSafe account:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Log In</a>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 30px;">This link will expire in 1 hour and can only be used once.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 ParkSafe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## Configuration Steps in Supabase Dashboard

### Step 1: Navigate to Email Templates
1. Login to Supabase Dashboard
2. Select project `xkboeigznjtpdycqfzyq`
3. Go to **Authentication** → **Email Templates**

### Step 2: Configure URL Settings
Before setting up templates, configure the redirect URLs:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://parksafe.hu`
3. Add **Redirect URLs**:
   - `https://parksafe.hu/reset-password`
   - `http://localhost:3000/reset-password` (for development)
   - `https://parksafe.hu/profile`
   - `http://localhost:3000/profile` (for development)

### Step 3: Update Each Template
1. Select **"Reset Password"** template
2. Paste the HTML code from above
3. Update the subject line
4. Click **Save**
5. Repeat for other templates

### Step 4: Test the Email Flow
1. Go to your app: `http://localhost:3000/forgot-password`
2. Enter a valid email address
3. Click "Send Reset Link"
4. Check your email inbox
5. Click the reset link
6. You should be redirected to `/reset-password` with a valid session
7. Set a new password

---

## Important Notes

### Email Variables
Supabase provides these template variables:
- `{{ .ConfirmationURL }}` - The magic link/reset URL with token
- `{{ .Token }}` - The raw token (rarely needed)
- `{{ .TokenHash }}` - Hashed token (rarely needed)
- `{{ .SiteURL }}` - Your configured site URL

### Security Best Practices
1. **Token Expiration**: Password reset links expire in 1 hour by default
2. **One-time Use**: Each link can only be used once
3. **HTTPS Only**: In production, always use HTTPS for redirect URLs
4. **Email Rate Limiting**: Supabase limits password reset requests to prevent abuse

### Customization
You can customize:
- Brand colors (currently using ParkSafe green: `#34aa56`)
- Logo (replace emoji with an image URL)
- Support email
- Footer links
- Company name and copyright

---

## Troubleshooting

### Email not arriving?
1. Check spam/junk folder
2. Verify email template is saved in Supabase
3. Check Supabase logs: **Authentication** → **Logs**
4. Ensure SMTP is configured (free tier uses Supabase SMTP)

### Link not working?
1. Verify redirect URL is added to allowed list
2. Check that the link hasn't expired (1 hour limit)
3. Ensure the link hasn't been used already
4. Check browser console for errors

### Custom SMTP (Optional)
For better deliverability, configure custom SMTP:
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Add your SMTP credentials (e.g., SendGrid, AWS SES, etc.)

---

## Testing Locally

To test the password reset flow locally:

```bash
# Start your Next.js development server
npm run dev

# Navigate to forgot password page
http://localhost:3000/forgot-password

# Enter your email and submit
# Check your email inbox
# Click the reset link
# You'll be redirected to http://localhost:3000/reset-password
# Set a new password
```

Make sure your `.env` file has the correct Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xkboeigznjtpdycqfzyq.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Production Checklist

Before going to production:

- [ ] Configure custom domain in Supabase
- [ ] Update Site URL to production domain
- [ ] Add all production redirect URLs to allowed list
- [ ] Test email flow on production domain
- [ ] Consider custom SMTP for better deliverability
- [ ] Update email templates with production support email
- [ ] Test all email templates (reset password, email change, magic link)
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting if needed

---

**Need Help?**
Contact ParkSafe support or check Supabase documentation:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
