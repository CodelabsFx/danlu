Configuration and secrets

1. Copy `server/.env` from `.env.example` or edit `server/.env` with real values.
2. Required vars:
   - `DATABASE_URL` — Postgres connection string.
   - `JWT_SECRET` — secret used to sign JWTs.
   - `PORT` — server port (default 3000).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP credentials for Nodemailer.
   - `OWNER_EMAILS` — comma-separated owner emails for automated reports.

Security:
- Never commit `server/.env` with real secrets to source control. Use secret managers in production (AWS Secrets Manager, GitHub Actions secrets, etc.).
- For local development, use `.env` and add it to `.gitignore`.
