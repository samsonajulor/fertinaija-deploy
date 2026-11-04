# FertiNaija

Independent fertility-opportunity information and visit coordination for Nigerians.

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
