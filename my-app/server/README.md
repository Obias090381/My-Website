# Backend setup

The backend uses SQLite for accounts and password-reset tokens. Password-reset
emails are sent through Resend.

## Configure Resend on Windows

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

The website defaults to `http://localhost:5000` for its backend. To use a
deployed backend, configure `VITE_API_URL` in the website's build environment
with the backend's public origin. This URL is public configuration; never put
the Resend API key in a `VITE_` variable.
