# hcmc.ai website

A local, production-oriented preview of the hcmc.ai multi-model video studio.

## Open it

Double-click `Start hcmc.ai.cmd`. Keep the terminal window open while using the site. The studio opens at `http://127.0.0.1:4173/`.

If Node.js is not installed, install the current Node.js LTS release first.

## Recommended provider setup

Start with one private OpenRouter key. It gives the studio one current video-model catalog, one billing relationship, and a consistent generation surface. Keep the key only in the server environment—never paste it into browser code or local storage. Add direct provider accounts later only when volume discounts, a provider-exclusive feature, or support requirements justify the extra integrations.

Copy `.env.example` to your private environment configuration and set:

- `HCMC_OPENROUTER_API_KEY` for generation
- `HCMC_GOOGLE_CLIENT_ID` and `HCMC_GOOGLE_CLIENT_SECRET` for real Google sign-in
- `HCMC_SESSION_SECRET` to a long random production secret
- `HCMC_PAYMENT_PROVIDER` after choosing and implementing the payment adapter
- `HCMC_ORIGIN` to the final HTTPS origin

The model catalog can be browsed without a generation key. If the live OpenRouter catalog is unavailable, the interface clearly labels its bundled fallback as an offline catalog.

## Before publishing

- Replace the in-memory session store with a persistent database-backed session store.
- Connect token balances, payment webhooks, refunds, and idempotency in the server.
- Add the registered business details and complete local legal review of privacy, terms, refunds, and acceptable-use rules.
- Run dependency, accessibility, performance, abuse, and external security testing on the deployment environment.
- Keep HTTPS, secure cookies, origin validation, rate limits, payload limits, provider spending caps, webhook signatures, and audit logs enabled.

Nothing in this preview publishes the site or exposes a credential.
