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
Location filtering uses a state selected by the user and never automatically recommends one clinic.
Compensation and reimbursement are programme-specific and are never guaranteed by FertiNaija.
