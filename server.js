#!/usr/bin/env node
/**
 * stage-x.space — local static hosting server
 * Zero-dependency, production-tuned: gzip, cache headers, SPA fallback,
 * correct MIME types. Serves the landing page from this directory.
 *
 * Usage:
 *   node server.js            # serves on 0.0.0.0:8080
 *   PORT=3000 node server.js  # custom port
 */
'use strict';

// Core requires (original project structure)
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);


const ROOT = __dirname;
const DEFAULT_PORT = 8080;
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

// Fast, allocation-free MIME lookups via an object literal (JS engines
// optimize these into inline-cache dictionaries).
const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
});

// SPA fallback: any unknown path serves index.html (mirrors the CloudFront
// 404 -> /index.html error response so local behaviour matches prod).
const INDEX_FILE = path.join(ROOT, 'index.html');

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

function log(req, status, bytes) {
  const ts = new Date().toISOString();
  process.stdout.write(`${ts} ${req.method} ${req.url} ${status} ${bytes}B\n`);
}

async function handle(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  // Path normalization + traversal guard.
  let rel = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (rel === '/' || rel === '\\' || rel.startsWith('.')) rel = 'index.html';
  const filePath = path.join(ROOT, rel);

  let fileStat;
  try {
    fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('not a file');
  } catch {
    // SPA fallback — same semantics as production (404 -> index.html, 200).
    let indexStat;
    try { indexStat = await stat(INDEX_FILE); } catch { res.writeHead(404); res.end('Not Found'); return; }
    serveFile(req, res, INDEX_FILE, indexStat);
    return;
  }

  serveFile(req, res, filePath, fileStat);
}

function serveFile(req, res, filePath, fileStat) {
  const mime = mimeFor(filePath);
  const acceptEncoding = req.headers['accept-encoding'] || '';

  const useGzip = /gzip/.test(acceptEncoding);
  const useBrotli = /br/.test(acceptEncoding);

  // Brotli compresses ~15% better than gzip; prefer it when advertised.
  const encoding = useBrotli ? 'br' : useGzip ? 'gzip' : null;
  const etag = `"${fileStat.size.toString(16)}-${fileStat.mtimeMs.toString(16)}"`;

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    res.end();
    log(req, 304, 0);
    return;
  }

  const headers = {
    'Content-Type': mime,
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
  };

  if (encoding) {
    const raw = fs.createReadStream(filePath);
    const comp = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 } });
    const stream = encoding === 'br' ? raw.pipe(comp) : raw.pipe(zlib.createGzip({ level: 6 }));
    headers['Content-Encoding'] = encoding;
    res.writeHead(200, headers);
    let sent = 0;
    stream.on('data', (c) => { sent += c.length; }).on('error', terminate);
    stream.pipe(res);
    res.on('finish', () => log(req, 200, sent));
    return;
  }

  fs.createReadStream(filePath).on('error', terminate).pipe(res);
  res.writeHead(200, headers);
  res.on('finish', () => log(req, 200, fileStat.size));
}

function terminate() {
  // No-op handler for stream errors on closed sockets.
}

const server = http.createServer((req, res) => handle(req, res).catch(() => {
  if (!res.headersSent) res.writeHead(500);
  res.end('Internal Server Error');
}));

server.setTimeout(30_000, (socket) => socket.destroy());
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 10_000;
server.headersTimeout = 10_000;

server.listen(PORT, HOST, () => {
  const ifaces = Object.values(require('os').networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal);
  console.log(`⚡ stage-x.space locally`);
  console.log(`   http://localhost:${PORT}`);
  for (const i of ifaces) console.log(`   http://${i.address}:${PORT}`);
});