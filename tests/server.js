// Tiny static server for local use and for the tests.
//   node tests/server.js            -> serves the repository at http://localhost:8080
//   WEBR_DIR=/path/to/webr/dist ... -> also serves a local copy of webR at /webr/
//                                      (useful when the webR CDN cannot be reached)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8080);
const WEBR_DIR = process.env.WEBR_DIR ? path.resolve(process.env.WEBR_DIR) : null;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
  '.css': 'text/css', '.sql': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  let base = ROOT;
  if (WEBR_DIR && pathname.startsWith('/webr/')) { base = WEBR_DIR; pathname = pathname.slice('/webr'.length); }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.join(base, pathname);
  if (!file.startsWith(base)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`R Quest at http://localhost:${PORT}${WEBR_DIR ? ' (local webR at /webr/)' : ''}`));
