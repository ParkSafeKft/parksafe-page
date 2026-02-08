# Supabase Email Templates - Copy & Paste

## 📧 Password Reset Email Template

### Configuration in Supabase Dashboard

**Path:** Authentication → Email Templates → Reset Password

---

### Subject Line
```
Reset your password for ParkSafe
```

---

### Email Body (HTML)

Copy and paste this entire template into Supabase:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔐 Password Reset</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Hi there,
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                We received a request to reset your password for your ParkSafe account. Click the button below to set a new password:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset My Password</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f8f8; border-radius: 4px; font-size: 12px; word-break: break-all; color: #666666;">
                                {{ .ConfirmationURL }}
                            </p>
                            
                            <!-- Security Notice -->
                            <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 20px; color: #856404;">
                                    <strong>⚠️ Security Notice:</strong><br>
                                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 20px; color: #666666;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999; text-align: center;">
                                © 2026 ParkSafe. All rights reserved.<br>
                                This email was sent to {{ .Email }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 🎨 Simple Version (Plain Text + HTML)

If you prefer a simpler template:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Reset Your Password</h2>
    
    <p>Hi,</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="margin: 30px 0; text-align: center;">
        <a href="{{ .ConfirmationURL }}" 
           style="display: inline-block; 
                  padding: 12px 24px; 
                  background-color: #4F46E5; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px;
                  font-weight: bold;">
            Reset Password
        </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
        Or copy this link: <br>
        <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">{{ .ConfirmationURL }}</code>
    </p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you didn't request this, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 ParkSafe | This email was sent to {{ .Email }}
    </p>
</div>
```

---

## 🔗 Available Variables

Supabase provides these template variables:

- `{{ .ConfirmationURL }}` - The password reset link with token
- `{{ .Token }}` - Just the token (if you want to build custom URL)
- `{{ .Email }}` - The user's email address
- `{{ .TokenHash }}` - Hashed version of the token
- `{{ .SiteURL }}` - Your site URL configured in Supabase

---

## ⚙️ How to Configure

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project
2. Click **Authentication** in the left sidebar
3. Click **Email Templates**

### Step 2: Select "Reset Password" Template
Find the template labeled **"Reset Password"** or **"Change/Forgot password"**

### Step 3: Paste the Template
1. Copy one of the templates above
2. Paste it into the **"Message Body"** field
3. Update the **Subject** field
4. Click **Save**

### Step 4: Configure Redirect URL
1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:3000/reset-password` (development)
   - `https://parksafe.hu/reset-password` (production)
3. Click **Save**

---

## 🎯 URL Structure

The email will contain a link like this:

```
https://parksafe.hu/reset-password?token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The token is automatically:
- ✅ Generated by Supabase
- ✅ Encrypted and secure
- ✅ Time-limited (expires after configured time)
- ✅ Single-use (can't be reused)

---

## ✅ Testing the Email

### Method 1: Use Inbucket (Supabase Local)
If using local Supabase:
1. Go to `http://localhost:54324`
2. You'll see all test emails there

### Method 2: Use Your Real Email
1. Go to `/forgot-password` on your site
2. Enter your email
3. Check your inbox
4. Click the reset link

### Method 3: Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Authentication**
3. Click **Logs**
4. You'll see the password reset request

---

## 🎨 Customization Tips

### Colors
- Change gradient: `#667eea` and `#764ba2` to your brand colors
- Change button color to match your site
- Update background colors

### Logo
Add your logo by inserting this in the header section:

```html
<img src="https://yourdomain.com/logo.png" 
     alt="ParkSafe" 
     style="max-width: 150px; margin-bottom: 20px;">
```

### Language
You can create multiple templates for different languages using Supabase's locale system.

---

## 🔒 Security Best Practices

✅ **Token Expiry**: Set in Supabase (default is 1 hour)
✅ **Rate Limiting**: Supabase automatically limits reset requests
✅ **HTTPS Required**: Always use HTTPS for reset links
✅ **Single Use**: Tokens can only be used once
✅ **No Password in Email**: Never send passwords via email

---

## 📱 Mobile-Responsive

Both templates are mobile-responsive and work on:
- ✅ Desktop email clients
- ✅ Mobile email apps
- ✅ Webmail (Gmail, Outlook, etc.)

---

Ready to use! Copy the template you prefer and paste it into your Supabase dashboard. 🚀
