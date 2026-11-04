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
    assert.match(body, /Telegram opens separately/i);
    assert.doesNotMatch(body, /hs-scripts\.com|hs-script-loader/i);
  });
});

test('expert handoff opens the FertiNaija Telegram channel without QuikDB chat code', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/app.js`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /https:\/\/t\.me\/fertinaija/);
    assert.match(body, /window\.open\(expertChannelUrl/);
    assert.doesNotMatch(body, /HubSpotConversations|hsConversationsOnReady/);
  });
});

test('option cards use flow layout so actions cannot overlap their descriptions', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/styles.css`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /\.option-card \{[^}]*display: flex;[^}]*flex-direction: column;/s);
    assert.match(body, /\.option-card button \{[^}]*margin-top: auto;/s);
    assert.doesNotMatch(body, /\.option-card button \{[^}]*position: absolute;/s);
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
    assert.match(body, /clinic\.state === activeDirectoryState/);
    assert.match(body, /All locations/);
    assert.match(body, /data-directory-state/);
    assert.match(body, /We do not request precise GPS location/);
    assert.match(body, /No clinic is automatically preferred/);
    assert.doesNotMatch(body, /navigator\.geolocation/);
  });
});

test('homepage omits the state search toolbar and renders the location filter container', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(baseUrl);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /id="clinicStateFilters"/);
    assert.doesNotMatch(body, /id="clinicSearch"|id="clearClinicFilters"|All listed states/);
  });
});

test('privacy choices are available before optional browser storage is used', async () => {
  await withServer(async baseUrl => {
    const [homeResponse, appResponse] = await Promise.all([fetch(baseUrl), fetch(`${baseUrl}/app.js`)]);
    const home = await homeResponse.text();
    const app = await appResponse.text();
    assert.match(home, /id="privacyBanner"/);
    assert.match(home, /data-privacy-choice="essential"/);
    assert.match(home, /data-privacy-choice="preferences"/);
    assert.match(home, /Your privacy choices/);
    assert.match(app, /fertinaija_privacy_choice/);
    assert.match(app, /navigator\.globalPrivacyControl/);
    assert.match(app, /getPrivacyChoice\(\) !== 'preferences'/);
  });
});

test('privacy and terms pages are linked in the footer and contain the current service terms', async () => {
  await withServer(async baseUrl => {
    const [homeResponse, privacyResponse, termsResponse] = await Promise.all([
      fetch(baseUrl),
      fetch(`${baseUrl}/privacy.html`),
      fetch(`${baseUrl}/terms.html`)
    ]);
    const [home, privacy, terms] = await Promise.all([
      homeResponse.text(), privacyResponse.text(), termsResponse.text()
    ]);
    assert.match(home, /href="\/privacy\.html"/);
    assert.match(home, /href="\/terms\.html"/);
    assert.match(privacy, /California privacy rights/);
    assert.match(privacy, /does not sell personal information/i);
    assert.match(privacy, /fertinaija_privacy_choice/);
    assert.match(terms, /Acceptance and adult use/);
    assert.match(terms, /Telegram handoff/);
  });
});

test('server applies baseline browser security headers', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(baseUrl);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.match(response.headers.get('permissions-policy'), /geolocation=\(\)/);
  });
});

test('unknown paths return a 404', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/missing-page`);
    assert.equal(response.status, 404);
  });
});
