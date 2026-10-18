# Frontend: environment, build and deployment

## Environment variables (build-time)

Vite inlines `VITE_*` variables into the JavaScript bundle **at build time**. Anything set here is public, so never set a service-role key or a Razorpay key *secret*.

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase project URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon (public) key |
| `VITE_RAZORPAY_KEY_ID` | for payments | Razorpay key **id** (public) |
| `VITE_ADMIN_EMAILS` | optional | Comma-separated admin emails. This is a UX gate only. If unset, a legacy built-in list is used |

Copy `.env.example` to `.env` for local development. If a required variable is missing, the app shows a "Site configuration error" screen that names the missing variable.

**Admin access:** `/admin/*` requires sign-in. A user is admin if `app_metadata.role = "admin"` (set server-side; recommended) or their email is in the allow-list. Real enforcement must be done by Supabase RLS, which (once `backend-admin-rls-lockdown` is applied) checks only `app_metadata.role` via `public.is_admin()`. Grant the role to every admin before that, or allow-listed users will see the console but fail to save.

**Edge-function CORS:** if `ALLOWED_ORIGINS` is set on the functions (see `docs/backend-operations.md`), it must list every origin this build is served from, or checkout and POS calls fail in the browser.

**Supabase Auth redirect URLs:** OAuth and password-reset links return to `<current origin>/auth/callback`. Add each origin you deploy to (production, previews, `http://localhost:5173`, `http://localhost:8080`) to the Supabase Auth Redirect URLs allow-list.

## Local commands

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # Vitest unit/integration tests (no network; Supabase is mocked)
npm run lint       # ESLint (pre-existing issues remain; see the audit)
npm run build      # production build to dist/
npm audit --omit=dev
```

## Docker

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://<ref>.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=<anon-key> \
  --build-arg VITE_RAZORPAY_KEY_ID=<rzp-key-id> \
  -t kustomkoats-web:local .
docker run --rm -p 8080:8080 kustomkoats-web:local
curl -fsS http://localhost:8080/healthz
```

- Multi-stage: `node:22-alpine` runs `npm ci && npm run build`, then the result is copied into `nginxinc/nginx-unprivileged:1.27-alpine`, which runs as uid 101.
- Listens on **8080**. The `HEALTHCHECK` probes `GET /healthz`. `docker stop` sends SIGQUIT, so nginx shuts down gracefully.
- SPA fallback serves `index.html` (`Cache-Control: no-cache`). `/assets/*` gets an immutable 1-year cache, and missing assets return 404.
- Security headers are in `nginx/security-headers.conf`, and `vercel.json` mirrors them. CSP is **Report-Only** until enforcement is approved.
- Because env is build-time, build one image per environment. Terminate TLS at your load balancer or proxy.

## Vercel

`vercel.json` installs with `npm ci`, rewrites all paths to `index.html`, and sets the same security and cache headers as nginx. Configure the `VITE_*` variables in the Vercel project settings.
