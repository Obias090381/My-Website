# A Priest's Journey website

The Vite/React frontend uses server-side API handlers for account registration
and sign-in. Neon credentials are accessed only by the backend; they are never
exposed to browser code. Passwords are stored as scrypt hashes, and sessions
use HTTP-only cookies.

## Deploy to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to
   `Website`.
2. Use the Vite framework preset, build command `npm run build`, and output
   directory `dist`.
3. Connect the Neon database to the Vercel project. The backend reads
   `STORAGE_POSTGRES_URL` (or `STORAGE_DATABASE_URL`) supplied by the Neon
   integration, with `DATABASE_URL` supported as a fallback. Confirm the
   integration variables are available in Production and any Preview
   environments that need account access.
4. Deploy the project. Vercel serves the `/api/*` functions alongside the
   frontend and rewrites client-side routes to `index.html`.

## Local development

For local development, set `DATABASE_URL` in `backend/.env` using the
connection string from the Neon Console. Keep that file private; it is ignored
by Git. A blank template is available at `backend/.env.example`. The backend
also accepts the Vercel Neon integration variables `STORAGE_POSTGRES_URL` and
`STORAGE_DATABASE_URL`. Then run the Vite development server from this
directory; it loads the backend environment file and routes local API requests
to the same handlers used in deployment:

```powershell
npm run dev
```

The API initializes the `users` and `user_sessions` tables when it first
connects. To check the connection, open `/api/db-test`. Registration and
sign-in will report an error if `DATABASE_URL` is not configured or the
database cannot be reached.
