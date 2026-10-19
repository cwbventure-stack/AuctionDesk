// Builds the static site from src/ into public/. Run: node build.mjs
// Netlify runs this on every push and publishes only public/ (see netlify.toml),
// so source files stay private. public/ is generated, so it isn't committed.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

process.chdir(import.meta.dirname); // paths below are relative to the repo, wherever this is run from

import { layout, SITE } from './src/site.mjs';
import home from './src/pages/home.mjs';
import services from './src/pages/services.mjs';
import industries from './src/pages/industries.mjs';
import company from './src/pages/company.mjs';

const OUT = 'public';
const out = file => join(OUT, file);

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
rmSync(OUT, { recursive: true, force: true }); // start clean so removed pages don't linger
for (const p of pages) {
  const file = out(fileFor(p));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, layout(p));
}

const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter(p => !p.noindex);
writeFileSync(out('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(p => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority || '0.7'}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(out('robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

// Static files the pages reference.
cpSync('assets', out('assets'), { recursive: true });
cpSync('favicon.svg', out('favicon.svg'));
// Netlify serves /about.html as well as /about; send the .html versions to the
// clean URL. "!" is needed because the file exists.
writeFileSync(out('_redirects'), indexable.map(p => `/${fileFor(p)}  ${p.path}  301!`).join('\n') + '\n');

console.log(`Built ${pages.length} pages + sitemap.xml (${indexable.length} URLs) + robots.txt into ${OUT}`);
