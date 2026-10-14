import { icon, SERVICES, INDUSTRIES, pageHero, sectionHead, features, linkCards, checkList, faqSection, ctaBand } from '../site.mjs';

// Service cards with copy tailored to one kind of business.
const svc = (i, text) => ({ ...SERVICES[i], title: SERVICES[i].name, text });

// ---------- Who we serve overview ----------
const overview = {
  path: '/industries',
  title: 'Who We Serve: Marketing for Automotive Businesses | AuctionDesk',
  description: 'Marketing for car dealers, auto repair shops, body and collision shops, detailers, and tire shops. Plans built around how your kind of business gets customers.',
  h1: 'Marketing for every kind of automotive business',
  crumbs: [['Who We Serve', null]],
  priority: '0.9'
};
overview.body = `${pageHero(overview, {
  iconName: 'users', iconTone: 'accent',
  lede: 'A used car lot and a collision shop get customers in different ways. We start with how your kind of business actually wins work, then build the plan around it.'
})}

<section aria-labelledby="types-title">
  <div class="container">
    ${sectionHead('types-title', 'Pick your business', 'Each page covers the problems that come up most for that kind of business and the services that fit.')}
    ${linkCards(INDUSTRIES.map(i => ({ ...i, title: i.name, text: {
      '/industries/car-dealers': 'Get inventory found, make listings worth clicking, and turn shoppers into calls and visits.',
      '/industries/auto-repair-shops': 'Show up on Google Maps, earn more reviews, and keep the bays full between busy seasons.',
      '/industries/auto-body-shops': 'Be the shop drivers find and trust right after an accident.',
      '/industries/detailing-and-tire-shops': 'Photos, booking, and seasonal timing for detailing and tire businesses.'
    }[i.href] })), { cls: 'two', more: 'See how we help' })}
    <p class="faq-more">Run a different kind of automotive business? <a href="/contact">Tell us about it</a>.</p>
  </div>
</section>

${ctaBand()}`;

// ---------- Car dealers ----------
const dealers = {
  path: '/industries/car-dealers',
  title: 'Car Dealership Marketing for Independent Dealers | AuctionDesk',
  description: 'Digital marketing for independent and used car dealers: dealer SEO, websites, inventory ads, review management, and vehicle listing content that sells.',
  h1: 'Car dealership marketing for independent and used car dealers',
  crumbs: [['Who We Serve', '/industries'], ['Car Dealers', null]],
  faq: [
    { q: 'Do you work with franchise dealers?', a: 'We\'re built for independent and used car dealers. Franchise stores often have manufacturer co-op rules and approved-vendor lists. If you\'re a franchise dealer, ask and we\'ll tell you honestly whether we\'re a fit.' },
    { q: 'Do you work with buy here pay here lots?', a: 'Yes. The fundamentals are the same: get found, look trustworthy, and make it easy to reach you.' },
    { q: 'Can you post our inventory to Facebook Marketplace?', a: 'We don\'t use workarounds to post dealer inventory on Facebook Marketplace. They break Meta\'s rules and can get your accounts restricted. We use Facebook and Instagram ads to reach local shoppers instead.' },
    { q: 'Do you give pricing or appraisal advice?', a: 'No. Pricing your inventory is your call. We focus on getting it seen and making the listing do its job.' },
    { q: 'Do you need to visit our lot?', a: 'Only for on-site photography, which is available in Wisconsin. Everything else, including listing copy, SEO, ads, and reviews, is done remotely for dealers anywhere in the US.' }
  ]
};
dealers.body = `${pageHero(dealers, {
  iconName: 'car', iconTone: 'blue',
  lede: 'Your inventory changes every week, and every unit that sits costs you money. We help independent dealers get vehicles found, make listings worth clicking, and turn shoppers into calls and visits.'
})}

<section aria-labelledby="prob-title">
  <div class="container">
    ${sectionHead('prob-title', 'Problems we help dealers solve', 'If one of these sounds familiar, that\'s usually where we start.')}
    ${features([
      { icon: 'search', tone: 'blue', title: 'Inventory that doesn\'t show up', text: 'Vehicle pages Google can\'t find or index, so shoppers never see the cars you have.' },
      { icon: 'pencil', title: 'Listings that all read the same', text: 'Template descriptions that tell buyers nothing about the actual vehicle.' },
      { icon: 'camera', tone: 'ink', title: 'Thin or inconsistent photos', text: 'A few quick phone shots that don\'t show the car well, or skip what buyers want to see.' },
      { icon: 'star', tone: 'yellow', title: 'Not enough reviews', text: 'Too few recent reviews, or reviews that never get a reply.' },
      { icon: 'phone', title: 'A website that\'s slow on phones', text: 'Shoppers bounce before they find the car, the price, or your phone number.' },
      { icon: 'chart', tone: 'green', title: 'Ad spend you can\'t trace', text: 'Money going to ads without a clear picture of which ones produce calls and leads.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="fit-title">
  <div class="container">
    ${sectionHead('fit-title', 'Services that fit dealers', 'Use one, or combine them.')}
    ${linkCards([
      svc(0, 'Inventory pages Google can index, vehicle structured data, and a Google Business Profile that reflects your lot.'),
      svc(1, 'A fast site with inventory front and center, connected to your inventory provider where it supports it.'),
      svc(2, 'Local inventory ads, social posts from your lot, and a review request after every sale.'),
      svc(3, 'Listing copy written from the VIN and the actual vehicle, plus consistent photo sets in Wisconsin.')
    ], { cls: 'two' })}
  </div>
</section>

${faqSection(dealers)}

${ctaBand({ title: 'Let\'s get your inventory moving.', text: 'Tell us about your lot and what\'s sitting. We\'ll follow up with what we\'d fix first.' })}`;

// ---------- Auto repair shops ----------
const repair = {
  path: '/industries/auto-repair-shops',
  title: 'Auto Repair Shop Marketing & SEO | AuctionDesk',
  description: 'Marketing for auto repair shops: local SEO, Google Business Profile, websites, Google Ads, and review management that keep your bays full.',
  h1: 'Auto repair shop marketing that keeps your bays full',
  crumbs: [['Who We Serve', '/industries'], ['Auto Repair Shops', null]],
  faq: [
    { q: 'Do you work with specialty shops?', a: 'Yes. Transmission, diesel, European, performance, and fleet service shops all need the same foundation, with pages and ads built around the specific work you do.' },
    { q: 'Can my website take appointment requests?', a: 'Yes. We can add an appointment request form, or link to the online booking tool your shop management software already provides.' },
    { q: 'How do I get more Google reviews?', a: 'Ask every customer, consistently, with a direct link, right after the job. We set up a simple system for that and reply to reviews for you. See <a href="/services/automotive-advertising">ads, social, and reviews</a>.' },
    { q: 'Do you work with shops outside Wisconsin?', a: 'Yes. Everything we do for repair shops is done remotely, for shops anywhere in the US.' }
  ]
};
repair.body = `${pageHero(repair, {
  iconName: 'wrench', iconTone: 'ink',
  lede: 'Most people don\'t shop around for a mechanic until they need one. Then they pick from whoever shows up on Google Maps with good reviews and a number they can tap. We help independent repair shops be that shop.'
})}

<section aria-labelledby="prob-title">
  <div class="container">
    ${sectionHead('prob-title', 'Problems we help repair shops solve', 'If one of these sounds familiar, that\'s usually where we start.')}
    ${features([
      { icon: 'pin', tone: 'blue', title: 'Not showing up on Google Maps', text: 'Competitors appear in the map results for "auto repair near me" and you don\'t.' },
      { icon: 'star', tone: 'yellow', title: 'Few or old reviews', text: 'A handful of reviews from years ago, while the shop down the road has hundreds.' },
      { icon: 'layout', title: 'No service pages', text: 'One generic page instead of a page for brakes, diagnostics, transmissions, and everything else you do.' },
      { icon: 'phone', tone: 'ink', title: 'Calls you can\'t trace', text: 'No idea which ads or listings actually make the phone ring.' },
      { icon: 'calendar', title: 'Slow stretches', text: 'Busy weeks followed by empty bays, with nothing to smooth out the gaps.' },
      { icon: 'users', tone: 'green', title: 'Word of mouth only', text: 'Great work and loyal customers, but no way for new ones to find you.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="fit-title">
  <div class="container">
    ${sectionHead('fit-title', 'Services that fit repair shops', 'Most shops start with their Google Business Profile and reviews.')}
    ${linkCards([
      svc(0, 'A complete Google Business Profile, a page for every service, and service-area coverage for nearby towns.'),
      svc(1, 'A fast site with tap-to-call, appointment requests, and accurate hours and directions.'),
      svc(2, 'Local search ads for high-intent repairs, plus a review request after every job.')
    ])}
  </div>
</section>

${faqSection(repair)}

${ctaBand({ title: 'Let\'s keep your bays full.', text: 'Tell us about your shop and what work you want more of. We\'ll follow up with a plan.' })}`;

// ---------- Body & collision shops ----------
const body = {
  path: '/industries/auto-body-shops',
  title: 'Auto Body & Collision Shop Marketing | AuctionDesk',
  description: 'Marketing for auto body and collision repair shops: local SEO, websites with estimate requests, review management, and ads that reach drivers after an accident.',
  h1: 'Auto body and collision shop marketing',
  crumbs: [['Who We Serve', '/industries'], ['Body & Collision Shops', null]],
  faq: [
    { q: 'Can customers request an estimate on our website?', a: 'Yes. We can add an estimate request form that lets drivers describe the damage and attach photos.' },
    { q: 'Do you work with shops on insurance direct repair programs?', a: 'Yes, whether you\'re on direct repair programs or not. Your marketing should explain clearly how you work with insurance companies so drivers know what to expect.' },
    { q: 'What should we post on social media?', a: 'Before-and-after photos of real repairs work well, as long as you have the customer\'s permission and personal details like plates are hidden. We plan and post them for you.' },
    { q: 'Do you work with shops outside Wisconsin?', a: 'Yes. Everything we do for body shops is done remotely, for shops anywhere in the US.' }
  ]
};
body.body = `${pageHero(body, {
  iconName: 'shield', iconTone: 'yellow',
  lede: 'After an accident, most drivers search for a body shop on their phone, check reviews, and call one or two. Being the shop they find, and trust, is what wins the job.'
})}

<section aria-labelledby="prob-title">
  <div class="container">
    ${sectionHead('prob-title', 'Problems we help body shops solve', 'If one of these sounds familiar, that\'s usually where we start.')}
    ${features([
      { icon: 'search', tone: 'blue', title: 'Invisible for collision searches', text: 'Not showing up when drivers search for collision repair or a body shop nearby.' },
      { icon: 'file', title: 'No way to request an estimate', text: 'Drivers have to call during business hours just to start the conversation.' },
      { icon: 'image', tone: 'ink', title: 'Great work nobody sees', text: 'Quality repairs with no before-and-after photos anywhere online.' },
      { icon: 'star', tone: 'yellow', title: 'Reviews that don\'t reflect the work', text: 'Too few reviews, or unanswered complaints that scare off new customers.' },
      { icon: 'chat', title: 'Confusion about insurance', text: 'Drivers unsure how the process works with their insurance company, so they go with whoever their insurer mentions.' },
      { icon: 'target', tone: 'green', title: 'Ads that miss the moment', text: 'Ads that run all the time instead of reaching drivers when they actually need a shop.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="fit-title">
  <div class="container">
    ${sectionHead('fit-title', 'Services that fit body shops', 'Reviews and estimate requests usually matter most.')}
    ${linkCards([
      svc(0, 'A Google Business Profile and website pages built for collision, paint, and body repair searches in your area.'),
      svc(1, 'Estimate requests with photo uploads, before-and-after galleries, and a clear insurance explanation.'),
      svc(2, 'Review requests after every repair, prompt replies, and local ads for collision searches.')
    ])}
  </div>
</section>

${faqSection(body)}

${ctaBand({ title: 'Be the shop drivers call first.', text: 'Tell us about your shop and your market. We\'ll follow up with what we\'d fix first.' })}`;

// ---------- Detailers & tire shops ----------
const detail = {
  path: '/industries/detailing-and-tire-shops',
  title: 'Marketing for Auto Detailers and Tire Shops | AuctionDesk',
  description: 'Marketing for auto detailing businesses and tire shops: Google Business Profile, local SEO, booking-ready websites, social media, and seasonal ads.',
  h1: 'Marketing for auto detailers and tire shops',
  crumbs: [['Who We Serve', '/industries'], ['Detailers & Tire Shops', null]],
  faq: [
    { q: 'Do you work with mobile detailers without a storefront?', a: 'Yes. Google Business Profile supports service-area businesses that travel to customers, so you can show up in local results without listing a shop address.' },
    { q: 'Can you run seasonal tire promotions?', a: 'Yes. We plan campaigns ahead of the seasonal rush, like winter tire changeovers, so your ads and posts are live before customers start searching.' },
    { q: 'Should we put prices on our website?', a: 'It depends on your business. Clear package pricing often helps detailers book more, while tire pricing changes too often for some shops. We\'ll talk through what makes sense for you.' },
    { q: 'Do you work with businesses outside Wisconsin?', a: 'Yes. Everything we do for detailers and tire shops is done remotely, for businesses anywhere in the US.' }
  ]
};
detail.body = `${pageHero(detail, {
  iconName: 'sparkle', iconTone: 'green',
  lede: 'Detailing and tire sales both run on local search, good photos, and timing. Customers book a ceramic coating or a set of winter tires when the season turns, and they pick whoever looks best and answers fastest.'
})}

<section aria-labelledby="duo-title">
  <div class="container">
    ${sectionHead('duo-title', 'What matters most', 'Two businesses, a lot of overlap.')}
    <div class="duo">
      <div data-reveal>
        <h3>For detailers</h3>
        <p>Your work sells itself, if people can see it.</p>
        ${checkList(['Before-and-after photos on your profile, site, and social', 'Clear package pages, with pricing if you want it', 'Booking requests from your website and profile', 'Service areas set up properly for mobile detailers'])}
      </div>
      <div data-reveal style="--rd:.1s">
        <h3>For tire shops</h3>
        <p>Demand comes in waves, so timing is everything.</p>
        ${checkList(['Seasonal campaigns live before the rush starts', 'Pages for the brands and services you offer', 'Local search ads for tire and alignment searches', 'Review requests after every install'])}
      </div>
    </div>
  </div>
</section>

<section class="panel" aria-labelledby="fit-title">
  <div class="container">
    ${sectionHead('fit-title', 'Services that fit', 'Most start with their Google Business Profile and social media.')}
    ${linkCards([
      svc(0, 'A complete Google Business Profile with photos, services, and service areas, plus pages that match local searches.'),
      svc(1, 'A fast site with packages, booking requests, and seasonal promotions.'),
      svc(2, 'Seasonal ads, social posts from your real work, and steady review requests.')
    ])}
  </div>
</section>

${faqSection(detail)}

${ctaBand({ title: 'Get ahead of your busy season.', text: 'Tell us about your business and when your rush hits. We\'ll follow up with a plan.' })}`;

export default [overview, dealers, repair, body, detail];
