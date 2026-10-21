# SQLite to Neon migration

This folder preserves the existing SQLite database as the source for importing
accounts into the Vercel-hosted Neon database. It is not used by the deployed
application.

The migration copies user IDs, names, email addresses, and existing password
hashes. It does not copy password-reset tokens. Keep the SQLite file private;
it contains account data and password hashes.

## Run the migration

1. Provision Neon through the Vercel Marketplace and set `DATABASE_URL` in the
   terminal to the Neon connection string for the target database.
2. If migrating a database downloaded from a previous live service, set
   `SQLITE_PATH` to that file. Otherwise, the script reads the local
   `database.sqlite` in this folder.
3. From this directory, run:

   ```powershell
   npm ci
   npm run migrate
   ```

Run the migration before enabling registration on the Vercel deployment. The
script does not overwrite existing records; it skips accounts already present
by ID or email and reports the counts.
