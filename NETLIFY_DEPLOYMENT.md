# Deploy Tasker on Netlify with MongoDB Atlas

This repository is configured to serve the React frontend and Express API from one Netlify site. MongoDB Atlas remains the database.

## Netlify build settings

The root `netlify.toml` defines the build command, publish directory, Functions directory, and `/api/*` rewrite. In Netlify, leave **Base directory** and **Package directory** empty (repository root) so Netlify can find the root configuration and Functions folder. The publish directory is `tasker-frontend/build`.

## Required Netlify environment variables

Set these under Site configuration → Environment variables. Use the new MongoDB database-user password (the previously exposed password must not be reused). Never commit these values to GitHub.

- `MONGODB_URI` — MongoDB Atlas connection URI for the existing Tasker database.
- `JWT_SECRET` — a long, random secret used to sign login tokens.
- `JWT_EXPIRE` — token lifetime, for example `7d`.
- `NODE_ENV` — set to `production`.
- `CORS_ORIGIN` — the exact Netlify site origin, for example `https://your-site-name.netlify.app` (no trailing slash).
- `FRONTEND_URL` — the same Netlify site origin, used in reminder emails.

For email reminders, also configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`, and optionally `EMAIL_FROM`. For browser push reminders, configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`. Keep all secrets in Netlify environment variables.

The frontend now calls the same site's relative `/api` path by default; a separate `REACT_APP_API_URL` is not required.

## Reminder timing

Netlify Scheduled Functions run the reminder checker every five minutes. A reminder can therefore be delivered up to roughly five minutes late, plus function execution and email/push delivery time. Netlify scheduled functions run only for published deploys, not deploy previews. The scheduled function has a 30-second execution limit, so unusually large reminder backlogs may need additional batching.

## First deployment checks

1. Confirm the environment variables above are saved in Netlify.
2. Trigger a new production deploy so the updated build and Functions are published.
3. Open `https://your-site-name.netlify.app/api/health` and confirm it returns JSON with `success: true`.
4. Test registration and login from the site.
5. In Netlify → Functions, confirm both `api` and the scheduled `reminder-scheduler` are listed. Scheduled runs appear only after a published deploy.

Do not paste database URIs, passwords, JWT secrets, SMTP passwords, or VAPID private keys into chat or GitHub.
