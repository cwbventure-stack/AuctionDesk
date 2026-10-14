import { icon, BRAND, LEGAL_NAME, STEPS, tone, pageHero, sectionHead, checkList, faqSection, ctaBand, contactSection, stepsRow } from '../site.mjs';

// ---------- How it works ----------
const how = {
  path: '/how-it-works',
  title: 'How It Works | AuctionDesk Automotive Marketing',
  description: 'How working with AuctionDesk works: tell us the problem, get a written plan, approve everything before it goes live, and stay month-to-month.',
  h1: 'How working with AuctionDesk works',
  crumbs: [['How It Works', null]],
  priority: '0.8',
  faq: [
    { q: 'What do you need from me to get started?', a: 'A short conversation about your business, access to the accounts we\'ll be working in (like your Google Business Profile or website), and a few minutes for approvals as work comes through.' },
    { q: 'How do you report on results?', a: 'You get a plain-English report each month: what changed, what we did, and what\'s next. If something isn\'t working, we\'ll say so and adjust.' },
    { q: 'Who owns the accounts and the work?', a: 'Your Google Business Profile, ad accounts, and social profiles stay in your business\'s name. We work inside your accounts, not ours.' },
    { q: 'What if I want to stop?', a: 'Give 30 days\' written notice. There\'s no long-term contract.' }
  ]
};
how.body = `${pageHero(how, {
  iconName: 'compass', iconTone: 'yellow', ctas: false,
  lede: 'Every engagement runs the same six steps, whatever we\'re solving. You always know what\'s happening, and nothing goes live under your name without your approval.'
})}

<section aria-labelledby="steps-title">
  <div class="container">
    <h2 id="steps-title" class="sr-only">The six steps</h2>
    ${stepsRow()}
  </div>
</section>

<section class="panel" aria-labelledby="detail-title">
  <div class="container">
    ${sectionHead('detail-title', 'Each step, in detail')}
    <ol class="step-detail" data-stagger>
${STEPS.map((s, i) => `      <li>
        <span class="step-ico"${tone(s.tone)}>${icon(s.icon)}</span>
        <div><span class="num">STEP 0${i + 1}</span><h3>${s.title}</h3><p>${s.detail}</p></div>
      </li>`).join('\n')}
    </ol>
    <div class="not-included">
      <h3>Not included</h3>
      <ul>
        <li><b>Hands-on vehicle work.</b> No reconditioning, detailing, or mechanical repairs. We market the businesses that do it.</li>
        <li><b>Pricing or appraisal advice.</b> What you charge is your call.</li>
        <li><b>Taking title to vehicles.</b> We're a service business, not a dealer.</li>
        <li><b>Shortcuts that backfire.</b> No fake reviews, bought links, guaranteed rankings, or Facebook Marketplace workarounds.</li>
      </ul>
    </div>
  </div>
</section>

${faqSection(how)}

${ctaBand({ title: 'Step one takes five minutes.', text: 'Tell us what\'s slowing your business down. We\'ll take it from there.' })}`;

// ---------- About ----------
const about = {
  path: '/about',
  title: 'About AuctionDesk | Automotive Marketing Based in Wisconsin',
  description: 'AuctionDesk is a Wisconsin-based automotive marketing and merchandising service operated by CWB Venture, LLC, working with dealers and shops nationwide.',
  h1: 'About AuctionDesk',
  crumbs: [['About', null]],
  priority: '0.6'
};
about.body = `${pageHero(about, {
  iconName: 'users', iconTone: 'ink', ctas: false,
  lede: `${BRAND} is an automotive marketing and merchandising service operated by ${LEGAL_NAME}, based in Wisconsin. We work with car dealers, repair shops, body shops, detailers, and tire shops across the US.`
})}

<section aria-labelledby="why-title">
  <div class="container aside-grid">
    <div>
      <h2 id="why-title">Start with the problem, not a package</h2>
      <p class="lede" data-reveal style="--rd:.15s">A lot of automotive marketing is sold as a bundle: a website, some ads, a dashboard, a long contract. Small dealers and shops end up paying for pieces they don't need while the real problem goes unsolved.</p>
      <p class="lede" data-reveal style="--rd:.2s">We work the other way around. Tell us what's slowing your business down, and we'll scope the work that fixes it. Sometimes that's a full plan. Sometimes it's one thing done well.</p>
    </div>
    <div class="note-box" data-reveal style="--rd:.15s">
      <div class="ico" aria-hidden="true">${icon('pin', 22)}</div>
      <p><b>Where we work.</b> We're based in Wisconsin. SEO, websites, ads, social media, reviews, and listing copy are done remotely for automotive businesses anywhere in the US.</p>
      <p>On-site work, like vehicle photography, is available in Wisconsin.</p>
    </div>
  </div>
</section>

<section class="panel" aria-labelledby="how-title">
  <div class="container narrow">
    ${sectionHead('how-title', 'How we work', 'A few things we hold ourselves to.')}
    ${checkList([
      '<b>You approve everything.</b> Nothing goes live under your business\'s name without your sign-off.',
      '<b>Month-to-month.</b> 30 days\' written notice on either side. No long-term contract.',
      '<b>Plain-English reporting.</b> What changed, what we did, and what\'s next, every month.',
      '<b>Your accounts stay yours.</b> We work inside your Google, ad, and social accounts.',
      '<b>Honest about limits.</b> No guaranteed rankings, fake reviews, or shortcuts that put your business at risk.'
    ])}
  </div>
</section>

${ctaBand()}`;

// ---------- Contact ----------
const contact = {
  path: '/contact',
  title: 'Contact AuctionDesk | Get a Custom Marketing Plan',
  description: 'Tell us what\'s slowing your automotive business down. We\'ll follow up with questions and a plan scoped to your dealership or shop.',
  h1: 'Tell us what\'s slowing your business down.',
  priority: '0.8'
};
contact.body = `${contactSection({ headingTag: 'h1', title: contact.h1, pageClass: 'contact-page' })}

<section aria-labelledby="next-title">
  <div class="container narrow">
    ${sectionHead('next-title', 'What happens next')}
    <ol class="step-detail" data-stagger>
${[
  ['chat', 'blue', 'We read it and reply', 'You\'ll hear back from a person, not an autoresponder, with any questions we need answered.'],
  ['phone', 'ink', 'A short conversation', 'We talk through your business, what\'s not working, and what you\'ve already tried.'],
  ['file', 'green', 'A written plan', 'You get a scope with what we\'d do, in what order, and what it costs. No obligation.']
].map(([ic, t, title, text], i) => `      <li>
        <span class="step-ico"${tone(t)}>${icon(ic)}</span>
        <div><span class="num">STEP 0${i + 1}</span><h3>${title}</h3><p>${text}</p></div>
      </li>`).join('\n')}
    </ol>
  </div>
</section>`;

// ---------- Privacy ----------
const privacy = {
  path: '/privacy',
  title: 'Privacy Policy | AuctionDesk',
  description: 'What AuctionDesk collects through its contact form, why, and how to request a copy or deletion of your information.',
  h1: 'Privacy Policy',
  crumbs: [['Privacy Policy', null]],
  priority: '0.2'
};
privacy.body = `${pageHero(privacy, { ctas: false, lede: 'Last updated October 14, 2026' })}

<section aria-label="Policy">
  <div class="container">
    <div class="prose">
      <p>${BRAND} is operated by ${LEGAL_NAME}, a Wisconsin limited liability company ("we," "us"). This page explains what information we collect through this website and how we use it.</p>

      <h2>What we collect</h2>
      <p>The only personal information we collect is what you choose to submit through the contact form: your business name, your name, your email address, and optionally a phone number, your type of business, and any message you write. We don't use analytics, tracking pixels, or advertising cookies on this site, and we don't collect information automatically beyond what your browser sends to load the page.</p>

      <h2>How we use it</h2>
      <p>We use the information you submit only to respond to your inquiry and, if you become a client, to set up and administer your service agreement. We don't sell your information, and we don't share it with anyone except the service providers described below.</p>

      <h2>Third-party services we use</h2>
      <ul>
        <li><b>Google Fonts.</b> This site loads typefaces from Google's servers. Google may log the request, including your IP address, under its own privacy policy.</li>
        <li><b>Form delivery service.</b> When you submit the contact form, it's delivered to us through a third-party form-processing service so we can read it by email. That provider processes the message only to route it to us.</li>
        <li><b>Hosting.</b> This site is hosted by Vercel, which may keep standard server logs, such as IP addresses and request times, to operate and secure the service.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>We keep inquiry information only as long as needed to respond to you or, if you sign a service agreement with us, for the duration of that relationship and any retention period that agreement requires.</p>

      <h2>Your rights</h2>
      <p>You can ask what information we have about you, ask us to correct it, or ask us to delete it. Send your request through the <a href="/contact">contact form</a>.</p>

      <h2>Children's privacy</h2>
      <p>This is a business-to-business service for automotive businesses. We don't knowingly collect information from children, and this site isn't directed at them.</p>

      <h2>Changes to this policy</h2>
      <p>If this policy changes, we'll update the date at the top of this page.</p>
    </div>
  </div>
</section>`;

// ---------- Terms ----------
const terms = {
  path: '/terms',
  title: 'Terms of Use | AuctionDesk',
  description: 'Terms of use for the AuctionDesk website.',
  h1: 'Terms of Use',
  crumbs: [['Terms of Use', null]],
  priority: '0.2'
};
terms.body = `${pageHero(terms, { ctas: false, lede: 'Last updated October 14, 2026' })}

<section aria-label="Terms">
  <div class="container">
    <div class="prose">
      <p>These terms cover use of this website only. They're separate from, and don't replace, the written service agreement that governs the services ${BRAND} (operated by ${LEGAL_NAME}) provides to a client once both parties sign one.</p>

      <h2>Informational purpose</h2>
      <p>Content on this site describes our services in good faith but isn't a binding offer. A specific engagement is binding only once we've agreed on scope and signed a service agreement.</p>

      <h2>No guaranteed results</h2>
      <p>Statements about process, timing, or outcomes describe how we intend to work, not a guarantee of results for any particular business. Search rankings, ad performance, and reviews depend on factors outside our control, including decisions made by Google, Meta, and other platforms. Specific commitments, if any, are set out in your signed service agreement.</p>

      <h2>Intellectual property</h2>
      <p>The text, design, and branding on this site belong to ${LEGAL_NAME}. You're welcome to link to it; please don't copy the site itself.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Wisconsin.</p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. The date at the top of this page reflects the most recent revision.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent through the <a href="/contact">contact form</a>.</p>
    </div>
  </div>
</section>`;

// ---------- 404 ----------
const notFound = {
  path: '/404',
  file: '404.html',
  title: 'Page Not Found | AuctionDesk',
  description: 'The page you were looking for doesn\'t exist.',
  h1: 'That page doesn\'t exist.',
  noindex: true
};
notFound.body = `<section class="page-hero panel" aria-labelledby="page-title">
  <div class="container">
    <span class="ico-tile" style="--c:var(--accent)">${icon('compass')}</span>
    <h1 id="page-title">${notFound.h1}</h1>
    <p class="lede">It may have moved when we reorganized the site. These should get you where you're going.</p>
    <div class="hero-ctas" style="margin-top:32px">
      <a class="btn btn-accent" href="/">Go to the homepage ${icon('arrow', 18)}</a>
      <a class="btn btn-ghost" href="/services">Browse services</a>
      <a class="btn btn-ghost" href="/contact">Contact us</a>
    </div>
  </div>
</section>`;

export default [how, about, contact, privacy, terms, notFound];
