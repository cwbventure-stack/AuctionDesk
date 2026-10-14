import { icon, SERVICES, INDUSTRIES, pageHero, sectionHead, features, linkCards, checkList, faqSection, ctaBand, serviceNode } from '../site.mjs';

// ---------- Services overview ----------
const overview = {
  path: '/services',
  title: 'Automotive Marketing Services | AuctionDesk',
  description: 'SEO and Google Business Profile, website design, ads, social media, review management, and listing content for automotive businesses. Month-to-month.',
  h1: 'Automotive marketing services',
  crumbs: [['Services', null]],
  priority: '0.9'
};
overview.body = `${pageHero(overview, {
  iconName: 'box', iconTone: 'accent',
  lede: 'Four services, used alone or together, for car dealers, repair shops, body shops, detailers, and tire shops. Every plan is scoped to the problem you\'re trying to solve.'
})}

<section aria-labelledby="list-title">
  <div class="container">
    ${sectionHead('list-title', 'Pick what fits', 'Each service has its own page with what\'s included, who it\'s for, and what we won\'t promise.')}
    ${linkCards([
      { ...SERVICES[0], title: 'SEO & Google Business Profile', text: 'Get found on Google Search and Google Maps when nearby customers look for what you sell or fix.',
        bullets: ['Google Business Profile management', 'On-site SEO and structured data', 'Local listings and citations', 'Monthly plain-English reporting'] },
      { ...SERVICES[1], title: 'Website design', text: 'Fast, mobile-first websites that answer customer questions and make it easy to call, book, or ask about a vehicle.',
        bullets: ['Mobile-first design', 'Service and inventory pages', 'Click-to-call and lead forms', 'SEO built in from the start'] },
      { ...SERVICES[2], title: 'Ads, social & reviews', text: 'Put your business in front of buyers this week, and give them a reason to pick you once they see you.',
        bullets: ['Google and Facebook ads', 'Social media posting', 'Review requests and responses', 'Call and lead tracking'] },
      { ...SERVICES[3], title: 'Listing photos & copy', text: 'Inventory photos and listing descriptions that describe the actual vehicle, not a template.',
        bullets: ['Listing copy from the VIN decode', 'Consistent photo sets', 'Clean lead-photo backgrounds', 'You approve every draft'] }
    ], { cls: 'two', more: 'See the details' })}
  </div>
</section>

<section class="panel" aria-labelledby="unsure-title">
  <div class="container aside-grid">
    <div>
      <h2 id="unsure-title">Not sure where to start?</h2>
      <p class="lede" data-reveal style="--rd:.15s">Most businesses have one bottleneck that matters more than everything else. Fix that first and the rest gets easier. Tell us what's going on and we'll tell you which service fits, or if none of them do.</p>
      ${checkList([
        'Phone not ringing? Usually a Google Business Profile or website problem.',
        'Plenty of traffic but few leads? Usually the website.',
        'Customers pick the competitor? Usually reviews.',
        'Inventory sitting? Usually the listings.'
      ])}
    </div>
    <div class="note-box" data-reveal style="--rd:.15s">
      <div class="ico" aria-hidden="true">${icon('compass', 22)}</div>
      <p><b>Start with one service.</b> You don't need to sign up for everything. Many businesses start with the piece that's hurting most and add more only if it makes sense.</p>
      <p>Everything is month-to-month with 30 days' written notice, and nothing goes live without your approval.</p>
      <p style="margin-top:20px"><a class="text-link" href="/contact">Tell us what's going on ${icon('arrow', 16)}</a></p>
    </div>
  </div>
</section>

${ctaBand()}`;

// ---------- Automotive SEO & Google Business Profile ----------
const seo = {
  path: '/services/automotive-seo',
  title: 'Automotive SEO & Google Business Profile | AuctionDesk',
  description: 'Local SEO for car dealers and auto repair shops: Google Business Profile management, on-site SEO, local citations, and content that helps customers find you.',
  h1: 'Automotive SEO and Google Business Profile management',
  crumbs: [['Services', '/services'], ['SEO & Google Business Profile', null]],
  faq: [
    { q: 'How long does automotive SEO take to work?', a: 'Fixes to your Google Business Profile and website basics can show up within weeks. Ranking for competitive searches usually takes months of steady work. We\'ll tell you what to expect for your market in your scope, and report on progress every month.' },
    { q: 'Do I need a new website for SEO?', a: 'Not always. Many sites can be fixed: better page titles, real service pages, faster load times, and structured data. If your current site truly holds you back, we\'ll explain why and quote a rebuild separately. See <a href="/services/automotive-website-design">website design</a>.' },
    { q: 'What is a Google Business Profile?', a: 'It\'s your free business listing on Google Search and Google Maps: hours, phone number, photos, services, and reviews. For local searches like "auto repair near me," it\'s often what customers see before your website.' },
    { q: 'Can you guarantee a number-one ranking?', a: 'No. Google decides rankings, and anyone who guarantees a top spot is either guessing or using tactics that can get your business penalized. We promise the work, and we report honestly on the results.' },
    { q: 'Do you work with businesses outside Wisconsin?', a: 'Yes. SEO and Google Business Profile work is done remotely for automotive businesses anywhere in the US.' }
  ]
};
seo.schema = [serviceNode(seo, 'Search engine optimization')];
seo.body = `${pageHero(seo, {
  iconName: 'search', iconTone: 'blue',
  lede: 'When someone nearby searches for a used truck, a brake job, or a collision repair, the businesses that show up first get the call. We help dealers and shops show up in Google Search and Google Maps for the searches that matter to them.'
})}

<section aria-labelledby="inc-title">
  <div class="container">
    ${sectionHead('inc-title', 'What\'s included', 'The exact mix depends on where you\'re starting from. These are the pieces we work with.')}
    ${features([
      { icon: 'pin', tone: 'blue', title: 'Google Business Profile', text: 'Accurate categories, services, hours, and photos, plus regular posts and answers to customer questions.' },
      { icon: 'code', tone: 'ink', title: 'On-site SEO', text: 'Page titles, descriptions, headings, internal links, and structured data so Google understands what you do and where.' },
      { icon: 'link', title: 'Local listings and citations', text: 'Your name, address, and phone number consistent across Apple Maps, Bing, Yelp, and industry directories.' },
      { icon: 'layout', tone: 'yellow', title: 'Pages that match searches', text: 'Service and inventory pages written around how customers actually search, like a specific repair or vehicle type in your city.' },
      { icon: 'gauge', title: 'Technical fixes', text: 'Speed, mobile usability, broken links, and indexing problems that quietly keep pages out of search results.' },
      { icon: 'chart', tone: 'green', title: 'Plain-English reporting', text: 'Each month: what changed, what we did, and what\'s next. No vanity dashboards.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="duo-title">
  <div class="container">
    ${sectionHead('duo-title', 'SEO for dealers vs. SEO for shops', 'Same fundamentals, different priorities.')}
    <div class="duo">
      <div data-reveal>
        <h3><a href="/industries/car-dealers">For car dealers</a></h3>
        <p>Your inventory changes every week, so search visibility has to keep up.</p>
        ${checkList(['Inventory and vehicle pages Google can find and index', 'Vehicle structured data on detail pages', 'Pages for the makes, models, and price ranges people search', 'A Google Business Profile that reflects your lot'])}
      </div>
      <div data-reveal style="--rd:.1s">
        <h3><a href="/industries/auto-repair-shops">For repair, body, and service shops</a></h3>
        <p>Most of your customers find you on Google Maps, often on a phone, often in a hurry.</p>
        ${checkList(['A dedicated page for each service you offer', 'Clear service-area coverage for nearby towns', 'Review signals that help you rank in the map results', 'Hours, photos, and services kept accurate'])}
      </div>
    </div>
  </div>
</section>

<section aria-labelledby="wont-title">
  <div class="container aside-grid">
    <div>
      <h2 id="wont-title">What we won't do</h2>
      <p class="lede" data-reveal style="--rd:.15s">Some SEO shortcuts work for a few months and then get a business penalized. We don't use them.</p>
      ${checkList(['No guaranteed rankings. Google decides those.', 'No buying links or joining link schemes.', 'No fake reviews or fake listings.', 'No locking you into our accounts. Your profile stays yours.'])}
    </div>
    <div class="note-box" data-reveal style="--rd:.15s">
      <div class="ico" aria-hidden="true">${icon('star', 22)}</div>
      <p><b>Reviews and SEO go together.</b> Review count and quality affect how you show up on Google Maps. If reviews are your weak spot, see <a href="/services/automotive-advertising">ads, social, and reviews</a>.</p>
      <p>If your website is the bottleneck, see <a href="/services/automotive-website-design">website design</a>.</p>
    </div>
  </div>
</section>

${faqSection(seo, { panel: true })}

${ctaBand({ title: 'Find out what\'s holding your rankings back.', text: 'Tell us your business and market. We\'ll look at your Google Business Profile and website and tell you what we\'d fix first.' })}`;

// ---------- Website design ----------
const web = {
  path: '/services/automotive-website-design',
  title: 'Automotive Website Design for Dealers and Shops | AuctionDesk',
  description: 'Website design for car dealers, auto repair shops, body shops, and detailers. Fast, mobile-first sites built to rank locally and turn visitors into calls.',
  h1: 'Automotive website design for dealers and shops',
  crumbs: [['Services', '/services'], ['Website Design', null]],
  faq: [
    { q: 'Can you improve my current website instead of replacing it?', a: 'Often, yes. Not every site needs a rebuild. We start by looking at what you have, and if fixes will get you most of the way, we\'ll say so.' },
    { q: 'I use a dealer website platform. Can you still help?', a: 'If you\'re on a dealer platform, we can often improve what\'s already there, like page content, SEO settings, and calls to action, rather than replacing it. Tell us which platform you use and we\'ll tell you what\'s possible.' },
    { q: 'Will a new website hurt my Google rankings?', a: 'Not if it\'s done carefully. We map your old pages to the new ones with redirects so you keep the search visibility you\'ve already earned.' },
    { q: 'How long does a new website take?', a: 'It depends on the size of the site and how quickly content and approvals come together. Your written scope includes a timeline before any work starts.' },
    { q: 'Do you write the content too?', a: 'Yes. We write the pages, and you review and approve everything before the site goes live.' }
  ]
};
web.schema = [serviceNode(web, 'Website design')];
web.body = `${pageHero(web, {
  iconName: 'browser', iconTone: 'ink',
  lede: 'Most of your customers see your website on a phone, often while deciding between you and the business down the street. We build fast, clear sites that answer their questions and make it easy to call, book, or ask about a vehicle.'
})}

<section aria-labelledby="inc-title">
  <div class="container">
    ${sectionHead('inc-title', 'What\'s included', 'Built for how automotive customers actually use a website.')}
    ${features([
      { icon: 'phone', tone: 'blue', title: 'Mobile-first design', text: 'Designed for phones first, with tap-to-call, directions, and hours where customers expect them.' },
      { icon: 'gauge', tone: 'ink', title: 'Fast load times', text: 'Lean pages that load quickly on a cell connection. Slow sites lose customers and rankings.' },
      { icon: 'target', title: 'Clear calls to action', text: 'Quote requests, appointment requests, and vehicle inquiries that are easy to find and simple to fill out.' },
      { icon: 'search', tone: 'yellow', title: 'SEO built in', text: 'Page titles, structure, structured data, and a sitemap set up properly from day one.' },
      { icon: 'layout', title: 'Service and inventory pages', text: 'A page for each service a shop offers. For dealers, inventory pages that connect to your existing inventory provider where it supports it.' },
      { icon: 'pencil', tone: 'green', title: 'Content written for you', text: 'We write the pages in plain language your customers understand. You approve everything before launch.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="who-title">
  <div class="container">
    ${sectionHead('who-title', 'Built around your kind of business', 'A dealer site and a repair shop site have different jobs.')}
    ${linkCards(INDUSTRIES.map(i => ({ ...i, text: {
      '/industries/car-dealers': 'Inventory front and center, with vehicle inquiries and trade-in questions one tap away.',
      '/industries/auto-repair-shops': 'A page for every service, appointment requests, and hours and directions that are always accurate.',
      '/industries/auto-body-shops': 'Estimate requests, before-and-after photos, and a clear explanation of how you work with insurance.',
      '/industries/detailing-and-tire-shops': 'Packages, pricing pages if you want them, booking requests, and seasonal promotions.'
    }[i.href] })), { more: 'See how we help' })}
  </div>
</section>

${faqSection(web)}

${ctaBand({ title: 'Is your website costing you calls?', text: 'Send us your URL. We\'ll tell you honestly whether it needs fixes or a rebuild, and what we\'d do first.' })}`;

// ---------- Ads, social & reviews ----------
const ads = {
  path: '/services/automotive-advertising',
  title: 'Automotive Ads, Social Media & Reviews | AuctionDesk',
  description: 'Google Ads, Facebook and Instagram ads, social media posting, and review management for car dealers and auto shops, with call and lead tracking.',
  h1: 'Automotive advertising, social media, and review management',
  crumbs: [['Services', '/services'], ['Ads, Social & Reviews', null]],
  faq: [
    { q: 'How much should I spend on ads?', a: 'It depends on your market, your competition, and what you\'re promoting. Your scope includes a recommended starting budget, and we adjust it based on what the tracking shows.' },
    { q: 'Who pays for the ad spend?', a: 'Ad spend is typically billed to you directly by Google or Meta, separate from our fee, and the ad accounts stay in your business\'s name. We\'ll confirm the setup in your scope.' },
    { q: 'Can you remove bad reviews?', a: 'No one can remove a legitimate review. If a review breaks Google\'s policies, like spam or a conflict of interest, we can help you flag it. For everything else, a calm, professional reply usually does more for you than the review itself does damage.' },
    { q: 'Can you post our inventory on Facebook Marketplace?', a: 'We don\'t use workarounds to post dealer inventory on Facebook Marketplace. They break Meta\'s rules and can get your accounts restricted. We use Facebook and Instagram ads to reach local shoppers instead.' },
    { q: 'Do you post on social media for us?', a: 'Yes. We plan and publish posts using real photos from your business, and you approve the content before it goes out.' }
  ]
};
ads.schema = [serviceNode(ads, 'Online advertising and reputation management')];
ads.body = `${pageHero(ads, {
  iconName: 'megaphone', iconTone: 'yellow',
  lede: 'SEO takes time. Ads can put you in front of buyers and customers this week, and reviews decide whether they pick you once they see you. We run both, with tracking set up so you can see what\'s working.'
})}

<section aria-labelledby="inc-title">
  <div class="container">
    ${sectionHead('inc-title', 'What\'s included', 'Use one piece or all of them.')}
    ${features([
      { icon: 'search', tone: 'blue', title: 'Google Ads', text: 'Search ads for high-intent searches like a specific repair near you or a vehicle type in your area.' },
      { icon: 'users', tone: 'ink', title: 'Facebook and Instagram ads', text: 'Local ads for inventory, service specials, and seasonal promotions, aimed at people near your business.' },
      { icon: 'chat', title: 'Social media posting', text: 'Consistent posts built from real photos of your business, your work, and your inventory.' },
      { icon: 'star', tone: 'yellow', title: 'Review requests', text: 'A simple, consistent way to ask every customer for a Google review, the way Google\'s rules allow.' },
      { icon: 'pencil', title: 'Review responses', text: 'Prompt, professional replies to every review, good or bad, written in your voice.' },
      { icon: 'target', tone: 'green', title: 'Call and lead tracking', text: 'See which ads produce calls and form leads, so budget goes to what works.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="rules-title">
  <div class="container aside-grid">
    <div>
      <h2 id="rules-title">Ground rules</h2>
      <p class="lede" data-reveal style="--rd:.15s">Reviews and ads are where shortcuts are most tempting and most likely to backfire.</p>
      ${checkList([
        'We never buy reviews, write fake ones, or offer customers rewards for reviewing.',
        'We don\'t filter who gets asked. Every customer gets the same request.',
        'No Facebook Marketplace workarounds for dealer inventory.',
        'Ad copy and social posts go live only after you approve them.'
      ])}
    </div>
    <div class="note-box" data-reveal style="--rd:.15s">
      <div class="ico" aria-hidden="true">${icon('search', 22)}</div>
      <p><b>Ads work better with a solid foundation.</b> If your Google Business Profile or website is weak, ad clicks turn into fewer calls. We'll tell you if that's the case.</p>
      <p>See <a href="/services/automotive-seo">SEO and Google Business Profile</a> and <a href="/services/automotive-website-design">website design</a>.</p>
    </div>
  </div>
</section>

${faqSection(ads)}

${ctaBand({ title: 'Want more calls this month?', text: 'Tell us what you want to promote and where your customers are. We\'ll recommend a starting budget and a plan.' })}`;

// ---------- Listing photos & copy ----------
const listings = {
  path: '/services/vehicle-listing-content',
  title: 'Vehicle Photography & Listing Copy for Dealers | AuctionDesk',
  description: 'Dealer inventory photos and listing descriptions written from the VIN decode and what\'s actually on the car. Copy nationwide, on-site photos in Wisconsin.',
  h1: 'Vehicle photography and listing copy for dealers',
  crumbs: [['Services', '/services'], ['Listing Photos & Copy', null]],
  faq: [
    { q: 'Do you need to visit my lot?', a: 'Only for photography. Listing copy is written remotely from your VIN, photos, and notes, for dealers anywhere in the US. On-site photography is available in Wisconsin.' },
    { q: 'Who approves the listings?', a: 'You do, every time. Each listing is delivered as a draft, and nothing is published until you\'ve read it and signed off.' },
    { q: 'What do you need from us?', a: 'For copy: the VINs, your photos, and any notes on condition or recent work. For on-site photography: vehicles washed and ready, and access to the lot on the scheduled day.' },
    { q: 'Can you upload listings to our inventory system?', a: 'Tell us which inventory system or website platform you use, and we\'ll confirm whether we can upload directly before we start.' }
  ]
};
listings.schema = [serviceNode(listings, 'Vehicle photography and listing copywriting')];
listings.body = `${pageHero(listings, {
  iconName: 'camera', iconTone: 'green',
  lede: 'Most listings are the same three sentences with the trim level swapped out. A buyer scrolling past forty of them can\'t tell your car apart from the one two rows down. We write from a VIN decode and what\'s actually on the vehicle, so the listing describes the car in front of you.'
})}

<section aria-labelledby="inc-title">
  <div class="container">
    ${sectionHead('inc-title', 'What\'s included', 'Copy is done remotely, nationwide. Photography is on-site in Wisconsin.')}
    ${features([
      { icon: 'pencil', tone: 'blue', title: 'Listing copy', text: 'Written from the VIN decode plus the options and features actually on the vehicle, not the trim\'s spec sheet.' },
      { icon: 'file', title: 'Condition notes', text: 'Wear, damage, and recent work called out plainly, so buyers trust the rest of the listing.' },
      { icon: 'camera', tone: 'ink', title: 'Consistent photo sets', text: '30 to 40 images in a fixed angle sequence: exterior, interior, dash with odometer, engine bay, trunk, and any damage.' },
      { icon: 'image', tone: 'yellow', title: 'Clean lead photos', text: 'The first photo gets a clean background so the vehicle stands out in search results.' },
      { icon: 'eye', title: 'Draft approval', text: 'Every listing comes to you as a draft. Nothing publishes until you sign off.' },
      { icon: 'upload', tone: 'green', title: 'Upload', text: 'Loaded into your inventory system or website where your platform allows it.' }
    ])}
  </div>
</section>

<section class="panel" aria-labelledby="duo-title">
  <div class="container">
    ${sectionHead('duo-title', 'Remote or on-site', 'Pick what fits your lot.')}
    <div class="duo">
      <div data-reveal>
        <h3>Remote, anywhere in the US</h3>
        <p>For dealers who already take their own photos.</p>
        ${checkList(['Listing copy from your VINs, photos, and notes', 'Lead-photo cleanup', 'Condition notes and feature callouts', 'Drafts delivered for your approval'])}
      </div>
      <div data-reveal style="--rd:.1s">
        <h3>On-site, in Wisconsin</h3>
        <p>For dealers who want the whole job handled on the lot.</p>
        ${checkList(['Full photo sets shot on your lot', 'Everything in the remote service', 'Scheduled visits that fit your inventory flow', 'Vehicles just need to be washed and ready'])}
      </div>
    </div>
  </div>
</section>

<section aria-labelledby="wont-title">
  <div class="container">
    <div class="not-included" style="margin-top:0">
      <h3 id="wont-title">Not included</h3>
      <ul>
        <li><b>Reconditioning, detailing, or mechanical work.</b> Vehicles need to be clean before photos.</li>
        <li><b>Pricing or appraisal advice.</b> That's your call.</li>
        <li><b>Certifying a vehicle's condition.</b> We describe what we see; you verify and approve it.</li>
        <li><b>Facebook Marketplace workarounds.</b> They break Meta's rules and risk your account.</li>
      </ul>
    </div>
  </div>
</section>

${faqSection(listings, { panel: true })}

${ctaBand({ title: 'Make your listings worth clicking.', text: 'Send us a few VINs. We\'ll show you what a listing written from the actual vehicle looks like.' })}`;

export default [overview, seo, web, ads, listings];
