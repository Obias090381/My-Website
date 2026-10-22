# A Priest's Journey website

The Vite/React frontend and API run in one Vercel project. User accounts and
password-reset tokens are stored in Neon Postgres; the API does not rely on
local function disk storage.

## Deploy to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to
   `Website`.
2. Use the Vite framework preset, build command `npm run build`, and output
   directory `dist`.
3. Create or select your database in the Neon Console and copy its connection
   string (use the pooled connection string for the serverless app). In Vercel
   Project Settings, add that Neon connection string as `DATABASE_URL` in
   Production and any Preview environments that need database access. This
   uses a Neon database managed directly in Neon; it does not require installing
   the Vercel Marketplace integration.
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in the Vercel project settings
   to enable password-reset email. Never use a `VITE_` prefix for secrets.
5. Deploy the project. Vercel serves the `/api/*` functions alongside the
   frontend; the Vercel rewrite serves client-side routes such as `/account`.

If the Vercel build logs show `npm warn Unknown env config "cache-dir"`, remove
`cache-dir` or `NPM_CONFIG_CACHE_DIR` from the project's Environment Variables
and redeploy. If you need to override npm's cache location, use the supported
`NPM_CONFIG_CACHE` setting instead.

The API creates its database tables on the first request. The health endpoint
is `/api/db-test`. If a deployment returns HTTP 405 for an API request, check
the Vercel deployment's Functions list and runtime logs.

The `/account` page supports account registration, sign-in, and sign-out.
Sign-in sessions are stored in Neon and use an HTTP-only cookie that expires
after 30 days. Password resets revoke the account's existing sessions.
Backend handlers and shared database/authentication code are organized in
`backend/`. The small files under `api/` re-export those handlers so Vercel
continues to detect them as serverless functions.

## Import existing SQLite accounts

The SQLite database is preserved at `my-app/server/database.sqlite` as a
migration source. Follow [the migration instructions](../my-app/server/README.md)
before accepting registrations in the new database. The migration copies
account IDs, names, email addresses, and password hashes; it intentionally
does not copy password-reset tokens. To import a downloaded backup from a
previous live service, set `SQLITE_PATH` to that database file.

## Local development

Run the Vite development server from this directory. It serves the frontend
and the project's `/api/*` handlers locally:

```powershell
npm run dev
```

For local development, configure `DATABASE_URL` with the connection string
copied from Neon in `backend/.env` or the project-root `.env.local`. For
deployment, set the same Neon connection string as `DATABASE_URL` in Vercel's
Environment Variables so the hosted API can connect to Neon. Vercel stores and
provides the setting to the running function; it does not supply or manage the
database. Email requests also require `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
`APP_URL` can be set to the local site URL for local password-reset links;
otherwise, Vercel's deployment URL is used.

Copy `.env.example` to `.env.local` and fill in the values for local development.
Keep `.env.local` private; never commit database URLs or API keys.
