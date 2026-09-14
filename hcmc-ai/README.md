# hcmc.ai website

A local, production-oriented preview of the hcmc.ai multi-model video studio.

## Open it

Double-click `Start hcmc.ai.cmd`. Keep the terminal window open while using the site. The studio opens at `http://127.0.0.1:4173/`.

If Node.js is not installed, install the current Node.js LTS release first.

## Vercel compatibility preview

`Dockerfile.vercel` runs the existing Node server with `HOST=0.0.0.0` and the existing `PORT` default, while allowing the runtime `PORT` to override it. This is a minimal compatibility layer only; no deployment has been performed.

Read `VERCEL.md` before treating this as a production deployment. The current account file and login sessions are process-local and are not durable or shared across Vercel instances. A persistent account/session store is still required for real customer accounts.

## Recommended provider setup

Start with one private OpenRouter key. It gives the studio one current video-model catalog, one billing relationship, and a consistent generation surface. Keep the key only in the server environment—never paste it into browser code or local storage.

Copy `.env.example` to your private environment configuration and set:

- `HCMC_OPENROUTER_API_KEY` for generation
- `HCMC_GOOGLE_CLIENT_ID` and `HCMC_GOOGLE_CLIENT_SECRET` for real Google sign-in
- `HCMC_SESSION_SECRET` to a long random production secret
- `HCMC_PAYMENT_PROVIDER` after choosing and implementing the payment adapter
- `HCMC_ORIGIN` to the final HTTPS origin

The model catalog can be browsed without a generation key. If the live OpenRouter catalog is unavailable, the interface clearly labels its bundled 29-model snapshot as an offline catalog.

The landing ribbon is a 24-hour session preview while real promotion configuration is pending. It is not an active discount and does not start checkout.

## Before publishing

- Replace the in-memory session store and file-backed users with persistent shared storage.
- Connect token balances, provider jobs, payment webhooks, refunds and idempotency in the server.
- Add registered business details and complete legal review of privacy, terms, refunds and acceptable use.
- Run dependency, accessibility, performance, abuse and external security testing on the deployment environment.
- Keep HTTPS, secure cookies, origin validation, rate limits, payload limits, provider spending caps, webhook signatures and audit logs enabled.

The current verification covers JavaScript syntax, six pricing tests, twelve isolated API checks and successful browser onboarding. The full viewport matrix is still in progress.
