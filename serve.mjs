// Local preview server that mimics Vercel's cleanUrls: /about -> about.html.
// Run: node serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.argv[2]) || 4175;
const root = import.meta.dirname; // serve files next to this script, wherever it's launched from
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = path === '/' ? ['index.html'] : extname(path) ? [path] : [`${path}.html`, join(path, 'index.html')];
  for (const c of candidates) {
    try {
      const body = await readFile(join(root, c));
      res.writeHead(200, { 'Content-Type': types[extname(c)] || 'application/octet-stream' });
      return res.end(body);
    } catch {}
  }
  res.writeHead(404, { 'Content-Type': types['.html'] });
  res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
}).listen(port, () => console.log(`http://localhost:${port}`));
