// AuctionDesk shared script. Every page loads this one file.

// ---------- Header: mobile menu, dropdowns, scroll shadow ----------
const header = document.getElementById('header');
const toggle = document.getElementById('navToggle');
const menuBtns = [...document.querySelectorAll('.menu-btn')];

function setNav(open) {
  header.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
function closeMenus(except) {
  menuBtns.forEach(b => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
}
toggle.addEventListener('click', () => setNav(!header.classList.contains('nav-open')));
menuBtns.forEach(btn => btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  closeMenus(btn);
  btn.setAttribute('aria-expanded', String(open));
}));
document.addEventListener('click', e => { if (!e.target.closest('.has-menu')) closeMenus(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const openBtn = menuBtns.find(b => b.getAttribute('aria-expanded') === 'true');
  if (openBtn) { closeMenus(); openBtn.focus(); }
  else if (header.classList.contains('nav-open')) { setNav(false); toggle.focus(); }
});
const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Scroll-in motion ----------
// Everything is visible by default; this only hides things until they enter
// the viewport, and skips straight to the end state for reduced-motion users.
document.querySelectorAll('.blur-in').forEach(h => {
  const words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.style.setProperty('--i', i);
    s.textContent = w;
    h.append(s, ' ');
  });
  h.classList.add('split');
});
document.querySelectorAll('[data-stagger],[data-i]').forEach(p => {
  [...p.children].forEach((c, i) => c.style.setProperty('--i', i));
});
const revealables = document.querySelectorAll('[data-reveal],[data-stagger],.blur-in,.wordmark');
if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
  revealables.forEach(el => el.classList.add('in'));
} else {
  const onEnter = (entries, obs) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  });
  const io = new IntersectionObserver(onEnter, { rootMargin: '0px 0px -8% 0px' });
  // The wordmark is the last thing on the page, so the page can't scroll far
  // enough for it to clear the -8% margin above. Watch it with no margin.
  const ioBottom = new IntersectionObserver(onEnter);
  revealables.forEach(el => (el.classList.contains('wordmark') ? ioBottom : io).observe(el));
}

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.closest('.faq-item').classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
});

// ---------- Contact form (home and contact pages) ----------
// Submissions go to the AuctionDesk Formspree form, which emails them to us.
const CONTACT_ENDPOINT = 'https://formspree.io/f/xgaopale';

const form = document.getElementById('contactForm');
if (form) {
  const validators = {
    'f-business': v => v.trim().length > 0,
    'f-name': v => v.trim().length > 0,
    'f-email': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  };
  const validateField = el => {
    const ok = validators[el.id](el.value);
    el.closest('.field').classList.toggle('invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => { if (el.value !== '') validateField(el); });
    el.addEventListener('input', () => {
      if (el.closest('.field').classList.contains('invalid')) validateField(el);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let firstBad = null;
    Object.keys(validators).forEach(id => {
      const el = document.getElementById(id);
      if (!validateField(el) && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }

    const errorBanner = document.getElementById('formErrorBanner');
    errorBanner.classList.remove('show');
    const btn = document.getElementById('contactSubmit');
    const label = btn.querySelector('.btn-label');
    const originalLabel = label.textContent;
    btn.disabled = true;
    label.textContent = 'Sending…';

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error('submit failed');
      if (window.gtag) gtag('event', 'generate_lead', { form_location: location.pathname });
      form.style.display = 'none';
      const s = document.getElementById('formSuccess');
      s.classList.add('show');
      s.focus();
    } catch {
      errorBanner.classList.add('show');
      btn.disabled = false;
      label.textContent = originalLabel;
    }
  });
}
