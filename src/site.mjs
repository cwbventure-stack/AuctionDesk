// Shared site config, icons, layout and reusable page sections.
// Page content lives in src/pages/*.mjs; build.mjs renders everything.

export const SITE = 'https://www.auctiondesk.net';
export const BRAND = 'AuctionDesk';
export const LEGAL_NAME = 'CWB Venture, LLC';
export const ORG_ID = `${SITE}/#organization`;
// Google Analytics 4 Measurement ID (looks like 'G-XXXXXXXXXX'). Empty = analytics off.
// Turning it on also switches the privacy policy to disclose Google Analytics.
export const GA_ID = 'G-09JB5617XY';

// Loads Google Analytics only on the live domain, so local previews and the
// netlify.app address don't show up in the numbers. gtag() is always defined so
// site.js can record events without checking whether analytics loaded.
function analytics() {
  if (!GA_ID) return '';
  return `<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
if (/(^|\\.)auctiondesk\\.net$/.test(location.hostname)) {
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
  document.head.appendChild(ga);
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
}
</script>
`;
}

// ---------- Icons (24px stroke icons) ----------
const ICON_PATHS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  car: '<path d="M3 16v-3l2.2-5A2 2 0 0 1 7 7h10a2 2 0 0 1 1.8 1l2.2 5v3a1 1 0 0 1-1 1h-1M5 17H4a1 1 0 0 1-1-1M3 13h18M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  sparkle: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m14.5 9.5-2 5-5 2 2-5z"/>',
  box: '<path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  upload: '<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  repeat: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.5 15a9 9 0 1 1 17 0"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  snow: '<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>'
};

export function icon(name, size) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg${dims} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// Colored icon tile. tone: blue | yellow | ink | green | accent | (default white)
const TONES = {
  blue: '--c:var(--blue);--ic:#fff',
  yellow: '--c:var(--yellow);--ic:var(--ink)',
  ink: '--c:var(--navy);--ic:#fff',
  green: '--c:var(--green);--ic:#fff',
  accent: '--c:var(--accent);--ic:var(--ink)'
};
export const tone = t => (TONES[t] ? ` style="${TONES[t]}"` : '');
export const tile = (name, t, cls = 'ico-tile') => `<span class="${cls}"${tone(t)}>${icon(name)}</span>`;

// ---------- Navigation data ----------
export const SERVICES = [
  { href: '/services/automotive-seo', name: 'SEO & Google Business Profile', short: 'Show up on Google Search and Maps', icon: 'search', tone: 'blue' },
  { href: '/services/automotive-website-design', name: 'Website Design', short: 'Fast sites that turn visits into calls', icon: 'browser', tone: 'ink' },
  { href: '/services/automotive-advertising', name: 'Ads, Social & Reviews', short: 'Leads now, and reviews that close them', icon: 'megaphone', tone: 'yellow' },
  { href: '/services/vehicle-listing-content', name: 'Listing Photos & Copy', short: 'Inventory listings worth clicking', icon: 'camera', tone: 'green' }
];
export const INDUSTRIES = [
  { href: '/industries/car-dealers', name: 'Car Dealers', short: 'Independent and used car dealers', icon: 'car', tone: 'blue' },
  { href: '/industries/auto-repair-shops', name: 'Auto Repair Shops', short: 'General and specialty repair', icon: 'wrench', tone: 'ink' },
  { href: '/industries/auto-body-shops', name: 'Body & Collision Shops', short: 'Collision, paint and body repair', icon: 'shield', tone: 'yellow' },
  { href: '/industries/detailing-and-tire-shops', name: 'Detailers & Tire Shops', short: 'Detailing, coatings and tires', icon: 'sparkle', tone: 'green' }
];

// ---------- Brand mark ----------
const MARK = `<svg class="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="10" fill="#111316"/>
        <path d="M9 14v-3a2 2 0 0 1 2-2h3M22 9h3a2 2 0 0 1 2 2v3M27 22v3a2 2 0 0 1-2 2h-3M14 27h-3a2 2 0 0 1-2-2v-3" stroke="#ff5a1f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="m13.5 18.5 3 3 6-6.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

// ---------- Header / footer ----------
function header(path) {
  const cur = href => (href === path ? ' aria-current="page"' : '');
  const menu = (id, label, items, allHref, allLabel) => {
    const isCurrent = path === allHref || items.some(i => i.href === path);
    return `<li class="has-menu${isCurrent ? ' current' : ''}">
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="${id}">${label} ${icon('chevron', 15)}</button>
          <div class="menu" id="${id}">
${items.map(i => `            <a href="${i.href}"${cur(i.href)}><b>${i.name}</b><span>${i.short}</span></a>`).join('\n')}
            <a class="menu-all" href="${allHref}"${cur(allHref)}>${allLabel} ${icon('arrow', 15)}</a>
          </div>
        </li>`;
  };
  return `<header class="site-header" id="header">
  <div class="nav">
    <a class="brand" href="/" aria-label="${BRAND} home">
      ${MARK}
      <span class="brand-name">${BRAND}</span>
    </a>
    <nav aria-label="Primary">
      <ul class="nav-links" id="navLinks">
        ${menu('menu-services', 'Services', SERVICES, '/services', 'All services')}
        ${menu('menu-industries', 'Who We Serve', INDUSTRIES, '/industries', 'All business types')}
        <li><a href="/how-it-works"${cur('/how-it-works')}>How It Works</a></li>
        <li><a href="/about"${cur('/about')}>About</a></li>
        <li class="menu-only"><a href="/contact"${cur('/contact')}>Get In Touch</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-dark" href="/contact">Get In Touch</a>
      <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
      </button>
    </div>
  </div>
</header>`;
}

function footer() {
  const list = items => items.map(i => `<li><a href="${i.href}">${i.name}</a></li>`).join('');
  return `<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <a class="brand" href="/" aria-label="${BRAND} home">
          ${MARK}
          <span class="brand-name">${BRAND}</span>
        </a>
        <p>Marketing and merchandising for car dealers, repair shops, body shops, detailers, and tire shops. Based in Wisconsin, working nationwide. Operated by ${LEGAL_NAME}</p>
      </div>
      <nav aria-label="Services">
        <h2>Services</h2>
        <ul>${list(SERVICES)}<li><a href="/services">All services</a></li></ul>
      </nav>
      <nav aria-label="Who we serve">
        <h2>Who We Serve</h2>
        <ul>${list(INDUSTRIES)}</ul>
      </nav>
      <nav aria-label="Company">
        <h2>Company</h2>
        <ul>
          <li><a href="/how-it-works">How it works</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </div>
    <div class="footer-legal">
      <span>© ${new Date().getFullYear()} ${BRAND} · A ${LEGAL_NAME} company · Wisconsin, USA</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span>
    </div>
  </div>
  <div class="wordmark" aria-hidden="true">${BRAND}</div>
</footer>`;
}

// ---------- Structured data ----------
export const orgNode = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: BRAND,
  legalName: LEGAL_NAME,
  url: `${SITE}/`,
  logo: `${SITE}/assets/logo.png`,
  description: 'Marketing and merchandising services for automotive businesses: SEO and Google Business Profile, website design, advertising, social media, review management, and vehicle listing content.',
  address: { '@type': 'PostalAddress', addressRegion: 'WI', addressCountry: 'US' },
  areaServed: { '@type': 'Country', name: 'United States' },
  knowsAbout: ['Automotive marketing', 'Automotive SEO', 'Google Business Profile', 'Car dealership marketing', 'Auto repair shop marketing', 'Automotive website design', 'Review management', 'Vehicle listing content']
};

export function serviceNode(page, serviceType) {
  return {
    '@type': 'Service',
    '@id': `${SITE}${page.path}#service`,
    name: page.h1,
    serviceType,
    description: page.description,
    url: `${SITE}${page.path}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'United States' },
    audience: { '@type': 'BusinessAudience', audienceType: 'Automotive businesses' }
  };
}

function jsonLd(page) {
  const url = `${SITE}${page.path === '/' ? '/' : page.path}`;
  const graph = [orgNode];
  graph.push({
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': ORG_ID }
  });
  if (page.path === '/') {
    graph.push({ '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: BRAND, publisher: { '@id': ORG_ID } });
  }
  if (page.crumbs) {
    const trail = [['Home', '/'], ...page.crumbs.map(([n, h]) => [n, h || page.path])];
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${href === '/' ? '/' : href}` }))
    });
  }
  if (page.faq) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } }))
    });
  }
  if (page.schema) graph.push(...page.schema);
  // Escape "<" so nothing in the data can close the script tag early.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// ---------- Full page ----------
export function layout(page) {
  const url = `${SITE}${page.path === '/' ? '/' : page.path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${page.ogTitle || page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.add('js')</script>
${analytics()}${page.noindex ? '' : `<script type="application/ld+json">${jsonLd(page)}</script>`}
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>

${header(page.path)}

<main id="main">
${page.body}
</main>

${footer()}

<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

// ---------- Reusable sections ----------
export function crumbs(page) {
  if (!page.crumbs) return '';
  const trail = [['Home', '/'], ...page.crumbs];
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${trail.map(([n, h], i) =>
    i === trail.length - 1 ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${h}">${n}</a></li>`
  ).join('')}</ol></nav>`;
}

export function pageHero(page, { iconName, iconTone, lede, ctas = true }) {
  return `<section class="page-hero panel" aria-labelledby="page-title">
  <div class="container">
    ${crumbs(page)}
    ${iconName ? tile(iconName, iconTone) : ''}
    <h1 id="page-title" class="blur-in">${page.h1}</h1>
    <p class="lede" data-reveal style="--rd:.3s">${lede}</p>
    ${ctas ? `<div class="hero-ctas" data-reveal style="--rd:.45s">
      <a class="btn btn-accent" href="/contact">Get In Touch ${icon('arrow', 18)}</a>
      <a class="btn btn-ghost" href="/how-it-works">How it works</a>
    </div>` : ''}
  </div>
</section>`;
}

export function sectionHead(id, title, text) {
  return `<div class="section-head">
      <h2 id="${id}">${title}</h2>
      ${text ? `<p data-reveal style="--rd:.15s">${text}</p>` : ''}
    </div>`;
}

export function features(items) {
  return `<div class="features" data-stagger>
${items.map(f => `      <div class="feature">${tile(f.icon, f.tone)}<h3>${f.title}</h3><p>${f.text}</p></div>`).join('\n')}
    </div>`;
}

export function linkCards(items, { cls = '', more = 'Learn more' } = {}) {
  return `<div class="cards ${cls}" data-stagger>
${items.map(c => `      <a class="card${c.dashed ? ' dashed' : ''}" href="${c.href}">
        ${c.icon ? tile(c.icon, c.tone) : ''}
        <h3>${c.title || c.name}</h3>
        <p>${c.text}</p>
        ${c.bullets ? `<ul>${c.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        <span class="more">${c.more || more} ${icon('arrow', 16)}</span>
      </a>`).join('\n')}
    </div>`;
}

export function checkList(items) {
  return `<ul class="check-list" data-stagger>
${items.map(t => `        <li><span class="ck">${icon('check', 14)}</span><span>${t}</span></li>`).join('\n')}
      </ul>`;
}

export function faqSection(page, { panel = false, heading = 'Frequently asked questions', more = true } = {}) {
  if (!page.faq) return '';
  const slug = page.path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';
  return `<section id="faq" class="${panel ? 'panel' : ''}" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-head"><h2 id="faq-title">${heading}</h2></div>
    <div class="faq" data-reveal>
${page.faq.map((f, i) => `      <div class="faq-item">
        <h3 style="margin:0">
          <button class="faq-q" type="button" aria-expanded="false" aria-controls="${slug}-a${i}" id="${slug}-q${i}">
            ${f.q}
            <span class="pm" aria-hidden="true">${icon('plus', 16)}</span>
          </button>
        </h3>
        <div class="faq-a" id="${slug}-a${i}" role="region" aria-labelledby="${slug}-q${i}"><div>
          <p>${f.a}</p>
        </div></div>
      </div>`).join('\n')}
    </div>
    ${more ? `<p class="faq-more">Question not covered here? <a href="/contact">Ask us directly</a>.</p>` : ''}
  </div>
</section>`;
}

export function ctaBand({ title = 'Tell us what\'s slowing your business down.', text = 'A short message is enough. We\'ll follow up with questions and a plan scoped to your business, with no long-term contract.' } = {}) {
  return `<section class="panel dark cta-band" aria-labelledby="cta-title">
  <div class="container">
    <h2 id="cta-title">${title}</h2>
    <p>${text}</p>
    <div class="hero-ctas">
      <a class="btn btn-accent" href="/contact">Get In Touch ${icon('arrow', 18)}</a>
      <a class="btn btn-ghost" href="/services">Browse services</a>
    </div>
  </div>
</section>`;
}

// The six-step process row, used on the home and How It Works pages.
export const STEPS = [
  { icon: 'chat', tone: 'blue', title: 'Tell us the problem', text: 'Rankings, your website, ads, reviews, listings. Whatever is actually slowing you down.',
    detail: 'Send a short message or fill out the form. Tell us what\'s not working and what you\'ve already tried. You don\'t need to know which service you need; that\'s our job to figure out.' },
  { icon: 'compass', tone: 'yellow', title: 'We scope a plan', text: 'A written plan built around your business, not a one-size-fits-all package.',
    detail: 'We look at your website, Google Business Profile, reviews, listings, and ads, then send a written scope: what we\'ll do, in what order, what it costs, and when it starts.' },
  { icon: 'box', title: 'We get to work', text: 'SEO, web, ads, reviews, listing content. Whatever the plan calls for.',
    detail: 'You get one point of contact who knows your business. We handle the work and only pull you in when we need access, information, or a decision.' },
  { icon: 'eye', tone: 'ink', title: 'You review everything', text: 'Nothing goes live without your sign-off first.',
    detail: 'Website pages, ad copy, listing descriptions, review responses: you see it and approve it before it\'s published under your name.' },
  { icon: 'upload', title: 'It goes live', text: 'Delivered wherever it needs to land: your site, your listings, your profiles.',
    detail: 'We publish to your accounts, not ours. Your website, ad accounts, and profiles stay in your name.' },
  { icon: 'repeat', tone: 'green', title: 'We stick around', text: 'Month-to-month, so the plan changes as your business does.',
    detail: 'You get a plain-English report each month: what changed, what we did, and what\'s next. Stay as long as it\'s working, with 30 days\' written notice to stop.' }
];

export function stepsRow() {
  return `<ol class="steps" data-stagger>
${STEPS.map((s, i) => `      <li class="step">
        <span class="step-ico"${tone(s.tone)}>${icon(s.icon)}</span>
        <span class="num" aria-hidden="true">0${i + 1}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
      </li>`).join('\n')}
    </ol>`;
}

// Contact section with the form. headingTag is "h1" on the contact page.
export function contactSection({ headingTag = 'h2', title = 'Let\'s figure out what\'s slowing your business down.', pageClass = '' } = {}) {
  const check = icon('check', 18);
  return `<section id="contact" class="panel dark contact ${pageClass}" aria-labelledby="cta-title">
  <div class="container contact-grid">
    <div>
      <${headingTag} id="cta-title" class="blur-in">${title}</${headingTag}>
      <p class="lede" data-reveal style="--rd:.2s">Tell us what's not working, whether that's search rankings, your website, ads, reviews, or listings, and we'll follow up with a plan built around it.</p>
      <ul class="facts" data-stagger>
        <li>${check}Custom plans, scoped to your business</li>
        <li>${check}Month-to-month, 30 days' written notice</li>
        <li>${check}Based in Wisconsin, working nationwide</li>
      </ul>
    </div>

    <div class="contact-card" data-reveal style="--rd:.15s">
      <form id="contactForm" novalidate>
        <h2 id="contact-title">Tell us about your business</h2>
        <p class="form-sub">We'll follow up to ask a few questions and talk through a plan.</p>
        <input type="hidden" name="_subject" value="New inquiry from auctiondesk.net">
        <!-- Spam trap: hidden from people and screen readers; Formspree drops submissions that fill it in. -->
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
        <div class="form-error-banner" id="formErrorBanner" role="alert">Something went wrong sending your message. Please try again in a moment.</div>
        <div class="form-grid">
          <div class="field field-full">
            <label for="f-business">Business name <span class="req" aria-hidden="true">*</span></label>
            <input id="f-business" name="business" type="text" autocomplete="organization" required placeholder="e.g. Main Street Auto">
            <span class="error-msg" role="alert">Please enter your business name.</span>
          </div>
          <div class="field">
            <label for="f-name">Your name <span class="req" aria-hidden="true">*</span></label>
            <input id="f-name" name="name" type="text" autocomplete="name" required placeholder="First and last">
            <span class="error-msg" role="alert">Please enter your name.</span>
          </div>
          <div class="field">
            <label for="f-phone">Phone</label>
            <input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="(optional)">
          </div>
          <div class="field field-full">
            <label for="f-email">Email <span class="req" aria-hidden="true">*</span></label>
            <input id="f-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
            <span class="error-msg" role="alert">Enter a valid email so we can reply.</span>
          </div>
          <div class="field field-full">
            <label for="f-type">Type of business</label>
            <select id="f-type" name="business_type">
              <option value="">Choose one (optional)</option>
              <option>Car dealer</option>
              <option>Auto repair shop</option>
              <option>Body or collision shop</option>
              <option>Detailer</option>
              <option>Tire shop</option>
              <option>Other automotive business</option>
            </select>
          </div>
          <div class="field field-full">
            <label for="f-message">What's slowing your business down?</label>
            <textarea id="f-message" name="message" placeholder="Rankings, website, ads, reviews, listings, timing, questions..."></textarea>
          </div>
        </div>
        <button type="submit" class="btn btn-accent contact-submit" id="contactSubmit">
          <span class="btn-label">Send</span>
        </button>
        <p class="contact-fineprint">We use this only to reply to you. See our <a href="/privacy">Privacy Policy</a>.</p>
      </form>
      <div class="form-success" id="formSuccess" tabindex="-1" role="status">
        <div class="success-ring">${icon('check', 30)}</div>
        <h2>Message sent</h2>
        <p>Thanks for reaching out. We'll follow up soon.</p>
      </div>
    </div>
  </div>
</section>`;
}
