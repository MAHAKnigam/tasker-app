# Task reminders setup

Task reminders support email and browser/device push. Reminder scheduling is stored in MongoDB and checked by the backend worker every 30 seconds.

## Email delivery

Configure these backend environment variables:

- `EMAIL_HOST` (default: `smtp.gmail.com`)
- `EMAIL_PORT` (default: `587`)
- `EMAIL_SECURE` (default: `false`; use `true` for implicit TLS)
- `EMAIL_USER`
- `EMAIL_PASSWORD` (for Gmail, use an app password)
- `EMAIL_FROM` (optional; defaults to `EMAIL_USER`)
- `FRONTEND_URL` (used for the calendar link in reminder emails)

For Docker Compose, set them in the environment used to run `docker compose`.

## Browser/device push

Push requires HTTPS in production (localhost is allowed for local development) and a browser that supports the Push API.

Generate a VAPID key pair once, on a trusted development machine:

```bash
cd tasker
npx web-push generate-vapid-keys
```

Set the generated values as backend environment variables:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (for example, `mailto:you@example.com`)

Keep `VAPID_PRIVATE_KEY` secret. Never commit it to GitHub or expose it in frontend build variables.

After deploying with these values, sign in to Tasker and select **Enable notifications**. Approve the browser permission prompt. Each browser/device must subscribe separately.

## Reminder behaviour

- Tasks with a due date default to a reminder 30 minutes before their due time.
- Users can choose 5 minutes, 15 minutes, 30 minutes, 1 hour, 1 day, or no reminder.
- Due date and due time are interpreted in the user's browser local timezone and stored as an ISO timestamp.
- Recurring task occurrences inherit the reminder setting.
- Completed and cancelled tasks are not reminded.
- Email and push delivery progress are tracked separately so a failure in one channel does not repeatedly resend a successful channel.
- Browser push can appear while the app is closed, provided the browser/device permits background notifications and the subscription remains valid.

## Deployment note

After changing environment variables, restart/redeploy the backend. For Docker Compose, rebuild/restart as needed:

```bash
docker compose up -d --build
```

A reminder is not delivered until the backend is running, MongoDB is connected, SMTP is configured, and (for device push) VAPID keys are configured and the user has enabled notifications in that browser.
