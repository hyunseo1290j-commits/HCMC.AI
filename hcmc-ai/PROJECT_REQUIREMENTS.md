# hcmc.ai product requirements ledger

This ledger records the current objective, verified product state, and work that still needs real implementation.

## Current objective, in order

1. Keep the smallest useful Vercel compatibility layer first. `Dockerfile.vercel` runs the existing Node server, binds to `0.0.0.0`, preserves the existing `PORT` default while allowing the runtime `PORT` override, and does not deploy anything. `VERCEL.md` documents the important limitation: process-local sessions and the file-backed account store are not durable or shared across Vercel instances, so persistent accounts and sessions still require a shared store.
2. Keep the landing offer ribbon as a clearly labeled 24-hour session preview while real promotion configuration is pending. It must not imply an active discount or checkout.
3. Keep interactions subtle and finite. Create and Models retain their original motion signatures; route entrances use a finite 380 ms transition and the accent signal uses a finite 500 ms entrance. Preserve the intro visual and its compositing/offscreen animation pause behavior, including reduced-motion handling.
4. Keep production readiness honest. The preview may show the path to launch, but generation, Google sign-in, durable accounts/sessions, email delivery, payments, legal approval, durable storage, monitoring, abuse controls, and external security review remain blockers where their private credentials, business decisions, or infrastructure are missing.
5. Finish onboarding with four answers. The preparation step is skippable and waits 1.6 seconds when motion is allowed; completion applies the selected template's actual prompt and image to Create. A blank studio remains available.

## Verified current product state

- Landing page, responsive navigation, CTA flows, showcases, model section, workflow explanation, use cases, pricing teaser, FAQ and footer.
- Fifteen sidebar destinations, including Create, Models, Projects, Templates, Assets, Storyboard, Brand kit, History, Usage, Pricing, Billing, Policies, Connections, Docs, Settings and Account routes.
- 29-model official snapshot, including `bytedance/seedance-2.0-mini`, with live OpenRouter catalog loading and a clearly labeled offline fallback.
- `pricing.mjs` provider arithmetic and server quote validation, with the six pricing tests passing.
- Create studio with text/image modes, model-driven controls, local reference images, prompt inspiration, autosave, validation, quote explanation and one-to-five output variations.
- Projects with create, search, sort, reopen, rename, favorite, duplicate, delete and Undo restore.
- Local asset library with validation, IndexedDB persistence, search, type filters, sorting, favorites, reuse, Clear library and media preview.
- Enhanced Brand Kit with saved name, direction, tagline, voice, CTA, avoid guidance, accent color, reusable brief and one-click prompt application.
- Storyboard with scene/image/audio/transition nodes, placement, dragging, edges, timing, duplication, deletion, single-path cycle protection, Undo/Redo, zoom, fit, connection-graph playback, minimap, generate-all, background queue and Clear all.
- Original concept frame restoration, local history and draft restoration, background queue, usage forecasting, plan recommendation and pricing economics.
- Plans with custom/team tier, monthly/yearly preview, token packs and protected checkout states. Billing is a mock preview and collects no card details.
- Password auth with server-side hashing and an eight-character minimum. Google OAuth is wired for private credentials, but inline Google sign-in is unavailable until those credentials are supplied.
- Policies page, Connections health/readiness view, local data export, offline awareness, accessible labels, focus states, dialogs, protected text selection and scroll-edge navigation cues.

## Requires private credentials, infrastructure or business decisions

- Real Google sign-in requires `HCMC_GOOGLE_CLIENT_ID` and `HCMC_GOOGLE_CLIENT_SECRET`.
- Real generation requires `HCMC_OPENROUTER_API_KEY`, durable token accounting and an asynchronous provider job adapter.
- Production accounts require a persistent database, durable shared sessions, email delivery/verification and password-reset delivery.
- Checkout requires a selected payment provider, private credentials, signed webhooks, idempotency, refunds and billing history.
- Final privacy, terms, refund and acceptable-use policies require real company details, tax treatment, jurisdiction and legal review.
- Production launch requires HTTPS hosting, durable object storage, backups, monitoring, logging, abuse controls, spending limits and external security review.

## Remaining product expansion

1. Add project archive, thumbnails and durable last-edited metadata once persistent project storage exists.
2. Extend Brand Kit to multiple brands, logo files, fonts, watermark, intro/outro, web/social details and references.
3. Add truthful generation status polling, retry/cancel/refund behavior, outputs, metadata, downloads, remix and project assignment after a provider job adapter exists.
4. Add asset rename, delete with Undo, project assignment and direct drag into storyboard.
5. Add reliable model filters only when source fields support them and complete licensed local provider logo coverage beyond the current brand assets.
6. Add additional unique templates and categories without reusing artwork.
7. Add a dedicated quick-create/dashboard experience only if it improves the direct-to-Create workflow.
8. Add advanced storyboard selection, multi-select, keyboard deletion, explicit pan mode, alignment guides and output/generation nodes.
9. Add connected-account management, devices/sessions, billing history, invoices and account deletion after persistent accounts exist.
10. Complete the viewport matrix at 320, 375, 430, 768, 1024, 1280 and 1440 pixels after the remaining surfaces stabilize.

## Product rules that remain binding

- Do not publish or deploy without explicit approval.
- Do not expose provider, OAuth or payment secrets in browser code or local storage.
- Do not show unsupported settings or invent model capabilities.
- Do not fake successful generations, exact progress, scarcity timers or active discounts.
- Do not repeat template artwork.
- Keep dark and light themes intentionally designed and equally readable.
- Prefer useful depth over empty pages or decorative feature count.

## Verification — 2026-09-15

- JavaScript syntax checks pass.
- Six pricing tests pass, including the 29-model snapshot, Seedance Mini arithmetic, audio pricing precedence, image-input pricing and unsupported-rate protection.
- Twelve isolated API checks pass.
- Browser onboarding succeeds: all four answers can be selected, preparation can be skipped, and the selected prompt and image are applied in Create.
- All 15 sidebar destinations passed a 105-case responsive layout check at 320, 375, 430, 768, 1024, 1280 and 1440 pixels with no horizontal page overflow. Dark and light landing compositions were visually inspected. Browser console reported no errors in the final checks. Reduced-motion rules are present; OS preference emulation and real-device frame-rate benchmarking were not performed.
