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
| `test/server.test.js` | Health, boundary-copy and security-header tests. |

## Recent Changes

| Date | Change | Branch/PR |
|------|--------|-----------|
| 2026-11-04 | Corrected guide routing for location and map actions; aligned privacy-request wording with the configured support channel. | `codex/fertinaija-launch` |
| 2026-11-04 | Initial production implementation. | `codex/fertinaija-launch` |

## Known Issues

- No dedicated FertiNaija WhatsApp Business number is currently configured.
- Live support depends on a site-specific chatflow being active for the production hostname.
- The brand has not completed formal trademark clearance.

## Environment Variables

- `PORT` — HTTP port supplied by QuikDB Compute.
