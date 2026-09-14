# Vercel container setup

Use this folder as the Vercel project root. Vercel detects `Dockerfile.vercel` and routes requests to the existing Node server. No frontend build or framework conversion is needed.

The image listens on `0.0.0.0` and defaults to port 80. A runtime `PORT` overrides that default. Local startup still defaults to `127.0.0.1:4173`.

Set `HCMC_ORIGIN` to the exact public HTTPS origin, and supply a stable private `HCMC_SESSION_SECRET`. For Google login, supply the existing Google environment variables and register `<HCMC_ORIGIN>/auth/google/callback` with Google. Keep secrets in Vercel environment settings, never in the image.

## State compatibility audit

- Login sessions and request rate limits are process-local Maps. Sessions can disappear on restarts and do not follow users between instances. Rate limits are per instance.
- Registered accounts are written to `.hcmc-data/users.json`. Container files are not durable shared storage. Accounts can disappear or differ between instances.
- The model cache is disposable and can safely rebuild from the provider or bundled snapshot.
- Drafts, projects, preferences and uploaded local assets use browser storage and remain device-specific.

The Dockerfile intentionally excludes local account files and secrets. It makes the server available as a container; it does not solve account persistence. A shared account/session store must be connected before real customer accounts are supported on Vercel. No storage migration or login-flow rewrite is included in this minimal compatibility change.

## Verification

No deployment was performed. Docker is unavailable on the editing machine, so the image build cannot be verified here. The server can be smoke-tested locally with `HOST=0.0.0.0` and an alternate `PORT`; existing API regression checks remain applicable.

Reference: https://vercel.com/kb/guide/does-vercel-support-docker-deployments
