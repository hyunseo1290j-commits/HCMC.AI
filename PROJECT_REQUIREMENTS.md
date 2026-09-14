# hcmc.ai product requirements ledger

This file tracks the full product specification and follow-up requests so future work is not reduced to the most recent message.

## Working now

- Cinematic public landing page, responsive public navigation, CTA flows, showcases, model section, workflow explanation, use cases, pricing teaser, FAQ and footer.
- Subtle 180 ms page-tab entrances and 150 ms settings/reference-panel entrances, quick tab color feedback, no delayed corner flourish, reduced-motion support and persistent dark/light/system themes. Repeated active-tab clicks preserve scroll and avoid duplicate history entries; the branded startup animation remains.
- Create studio with live model selection, text/image modes, local reference images, prompt inspiration, autosave, styled validation and quote explanation.
- Model-driven 480p, 720p and 1080p controls; supported aspect ratios including 1:1; truthful provider duration choices; working −/+ controls that move by one second when supported or to the next real provider preset.
- One to five output variations with server-validated cost multiplication.
- Live OpenRouter video-model catalog with a clearly labeled offline fallback.
- Search, capability filters, favorites, model details, provider marks, factual reported-signal panels, per-second pricing/duration tags, comparison and provider-owned example links.
- Twelve distinct original template images with prompt, model, aspect, quality and duration presets.
- Storyboard scene/image/audio/transition nodes, image placement, dragging, live-following edges, connect/disconnect, timing, duplication, deletion, Undo/Redo, zoom, fit, connection-graph playback, minimap, generate-all, background queue and Clear all.
- Changeable concept frame plus one-click restoration of the original frame.
- Projects can be created with styled validation, searched, sorted and reopened as active workspaces.
- Local asset library with type/size validation, IndexedDB persistence, search, type filters, sorting, favorites, reuse and Clear library.
- Brand Kit explanation, saved name/direction/color and one-click prompt application.
- Local history, draft restoration, background queue, monthly usage forecasting, plan recommendation and pricing economics.
- Plans including a custom/team tier, monthly/yearly pricing, token packs and protected checkout states.
- Connections dashboard, runtime health, deployment-variable guidance and offline-catalog explanation.
- Searchable Settings for appearance, generation, notifications, privacy, security, accessibility and shortcuts.
- Notification center with unread count, individual mark-read/delete, Clear all, and correct handoff into notification settings.
- Docs, pricing guidance, privacy/security explanations, cookie choices and policy launch checklist.
- Email registration/login/logout with server-side password hashing and signed HttpOnly session cookies.
- Google OAuth authorization-code flow with PKCE, ready for private credentials.
- Server-side model/quote validation, origin checks, request size limits, allowlisted static files, rate limiting and defensive browser headers.
- Local data export, offline awareness, responsive layouts, accessible labels, focus states, dialogs, protected text selection behavior and scroll-edge navigation cues.

## Requires private credentials or business decisions

- Real Google sign-in requires `HCMC_GOOGLE_CLIENT_ID` and `HCMC_GOOGLE_CLIENT_SECRET`.
- Real generation requires `HCMC_OPENROUTER_API_KEY`, a persistent token ledger and a completed asynchronous provider job adapter.
- Checkout requires a selected payment provider, private credentials, signed webhooks, idempotency and refund rules.
- Production accounts require a persistent database, email delivery/verification, durable sessions and password-reset email delivery.
- Final privacy policy, terms, refund policy, acceptable-use rules, business identity, tax treatment and jurisdiction require the real company details and legal review.
- Production launch requires HTTPS hosting, durable object storage, backups, monitoring, logging, abuse controls and an external security review.

## Remaining product expansion from the full specification

1. Expand project management: rename, duplicate, archive, favorite, delete, thumbnails and last-edited metadata.
2. Expand Brand Kit to multiple brands, logo files, fonts, tagline, voice, CTA, web/social details, references, watermark, intro and outro.
3. Expand generation records with truthful provider status polling, retry/cancel/refund behavior, thumbnails, outputs, metadata, downloads, remix and project assignment.
4. Add richer asset actions: rename, preview, delete with Undo, project assignment and direct drag into storyboard.
5. Add more model filters only where reliable source fields exist and complete licensed local provider logo coverage beyond the four current brand assets.
6. Add additional unique templates and categories without reusing artwork.
7. Add a dedicated quick-create/dashboard experience if it improves the direct-to-Create workflow rather than duplicating it.
8. Add more advanced storyboard behavior: selection, multi-select, keyboard deletion, explicit pan mode, alignment guides and output/generation nodes.
9. Add deeper account areas for connected accounts, devices/sessions, billing history, invoices and account deletion once persistent accounts exist.
10. Complete a repeatable viewport matrix at 320, 375, 430, 768, 1024, 1280 and 1440 pixels after the remaining product surfaces stabilize.

## Product rules that remain binding

- Do not publish without explicit approval.
- Do not expose provider, OAuth or payment secrets in the browser.
- Do not show unsupported settings or invent model capabilities.
- Do not fake successful generations, exact progress, scarcity timers or discounts.
- Do not repeat template artwork.
- Keep dark and light themes intentionally designed and equally readable.
- Prefer useful depth over empty pages or decorative feature count.

## Latest focused verification — 2026-09-14

- Tab-motion polish: browser-checked all 13 sidebar destinations, generation-mode selection, settings panel changes, dark/light rendering, active-tab repeat clicks and browser Back. Each destination showed one active view with the intended 180 ms animation; settings used 150 ms. No browser console errors during these checks. JavaScript syntax checks passed. Reduced-motion CSS explicitly disables the new effects; OS preference emulation was not exercised.

