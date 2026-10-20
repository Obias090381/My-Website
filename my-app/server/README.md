# Backend setup

The backend uses SQLite for accounts and password-reset tokens. Password-reset
emails are sent through Resend.

## Run locally

1. Create a Resend account and API key, and verify the sender address or domain
   you plan to use.
2. In the PowerShell terminal that will run the backend, set these variables.
   Enter the API key when prompted so it is not included directly in the command:

   ```powershell
   $secret = Read-Host "Resend API key" -AsSecureString
   $env:RESEND_API_KEY = [System.Net.NetworkCredential]::new("", $secret).Password
   $env:RESEND_FROM_EMAIL = "Your Site <no-reply@your-verified-domain.com>"
   $env:APP_URL = "http://localhost:5173"
   ```

   For a deployed website, set `APP_URL` to its public origin instead.
3. Start the backend from this directory:

   ```powershell
   node server.js
   ```

The environment variables apply only to that PowerShell session. Set them again
after opening a new terminal. The website's **Reset Password** page emails a
one-hour, single-use link; the database stores only a hash of its token and a
hash of the new password.

During local development, the Vite dev server proxies `/api` requests to the
backend on port 5000. Restart Vite after changing its configuration. The Render
Blueprint injects the backend hostname into the website as `VITE_API_HOST`; the
frontend adds HTTPS when building API requests. Never put the Resend API key in
a `VITE_` variable.

## Deploy the website and backend to Render

The repository's root `render.yaml` defines both the Express API and the static
React website. The website builds from `Website/package.json`, which includes
React and React DOM; the API installs only `my-app/server/package.json`.
The backend mounts a persistent disk at `/var/data` for SQLite. Persistent
disks require a paid Render web-service plan. SQLite here is for one running
service instance; don't scale the API to multiple instances.

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint**, connect this GitHub repository, and
   deploy the `render.yaml` Blueprint. Render prompts for `RESEND_API_KEY` and
   `RESEND_FROM_EMAIL`; enter your Resend API key and verified sender. It also
   prompts for `APP_URL`; enter the website URL, for example
   `https://my-website-site.onrender.com`. Confirm the actual static-site URL in
   the Render dashboard after creation, then update `APP_URL` in the API
   service's Environment settings if Render assigned a different URL.
3. Render creates the `my-website-api` and `my-website-site` services. The
   Blueprint connects the website build to the API hostname. Check both
   services' **Events** and **Logs** until deployment succeeds.
4. Open the API's URL from the Render dashboard. Its root should return JSON
   saying the server is running. Open the static site's URL and test a direct
   refresh at `/reset-password`.
5. Request a reset using a registered email. Confirm Resend accepts the
   verified sender and the email link opens the new Render static site.

Render's disk persists across deploys, but a new service starts with a new,
empty database. Back up your local `database.sqlite` before migrating existing
users. Copy it to `/var/data/database.sqlite` using a secure one-time transfer
before accepting registrations on the hosted service; don't include the
database in routine application deployments.
