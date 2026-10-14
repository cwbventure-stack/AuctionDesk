import { icon, tile, SERVICES, INDUSTRIES, linkCards, stepsRow, contactSection, faqSection } from '../site.mjs';

const page = {
  path: '/',
  title: 'Automotive Marketing for Dealers and Shops | AuctionDesk',
  ogTitle: 'AuctionDesk | Automotive marketing built around your actual problem',
  description: 'SEO, websites, ads, reviews, and listing content for car dealers, auto repair shops, body shops, detailers, and tire shops. Custom plans, month-to-month.',
  h1: 'Automotive marketing built around the problem you actually have.',
  priority: '1.0',
  faq: [
    { q: 'What kinds of automotive businesses do you work with?', a: 'Independent and used car dealers, auto repair shops, body and collision shops, detailers, and tire shops. If your business sells or services vehicles and you\'re not sure you fit, ask.' },
    { q: 'Do you work with businesses outside Wisconsin?', a: 'Yes. SEO, websites, ads, social media, review management, and listing copy are all done remotely, for automotive businesses anywhere in the US. On-site work like vehicle photography is available in Wisconsin.' },
    { q: 'How much does it cost?', a: 'It depends on what we\'re solving. After a short conversation, we send a written scope with the price before any work starts, so there are no surprise fees.' },
    { q: 'Is there a long-term contract?', a: 'No. Every engagement is month-to-month with 30 days\' written notice on either side.' },
    { q: 'Can you guarantee first-page rankings on Google?', a: 'No, and be wary of anyone who does. Google decides rankings. What we can promise is the work that earns them: an accurate Google Business Profile, a properly built website, and steady, useful content, with plain reporting on what\'s changing.' },
    { q: 'Do I have to sign up for everything?', a: 'No. Plenty of businesses start with one service, like cleaning up their Google Business Profile or rewriting their listings, and add more only if it makes sense.' }
  ]
};

// Hero diagram: six services feeding one result.
const nodes = [
  { x: 120, y: 170, big: true, d: '.8s', icon: 'search', tone: 'blue', label: 'Local SEO' },
  { x: 232, y: 72, d: '.95s', icon: 'star', tone: 'yellow', label: 'Reviews' },
  { x: 252, y: 280, d: '1.1s', icon: 'camera', label: 'Listing content' },
  { x: 768, y: 74, d: '.95s', icon: 'browser', tone: 'ink', label: 'Website' },
  { x: 880, y: 170, big: true, d: '.8s', icon: 'megaphone', label: 'Ads' },
  { x: 758, y: 284, d: '1.1s', icon: 'chat', tone: 'green', label: 'Social' }
];
const flow = `<div class="flow" aria-hidden="true">
      <svg class="lines" viewBox="0 0 1000 340">
        <path pathLength="1" style="--d:.2s" d="M440 170H130"/>
        <path pathLength="1" style="--d:.4s" d="M372 170 312 72H232"/>
        <path pathLength="1" style="--d:.5s" d="M352 170 300 280H252"/>
        <path pathLength="1" style="--d:.2s" d="M560 170H870"/>
        <path pathLength="1" style="--d:.4s" d="M628 170 688 74H768"/>
        <path pathLength="1" style="--d:.5s" d="M648 170 700 284H758"/>
        <circle style="--d:1s" cx="312" cy="72" r="4"/>
        <circle style="--d:1.05s" cx="300" cy="280" r="4"/>
        <circle style="--d:1s" cx="688" cy="74" r="4"/>
        <circle style="--d:1.05s" cx="700" cy="284" r="4"/>
      </svg>
${nodes.map(n => `      <div class="node" style="--x:${n.x};--y:${n.y};${n.big ? '--s:9cqw;' : ''}--d:${n.d}">
        ${tile(n.icon, n.tone, 'tile')}
        <span class="label">${n.label}</span>
      </div>`).join('\n')}
      <div class="node hub" style="--x:500;--y:170;--s:12cqw;--d:0s">
        <div class="tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M20 6 9 17l-5-5"/></svg></div>
      </div>
    </div>`;

// Rotating arc of business types (decorative; the real links sit in the heading text).
const ringTypes = [
  ['car', 'Car dealers'], ['wrench', 'Repair shops'], ['shield', 'Body shops'],
  ['sparkle', 'Detailers'], ['tire', 'Tire shops'], ['car', 'Collision centers']
];
const ring = [...ringTypes, ...ringTypes].map(([ic, name], i) =>
  `<div class="ring-tile" style="--i:${i}">${icon(ic, 22)}${name}</div>`).join('\n      ');

const check = icon('check', 18);

page.body = `<!-- ============ HERO ============ -->
<section class="hero panel" aria-labelledby="hero-title">
  <div class="container">
    ${flow}
    <h1 id="hero-title" class="blur-in">${page.h1}</h1>
    <p class="hero-sub" data-reveal style="--rd:.35s">SEO, websites, ads, reviews, and listing content for car dealers, repair shops, body shops, detailers, and tire shops. Tell us what's slowing you down and we'll scope a plan around it.</p>
    <div class="hero-ctas" data-reveal style="--rd:.5s">
      <a class="btn btn-accent" href="/contact">Get In Touch ${icon('arrow', 18)}</a>
      <a class="btn btn-ghost" href="/services">See our services</a>
    </div>
    <ul class="hero-points" data-reveal style="--rd:.65s">
      <li>${check}Custom plans, not packages</li>
      <li>${check}Month-to-month, 30 days' notice</li>
      <li>${check}You approve everything first</li>
    </ul>
  </div>
</section>

<!-- ============ WHO WE SERVE ============ -->
<section class="ring-section" aria-labelledby="serve-title">
  <div class="container">
    <div class="section-head">
      <h2 id="serve-title">For every kind of automotive business</h2>
      <p data-reveal style="--rd:.2s"><a href="/industries/car-dealers">Car dealers</a>, <a href="/industries/auto-repair-shops">repair shops</a>, <a href="/industries/auto-body-shops">body and collision shops</a>, <a href="/industries/detailing-and-tire-shops">detailers and tire shops</a>.</p>
    </div>
  </div>
  <div class="ring-wrap" aria-hidden="true">
    <div class="ring">
      ${ring}
    </div>
  </div>
</section>

<!-- ============ SERVICES ============ -->
<section class="panel" aria-labelledby="services-title">
  <div class="container">
    <div class="section-head">
      <h2 id="services-title">What we can take off your plate</h2>
      <p data-reveal style="--rd:.15s">Pick one, or let us figure out which one matters most for your business right now.</p>
    </div>
    ${linkCards([
      { ...SERVICES[0], title: 'SEO & Google Business Profile', text: 'Show up when nearby customers search for what you sell or fix, on Google Search and Google Maps.' },
      { ...SERVICES[1], title: 'Website design', text: 'Fast, mobile-friendly websites for dealers and shops, built to turn visitors into calls, quotes, and appointments.' },
      { ...SERVICES[2], title: 'Ads, social & reviews', text: 'Google and Facebook ads, social posting, and a steady system for earning and answering reviews.' },
      { ...SERVICES[3], title: 'Listing photos & copy', text: 'Vehicle photos and listing descriptions that make your inventory stand out on your site and marketplaces.' }
    ], { cls: 'two' })}
    <p class="faq-more">Problem not on the list? <a href="/contact">Tell us about it</a>. If it's marketing or merchandising, we can probably scope it.</p>
  </div>
</section>

<!-- ============ PROCESS ============ -->
<section aria-labelledby="process-title">
  <div class="container">
    <div class="section-head">
      <h2 id="process-title">One process. Any problem.</h2>
      <p data-reveal style="--rd:.15s">Every engagement runs the same six steps, whether it's local SEO for a repair shop or listing copy for a used car lot.</p>
    </div>
    ${stepsRow()}
    <p class="steps-more"><a class="text-link" href="/how-it-works">See how it works ${icon('arrow', 16)}</a></p>
  </div>
</section>

<!-- ============ CONTACT ============ -->
${contactSection()}

<!-- ============ FAQ ============ -->
${faqSection(page)}`;

export default page;
