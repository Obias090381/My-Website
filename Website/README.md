# A Priest's Journey website

The Vite/React website is a static frontend. Sign-up, sign-in, password reset,
and database access have been removed. Existing data in Neon and the preserved
SQLite database is not changed or deleted.

The entry screen currently provides sign-up, sign-in, and password-reset
interface prototypes only. These actions do not save account information or
send reset emails until a secure authentication backend and email delivery
service are configured.

## Deploy to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to
   `Website`.
2. Use the Vite framework preset, build command `npm run build`, and output
   directory `dist`.
3. Deploy the project. Vercel serves the static frontend and rewrites client-side
   routes to `index.html`.

## Local development

Run the Vite development server from this directory:

```powershell
npm run dev
```
