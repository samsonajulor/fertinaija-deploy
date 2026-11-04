const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicDirectory = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function applySecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
}

function resolveFile(urlPath) {
  const pathname = decodeURIComponent((urlPath || '/').split('?')[0]);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const normalized = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const resolved = path.join(publicDirectory, normalized);
  return resolved.startsWith(publicDirectory) ? resolved : null;
}

function createServer() {
  return http.createServer((request, response) => {
    applySecurityHeaders(response);

    if (request.url === '/healthz') {
      response.writeHead(200, {
        'Content-Type': contentTypes['.json'],
        'Cache-Control': 'no-store'
      });
      response.end(JSON.stringify({ status: 'ok', service: 'fertinaija' }));
      return;
    }

    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { 'Content-Type': contentTypes['.json'] });
      response.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const filePath = resolveFile(request.url);
    if (!filePath) {
      response.writeHead(400, { 'Content-Type': contentTypes['.json'] });
      response.end(JSON.stringify({ error: 'Invalid path' }));
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        response.writeHead(404, { 'Content-Type': contentTypes['.html'] });
        response.end('<!doctype html><title>Not found</title><h1>Page not found</h1>');
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      const immutable = /\.[a-f0-9]{8,}\./.test(path.basename(filePath));
      const mutableWebAsset = ['.html', '.css', '.js'].includes(extension);
      response.writeHead(200, {
        'Content-Type': contentTypes[extension] || 'application/octet-stream',
        'Cache-Control': mutableWebAsset ? 'no-cache' : immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'
      });

      if (request.method === 'HEAD') {
        response.end();
        return;
      }

      fs.createReadStream(filePath).pipe(response);
    });
  });
}

if (require.main === module) {
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`FertiNaija listening on port ${port}`);
  });
}

module.exports = { createServer };
