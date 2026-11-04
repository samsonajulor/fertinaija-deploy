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
    assert.match(body, /No clinic affiliation/);
    assert.match(body, /does not book appointments/i);
    assert.match(body, /does not guarantee selection or payment/i);
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
