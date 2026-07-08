# leo-web

Next.js web client for Leo Connexio — admin, onboarding, and public auth.

## Dev setup

1. Start **leo-api** on port 3000 (`make dev` in `leo-api`).
2. Start Mailpit if testing email: `docker compose up -d mailpit` in `leo-api`.
3. Run this app:

```bash
npm install
npm run dev
```

Opens at **http://localhost:8080** (matches `APP_PUBLIC_URL` in leo-api).

API requests are proxied via Next.js rewrites (`/api/v1/*` → `http://localhost:3000/api/v1/*`).

## P1 auth routes

| Route | Purpose |
|-------|---------|
| `/signup` | Unified signup (`POST /auth/signup`) |
| `/signup/success` | Post-signup “check your email” |
| `/verify-email?token=` | Magic-link verification |
| `/login` | Sign in (+ MFA challenge/enroll for privileged roles) |
| `/forgot-password` | Request password reset email |
| `/reset-password?token=` | Set new password |

## Environment

Optional `.env.local`:

```env
API_URL=http://localhost:3000
```

## Related

- Backend: [`../leo-api`](../leo-api)
- **Architecture (this repo):** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- UI screen map: [`../leo-api/docs/architecture-reference.md`](../leo-api/docs/architecture-reference.md)
# leo-web
