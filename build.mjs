// Builds the static site from src/ into the repo root. Run: node build.mjs
// Generated HTML is committed and deployed as plain static files (see vercel.json).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { layout, SITE } from './src/site.mjs';
import home from './src/pages/home.mjs';
import services from './src/pages/services.mjs';
import industries from './src/pages/industries.mjs';
import company from './src/pages/company.mjs';

const pages = [home, ...services, ...industries, ...company];

// Catch the mistakes that silently hurt SEO before anything is written.
const seen = new Set();
for (const p of pages) {
  if (seen.has(p.path)) throw new Error(`Duplicate path: ${p.path}`);
  seen.add(p.path);
  if (!p.title || !p.description || !p.h1) throw new Error(`${p.path} is missing a title, description, or h1`);
  if (p.title.length > 65) console.warn(`warn: ${p.path} title is ${p.title.length} chars (Google shows about 60)`);
  if (p.description.length > 165) console.warn(`warn: ${p.path} description is ${p.description.length} chars (Google shows about 155)`);
  if ((p.body.match(/<h1[\s>]/g) || []).length !== 1) throw new Error(`${p.path} must have exactly one <h1>`);
  if (/—/.test(p.body + p.title + p.description)) throw new Error(`${p.path} contains an em dash`);
}

const fileFor = p => p.file || (p.path === '/' ? 'index.html' : `${p.path.slice(1)}.html`);
for (const p of pages) {
  const file = fileFor(p);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, layout(p));
}

const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter(p => !p.noindex);
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(p => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority || '0.7'}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

console.log(`Built ${pages.length} pages + sitemap.xml (${indexable.length} URLs) + robots.txt`);
