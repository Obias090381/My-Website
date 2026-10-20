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

## Deploy to Azure App Service

The Static Web App hosts the website only. Deploy this Express API separately
to a Linux Azure App Service using Node.js 22.

1. Create a Linux Web App in Azure with the Node.js 22 LTS runtime. Configure
   its startup command as `npm start` if Azure does not detect the package
   start script automatically.
2. In the Web App's **Configuration > Application settings**, add:
   - `DB_PATH` = `/home/data/database.sqlite`
   - `APP_URL` = `https://lemon-bay-09c679110.6.azurestaticapps.net`
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = your verified Resend sender
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true`
3. In GitHub, open **Settings > Secrets and variables > Actions** and add:
   - Actions variable `AZURE_WEBAPP_NAME` = the Web App name
   - Actions secret `AZURE_WEBAPP_PUBLISH_PROFILE` = the Web App's publish
     profile XML (download it from the Web App's overview)
   - Actions variable `VITE_API_URL` = `https://<your-web-app-name>.azurewebsites.net`
4. Push the changes to `main`. The backend workflow deploys the Express server;
   the Static Web Apps workflow rebuilds the frontend with the configured API
   URL. Check both workflows in GitHub **Actions**. Test the deployed API by
   opening `https://<your-web-app-name>.azurewebsites.net/`; it should return
   a JSON server-running message.

The deployment package intentionally excludes `database.sqlite` so deploying
code cannot overwrite hosted user data. App Service starts with a new SQLite
database unless you copy your existing local database to `/home/data/database.sqlite`
once before relying on the hosted app. The server creates `/home/data` if it
doesn't exist. Keep a backup before transferring data.
SQLite on App Service is suitable for a small, single-instance app; don't scale
the Web App to multiple instances because each instance would not safely share
the same SQLite database.
