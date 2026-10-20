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
backend on port 5000. Restart Vite after changing its configuration. To use a
deployed backend, configure `VITE_API_URL` in the website's build environment
with the backend's public origin. This URL is public configuration; never put
the Resend API key in a `VITE_` variable.

## Deploy the backend to Render

The repository's root `render.yaml` defines the Express web service and mounts a
persistent disk at `/var/data` for SQLite. Persistent disks require a paid Render
web-service plan. SQLite here is for one running service instance; don't scale
the service to multiple instances.

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint**, connect this GitHub repository, and
   deploy the `render.yaml` Blueprint. Render prompts for `RESEND_API_KEY` and
   `RESEND_FROM_EMAIL`; enter your Resend API key and verified sender.
3. After the service is created, copy its public URL from the Render dashboard,
   such as `https://my-website-api.onrender.com`. Open its root URL in a browser;
   it should return JSON saying the server is running.
4. In GitHub, open **Settings > Secrets and variables > Actions > Variables**
   and set `VITE_API_URL` to the Render service URL, with no trailing slash.
   The Static Web Apps workflow passes this variable into the website build.
5. In GitHub **Actions**, rerun the Azure Static Web Apps workflow (or push a
   new commit) so the published website rebuilds with the Render URL.

The `APP_URL` Blueprint setting points reset emails to the published website.
Update it if the website's public URL changes.

Render's disk persists across deploys, but a new Render service starts with a
new, empty database. Back up your local `database.sqlite` before migrating
existing users. Copy that database to `/var/data/database.sqlite` using a
secure one-time transfer before accepting registrations on the hosted service;
don't include the database in routine application deployments.
