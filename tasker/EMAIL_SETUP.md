# Email Notification Setup Guide

The Tasker application includes an **Email Notification Service** that sends automated emails for various user actions.

## Supported Email Actions

✉️ **Welcome Email** - Sent when user registers
📧 **Task Notifications** - Sent when:
  - Task is created
  - Task is completed
  - Task is updated
  - Task is deleted
📊 **Daily Summary** - Daily task summary email
🔒 **Password Reset** - Password reset confirmation

## Setup Instructions

### Step 1: Get Gmail App Password (Recommended Method)

1. **Enable 2-Factor Authentication on Gmail:**
   - Go to [https://myaccount.google.com/](https://myaccount.google.com/)
   - Click **Security** in left menu
   - Enable **2-Step Verification**

2. **Generate App Password:**
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select **Mail** and **Windows Computer** (or your device)
   - Click **Generate**
   - Copy the generated 16-character password

3. **Update Backend `.env` File:**
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```

---

### Step 2: Alternative - Use Other Email Providers

#### **Outlook/Hotmail:**
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
```

#### **Yahoo Mail:**
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASSWORD=your_app_password
```

#### **SendGrid:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx
```

---

### Step 3: Test Email Configuration

Once configured, the backend will test the connection on startup.

**Manually Test:**
```bash
# From backend directory
cd tasker
npm start
```

Look for the message:
```
✅ Email service is properly configured
```

If there's an error:
```
❌ Email service configuration error: ...
```

---

## Common Issues & Solutions

### ❌ "Invalid credentials" or "Authentication failed"

**Solution:**
1. Verify email and password are correct in `.env`
2. For Gmail: Make sure you're using **App Password**, not regular password
3. Ensure 2-Factor Authentication is enabled

### ❌ "SMTP connection timeout"

**Solution:**
1. Check your internet connection
2. Verify the SMTP host and port are correct
3. Check if your firewall blocks port 587
4. Try a different email provider

### ❌ "Error: getaddrinfo ENOTFOUND"

**Solution:**
1. Verify the EMAIL_HOST is correct
2. Check internet connectivity
3. Confirm environment variables are properly set

### ❌ Emails not being sent but no error

**Solution:**
1. Check the email address is valid
2. Verify EMAIL_USER and EMAIL_PASSWORD are set
3. Check spam/junk folder
4. Restart the backend server after updating `.env`

---

## Email Templates

### Welcome Email
Sent when user registers - includes:
- Welcome message
- Features overview
- Call-to-action to start using app

### Task Created Email
- Task title, description, priority
- Due date (if set)
- Link to dashboard

### Task Completed Email
- Congratulation message
- Task details
- Link to dashboard

### Task Summary Email
- Pending task count
- Completed task count today
- List of top 5 pending tasks
- Link to dashboard

---

## Testing Emails Locally

### Method 1: Use Mailtrap (Recommended for Development)

1. Sign up at [https://mailtrap.io/](https://mailtrap.io/)
2. Create a test inbox
3. Copy SMTP credentials
4. Update `.env`:
```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```
5. All emails will be captured in Mailtrap inbox (not actually sent)

### Method 2: Use Ethereal Email (Temporary Accounts)

1. Visit [https://ethereal.email/create](https://ethereal.email/create)
2. Click "Create Ethereal Account"
3. Copy SMTP credentials
4. Update `.env` with provided credentials
5. Preview sent emails at [https://ethereal.email/](https://ethereal.email/)

---

## Disabling Email Notifications

If you want to disable email notifications temporarily:

1. In `.env`, set:
```
EMAIL_USER=
EMAIL_PASSWORD=
```

2. Or comment out email calls in service files:
```javascript
// await EmailService.sendWelcomeEmail(user);
```

The application will continue to work without email functionality.

---

## Production Considerations

### Security Best Practices

✅ **DO:**
- Use environment variables for sensitive data
- Store passwords in `.env` file (never commit to git)
- Use App Passwords instead of actual passwords
- Implement rate limiting on email sends
- Monitor email sending logs

❌ **DON'T:**
- Hardcode credentials in source code
- Use same password for multiple services
- Store passwords in version control
- Send emails to unverified addresses

### Recommended Production Setup

1. **Use SendGrid or AWS SES:**
   - More reliable for production
   - Better deliverability
   - Detailed analytics
   - DKIM/SPF authentication

2. **Implement Email Queuing:**
   - Use Bull/Redis for email queue
   - Retry failed emails automatically
   - Handle spike in email volume

3. **Add Email Logging:**
   - Track all sent emails
   - Monitor bounce rates
   - Identify email issues

4. **Setup Monitoring:**
   - Alert on email failures
   - Track delivery rates
   - Monitor provider quotas

---

## Testing Checklist

- [ ] Email credentials configured in `.env`
- [ ] Backend shows "Email service is properly configured"
- [ ] Register new user and check email
- [ ] Create a task and check email
- [ ] Complete a task and check email
- [ ] Test with spam filter (move received email out of spam)
- [ ] Verify email contains proper styling and links
- [ ] Test mobile email rendering

---

## Support

**Issues?**
1. Check email credentials are correct
2. Verify SMTP host/port are accessible
3. Check backend logs for error messages
4. Try test email providers like Mailtrap
5. Verify email address exists and can receive

**More Help:**
- Contact backend development team
- Check email provider documentation
- Review Nodemailer documentation: https://nodemailer.com/

---

**Happy emailing!** 📧✨
