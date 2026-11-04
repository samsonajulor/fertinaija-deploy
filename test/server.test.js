const assert = require('node:assert/strict');
const test = require('node:test');
const { createServer } = require('../server');

async function withServer(run) {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('health endpoint reports the service as healthy', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/healthz`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'fertinaija' });
  });
});

test('homepage preserves independent-service boundaries', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(baseUrl);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /FertiNaija/);
    assert.match(body, /No clinic is automatically recommended or preferred/i);
    assert.match(body, /No clinic receives your information from FertiNaija/i);
    assert.match(body, /No acceptance or payment is promised/i);
  });
});

test('public clinic dataset contains multiple states and qualified reward evidence', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/clinics.js`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /Lilyfields Medical Center/);
    assert.match(body, /Havilland Fertility Clinic/);
    assert.match(body, /Gynescope Specialist Hospital — Port Harcourt/);
    assert.match(body, /FCT Abuja/);
    assert.match(body, /Cross River/);
    assert.match(body, /Publishes reimbursement plus time, risk and commitment compensation/i);
  });
});

test('directory logic filters by selected state without precise geolocation', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/app.js`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /clinic\.state === state/);
    assert.match(body, /We do not request precise GPS location/);
    assert.match(body, /No clinic is automatically preferred/);
    assert.doesNotMatch(body, /navigator\.geolocation/);
  });
});

test('server applies baseline browser security headers', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(baseUrl);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.match(response.headers.get('permissions-policy'), /geolocation=\(self\)/);
  });
});

test('unknown paths return a 404', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/missing-page`);
    assert.equal(response.status, 404);
  });
});
