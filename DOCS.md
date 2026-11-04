# fertinaija
Last updated: 2026-11-04

## Purpose

Mobile-first independent fertility-opportunity information and visit coordination for Nigerians.

## Key Functions

- Static educational pages for surrogacy, egg donation and sperm donation.
- Browser-local guided assistant and Nigeria state check.
- Opportunity-expert handoff to the public FertiNaija Telegram channel.
- Full public directory with simple location buttons and guide-synchronised state filtering, plus a link to the broader AFRH registry.
- Reward-aware copy that explains possible private-programme compensation or reimbursement without promising payment.
- Arrival check-in journey for users who reach a facility independently.
- Privacy and terms pages that preserve the non-medical, non-affiliated boundary.
- Consent banner, first-party privacy-choice cookie, optional location preference, Global Privacy Control handling, and California privacy disclosures.

## Key Files

| File | Role |
|------|------|
| `server.js` | Dependency-free static server and `/healthz` endpoint. |
| `public/index.html` | Public mobile-first product experience. |
| `public/app.js` | Guided assistant, state check, analytics and support handoff. |
| `public/styles.css` | Responsive visual system. |
| `quikdb.json` | Versioned QuikDB production runtime and health-check settings. |
| `test/server.test.js` | Health, boundary-copy and security-header tests. |

## Recent Changes

| Date | Change | Branch/PR |
|------|--------|-----------|
| 2026-11-04 | Removed the shared QuikDB HubSpot widget, routed expert actions to `t.me/fertinaija`, replaced the search toolbar with full-list location buttons, corrected option-card overlap, and added privacy/terms plus consent controls. | `codex/fertinaija-directory-rewards` |
| 2026-11-04 | Expanded the single-clinic page into a multi-state public directory, connected state selection to listing filters, added published reward evidence and made opportunity-expert conversation the main action. | `codex/fertinaija-directory-rewards` |
| 2026-11-04 | Deployed the validated application to QuikDB production at `https://fertinaija.quikdb.net`; enabled auto-deploy from the deployment mirror's `main` branch. | `main` / deployment `deploy-ed2ce8ca-c8c7-4138-af67-22e893819889` |
| 2026-11-04 | Corrected guide routing for location and map actions; aligned privacy-request wording with the configured support channel. | `codex/fertinaija-launch` |
| 2026-11-04 | Initial production implementation. | `codex/fertinaija-launch` |

## Production

- Public URL: `https://fertinaija.quikdb.net`
- Health check: `https://fertinaija.quikdb.net/healthz`
- QuikDB deployment: `deploy-ed2ce8ca-c8c7-4138-af67-22e893819889`
- Deployed application commit: `9f023b55c85e9336aae182363653171a3f0fb34e`
- Production validation runs: canonical `41860008865`; deployment mirror `41860010022`
- Canonical engineering repository: `https://github.com/quikdb/fertinaija` (private)
- Deployment-only mirror: `https://github.com/samsonajulor/fertinaija-deploy` (public; contains no credentials)

## Known Issues

- The automated in-page guide is live. Expert handoff currently opens the public `t.me/fertinaija` Telegram channel; there is no embedded human live-chat provider.
- The brand has not completed formal trademark clearance.
- The selected directory is not exhaustive; users are linked to the broader AFRH public registry for other states and facilities.

## Environment Variables

- `PORT` — HTTP port supplied by QuikDB Compute.
