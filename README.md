# FertiNaija

Independent fertility-opportunity, possible-reward and public clinic information for Nigerians.

## Run

```bash
npm start
```

The server listens on `PORT` or port `3000` and exposes `GET /healthz`.

## Validate

```bash
npm run check
npm test
```

## Production

The intended QuikDB deployment is `https://fertinaija.quikdb.net` with:

- install command: none
- build command: none
- start command: `npm start`
- internal port: `3000`
- health check: `/healthz`

## Service boundary

FertiNaija is not a clinic or medical provider. Public facility listings do not imply affiliation.
The application does not transmit user information to listed facilities.
The full selected directory appears by default. Location buttons and any state selected in the
browser-local guide narrow the visible listings without requesting precise location.
Compensation and reimbursement are programme-specific and are never guaranteed by FertiNaija.
The browser-local guide remains on the site, while opportunity-expert handoffs open
`https://t.me/fertinaija`. The shared QuikDB HubSpot support widget is intentionally not loaded.
The footer links to the privacy policy, terms and privacy-choice controls. One necessary consent
cookie is used; the directory location is stored only when the visitor allows preferences.
