# fertinaija
Last updated: 2026-11-04

## Purpose

Mobile-first independent fertility-opportunity information and visit coordination for Nigerians.

## Key Functions

- Static educational pages for surrogacy, egg donation and sperm donation.
- Browser-local guided assistant and Nigeria state check.
- Support-team handoff through the approved site chat provider.
- Factual public facility directory beginning with Havilland Fertility Clinic.
- Arrival check-in journey for users who reach a facility independently.
- Privacy and terms pages that preserve the non-medical, non-affiliated boundary.

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
| 2026-11-04 | Deployed the validated application to QuikDB production at `https://fertinaija.quikdb.net`; enabled auto-deploy from the deployment mirror's `main` branch. | `main` / deployment `deploy-ed2ce8ca-c8c7-4138-af67-22e893819889` |
| 2026-11-04 | Corrected guide routing for location and map actions; aligned privacy-request wording with the configured support channel. | `codex/fertinaija-launch` |
| 2026-11-04 | Initial production implementation. | `codex/fertinaija-launch` |

## Production

- Public URL: `https://fertinaija.quikdb.net`
- Health check: `https://fertinaija.quikdb.net/healthz`
- QuikDB deployment: `deploy-ed2ce8ca-c8c7-4138-af67-22e893819889`
- Deployed application commit: `964d0a238a69ab3ce79e94220caa03117738d82c`
- Canonical engineering repository: `https://github.com/quikdb/fertinaija` (private)
- Deployment-only mirror: `https://github.com/samsonajulor/fertinaija-deploy` (public; contains no credentials)

## Known Issues

- No dedicated FertiNaija WhatsApp Business number is currently configured.
- The automated in-page guide is live. Human live-chat handoff still depends on a site-specific chatflow being active for the production hostname.
- The brand has not completed formal trademark clearance.

## Environment Variables

- `PORT` — HTTP port supplied by QuikDB Compute.
