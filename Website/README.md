# A Priest's Journey website

This is the React frontend, built with Vite. The frontend can be deployed to
Vercel while the API and its persistent SQLite database remain on Render.

## Deploy the frontend to Vercel

1. Import this repository into Vercel.
2. Set the project **Root Directory** to `Website`.
3. Use the Vite framework preset, build command `npm run build`, and output
   directory `dist`.
4. Add the `VITE_API_HOST` environment variable in the Vercel project settings.
   Set it to the Render API service hostname (for example,
   `my-website-api.onrender.com`) or its full `https://` URL. Add it for each
   Vercel environment you deploy (Production, Preview, or Development).
5. Deploy or redeploy the project after setting the environment variable.

The Vercel rewrite configuration serves the React app for client-side routes
such as `/reset-password`.

## Connect the Render API

Keep the API service and its persistent disk on Render. In the Render API
service's environment settings, set `APP_URL` to the deployed Vercel site's
URL (for example, `https://your-project.vercel.app`). This ensures password
reset links return to the Vercel site. Keep the existing `DB_PATH` disk
configuration and configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on Render
for password-reset email.

## Local development

Run `npm run dev` from this directory. The Vite development server proxies
`/api` requests to `http://127.0.0.1:5000`; run the API locally to use
registration and password-reset features.
