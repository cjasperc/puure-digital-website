/* ============================================================
   PUURE DIGITAL — Homepage JS
   Hero animation sequence + particles + general scroll reveals
============================================================ */

// ============================================================
//  UTILITY
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const delay = ms => new Promise(r => setTimeout(r, ms));

// ============================================================
//  NAV — scroll class + hamburger
// ============================================================
const nav = $('#nav');

// Nav scroll state is handled via Lenis in boot (see initLenis)

const burger    = $('#navBurger');
const mobileNav = $('#navMobile');

function openMenu() {
  nav.classList.add('nav--open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  nav.classList.remove('nav--open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  nav.classList.contains('nav--open') ? closeMenu() : openMenu();
});

// Close when a mobile nav link is tapped
$$('.nav__mobile a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ============================================================
//  HEADLINE WORD SPLITTER
//  Walks child nodes, wraps each word in .word-wrap > .word
//  Preserves <br>, <em>, and other elements
// ============================================================
function splitHeadlineWords(el) {
  const fragment = document.createDocumentFragment();
  const SPACE = /^\s+$/;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach(part => {
        if (!part) return;
        if (SPACE.test(part)) {
          // Preserve whitespace as a text node
          fragment.appendChild(document.createTextNode(part));
        } else {
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          const inner = document.createElement('span');
          inner.className = 'word';
          inner.textContent = part;
          wrap.appendChild(inner);
          fragment.appendChild(wrap);
        }
      });
    } else if (node.nodeName === 'BR') {
      fragment.appendChild(document.createElement('br'));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList && node.classList.contains('hero__typewriter')) {
        // Typewriter span — append directly, no word-wrap clip
        fragment.appendChild(node.cloneNode(true));
      } else {
        // Treat entire inline element (em, strong, etc.) as one word unit
        const wrap = document.createElement('span');
        wrap.className = 'word-wrap';
        const inner = document.createElement('span');
        inner.className = 'word';
        inner.appendChild(node.cloneNode(true));
        wrap.appendChild(inner);
        fragment.appendChild(wrap);
      }
    }
  }

  [...el.childNodes].forEach(processNode);
  el.innerHTML = '';
  el.appendChild(fragment);

  return $$('.word', el);
}

// ============================================================
//  PARTICLE GENERATOR
//  22 particles, randomised size / speed / opacity / drift
// ============================================================
function createParticles(container) {
  // Reduce on mobile, skip on very small screens or low-power preference
  const isMobile = window.innerWidth < 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const COUNT = isMobile ? 8 : 22;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size    = (Math.random() * 3 + 1.2).toFixed(1);          // 1.2–4.2 px
    const x       = (Math.random() * 98 + 1).toFixed(1);           // 1–99 %
    const bottom  = (Math.random() * 40).toFixed(1);                // 0–40 % start height
    const dur     = (Math.random() * 14 + 9).toFixed(1);            // 9–23 s
    const del     = (Math.random() * 12).toFixed(1);                // 0–12 s start delay
    const op      = (Math.random() * 0.32 + 0.07).toFixed(2);      // 0.07–0.39
    const dx      = ((Math.random() - 0.5) * 80).toFixed(0);       // -40–40 px horizontal drift

    // Alternate between white and teal particles
    const isWhite = Math.random() > 0.35;
    const color   = isWhite
      ? `rgba(255,255,255,${op})`
      : `rgba(23,85,84,${(parseFloat(op) * 1.8).toFixed(2)})`;

    p.style.cssText = `
      left: ${x}%;
      bottom: ${bottom}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      --dur: ${dur}s;
      --del: ${del}s;
      --op: ${op};
      --dx: ${dx}px;
    `;
    container.appendChild(p);
  }
}

// ============================================================
//  HERO ANIMATION SEQUENCE
// ============================================================
async function runHeroSequence(words) {
  const eyebrow  = $('#heroEyebrow');
  const sub      = $('#heroSub');
  const ctas     = $('#heroCtas');
  const stats    = $('#heroStats');

  // [1] Eyebrow — 150ms
  await delay(150);
  eyebrow.classList.add('anim-in');

  // [2] Headline words — start 820ms, stagger 88ms
  await delay(320);
  const STAGGER = 88;
  words.forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('revealed');
    }, i * STAGGER);
  });

  // [3] Wait for last word to finish staggering, then start typewriter
  await delay(words.length * STAGGER + 100);
  initTypewriter(); // headline is fully visible — now fade in & start typing

  // [4] Sub + CTAs shortly after
  await delay(300);
  sub.classList.add('anim-in');
  await delay(160);
  ctas.classList.add('anim-in');

}

// ============================================================
//  HERO TYPEWRITER — cycles through keyword variations
// ============================================================
function initTypewriter() {
  const el = document.getElementById('heroTypewriter');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'customers.';
    return;
  }

  const words   = ['customers.', 'leads.', 'revenue.', 'clients.', 'growth.'];
  let   wIdx    = 0;
  let   cIdx    = 0;
  let   deleting = false;

  const TYPE_MS   = 85;
  const DEL_MS    = 45;
  const PAUSE_END = 1800; // hold after fully typed
  const PAUSE_NEW = 320;  // pause before typing next word

  function tick() {
    const word = words[wIdx];
    if (!deleting) {
      cIdx++;
      el.textContent = word.slice(0, cIdx);
      if (cIdx === word.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
      } else {
        setTimeout(tick, TYPE_MS);
      }
    } else {
      cIdx--;
      el.textContent = word.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
        setTimeout(tick, PAUSE_NEW);
      } else {
        setTimeout(tick, DEL_MS);
      }
    }
  }

  // Fade the element in, then start typing
  el.style.opacity = '1';
  tick();
}

// ============================================================
//  HERO STORY — 3-slide coverflow carousel
// ============================================================
function initHeroStory() {
  const story    = document.getElementById('heroStory');
  const carousel = document.getElementById('storyCarousel');
  if (!story || !carousel) return;

  const slides  = [...carousel.querySelectorAll('.story__slide')];
  const LOOP_END = 45;

  // ---- Progress bar tracking ----
  // Attach a timeupdate handler to whichever video is in center slot
  function trackSlide(slide) {
    const video = slide.querySelector('.story__video');
    const bar   = slide.querySelector('.story__progress-fill');
    if (!video || !bar) return;
    function onTime() {
      const t = video.currentTime;
      bar.style.width = (Math.min(t, LOOP_END) / LOOP_END * 100) + '%';
      if (t >= LOOP_END) { video.currentTime = 0; video.play(); }
    }
    video._tracker = onTime;
    video.addEventListener('timeupdate', onTime);
    video.play().catch(() => {});
  }

  function untrackSlide(slide) {
    const video = slide.querySelector('.story__video');
    if (video && video._tracker) {
      video.removeEventListener('timeupdate', video._tracker);
      video._tracker = null;
      // reset bar
      const bar = slide.querySelector('.story__progress-fill');
      if (bar) bar.style.width = '0%';
    }
  }

  // ---- Rotation ----
  // next: right → center → left → right
  // prev: left  → center → right → left
  function rotate(dir) {
    const next = dir === 1
      ? { center: 'left', right: 'center', left: 'right' }
      : { center: 'right', left: 'center', right: 'left' };

    // Compute new slots before mutating
    const newSlots = slides.map(s => next[s.dataset.slot]);

    // Untrack outgoing center
    slides.forEach((s, i) => {
      if (s.dataset.slot === 'center') untrackSlide(s);
    });

    // Apply new slots
    slides.forEach((s, i) => { s.dataset.slot = newSlots[i]; });

    // Track + play new center
    slides.forEach(s => {
      if (s.dataset.slot === 'center') trackSlide(s);
    });
  }

  // Clicking a side slide brings it to center
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      if (slide.dataset.slot === 'left')  rotate(-1);
      if (slide.dataset.slot === 'right') rotate(1);
    });
  });

  // ---- Auto-advance every 3s, pause on hover ----
  let autoTimer = null;
  let paused = false;

  function startAuto(initialDelay = 3000) {
    clearInterval(autoTimer);
    autoTimer = setTimeout(() => {
      if (!paused) rotate(1);
      autoTimer = setInterval(() => {
        if (!paused) rotate(1);
      }, 3000);
    }, initialDelay);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    clearTimeout(autoTimer);
    startAuto(3000);
  }

  const prevBtn = document.getElementById('storyPrev');
  const nextBtn = document.getElementById('storyNext');

  prevBtn?.addEventListener('click', () => { rotate(-1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { rotate(1);  resetAuto(); });

  // Pause while hovering over carousel or nav buttons
  story.addEventListener('mouseenter', () => { paused = true; });
  story.addEventListener('mouseleave', () => { paused = false; });

  startAuto(5000);

  // Start tracking the initial center slide
  slides.forEach(s => { if (s.dataset.slot === 'center') trackSlide(s); });

  // ---- GSAP entrance pop-in ----
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    story.style.opacity = '1';
    story.style.transform = 'none';
    return;
  }

  setTimeout(() => {
    if (typeof gsap !== 'undefined') {
      gsap.to(story, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.4)' });
    } else {
      story.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.34,1.56,0.64,1)';
      story.style.opacity = '1';
      story.style.transform = 'none';
    }
  }, 2400);
}

// ============================================================
//  HERO CANVAS — abstract drifting network field
// ============================================================
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animId;
  let mouseX = -9999, mouseY = -9999;
  const COUNT = 32;
  const CONNECT_DIST = 140;
  const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    return {
      x:      W * 0.35 + Math.random() * W * 0.7,
      y:      Math.random() * H,
      vx:     (Math.random() - 0.5) * 0.22,
      vy:     (Math.random() - 0.5) * 0.22,
      r:      Math.random() * 1.6 + 0.5,
      op:     Math.random() * 0.18 + 0.04,
      isTeal: Math.random() < 0.22,
    };
  }

  let canvasVisible = true;
  const visObs = new IntersectionObserver(entries => {
    canvasVisible = entries[0].isIntersecting;
    if (canvasVisible && !animId) tick();
  }, { threshold: 0 });
  visObs.observe(canvas);

  function tick() {
    if (!canvasVisible) { animId = null; return; }
    ctx.clearRect(0, 0, W, H);

    // Batch all connections into one path per opacity bucket — single stroke call
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx  = nodes[i].x - nodes[j].x;
        const dy  = nodes[i].y - nodes[j].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < CONNECT_DIST_SQ) {
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
        }
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.stroke();

    // Nodes — update physics + draw
    const REPEL_SQ = 110 * 110;
    nodes.forEach(n => {
      // Mouse repel — squared distance, sqrt only when inside range
      const mdx = n.x - mouseX, mdy = n.y - mouseY;
      const mdSq = mdx * mdx + mdy * mdy;
      if (mdSq < REPEL_SQ && mdSq > 0) {
        const md = Math.sqrt(mdSq);
        const f  = (110 - md) / 110 * 0.009;
        n.vx += (mdx / md) * f;
        n.vy += (mdy / md) * f;
      }

      n.vx *= 0.985; n.vy *= 0.985;
      n.x  += n.vx;  n.y  += n.vy;

      if (n.x > W + 20) n.x = -20;
      if (n.x < -20)    n.x = W + 20;
      if (n.y > H + 20) n.y = -20;
      if (n.y < -20)    n.y = H + 20;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.isTeal
        ? `rgba(23,166,163,${n.op * 1.4})`
        : `rgba(255,255,255,${n.op})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(tick);
  }

  // Track mouse — throttled via rAF
  const hero = canvas.closest('.hero');
  if (hero) {
    let mousePending = false;
    hero.addEventListener('mousemove', e => {
      if (mousePending) return;
      mousePending = true;
      requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mousePending = false;
      });
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });
  }

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      resize();
      nodes = Array.from({ length: COUNT }, makeNode);
      tick();
    }, 150);
  }, { passive: true });

  resize();
  nodes = Array.from({ length: COUNT }, makeNode);

  // Fade the canvas in after the hero sequence starts
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 2.5, delay: 1.0, ease: 'power2.inOut' });

  tick();
}

// ============================================================
//  HERO SCROLL PARALLAX
// ============================================================
function initHeroScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Content drifts up as user scrolls out of hero
  gsap.to('.hero__content', {
    y: -55,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '60% top',
      scrub: 0.8,
    }
  });

  // Canvas fades to black as hero exits viewport
  gsap.to('#heroCanvas', {
    opacity: 0,
    overwrite: 'auto',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: '10% top',
      end: '65% top',
      scrub: 0.5,
    }
  });
}

// ============================================================
//  PROBLEM SECTION — premium scroll animation
// ============================================================
// ============================================================
//  PROBLEM JOURNEY — scroll-driven editorial sequence
//  Fragment → alignment metaphor via GSAP + ScrollTrigger scrub
// ============================================================
function initProblemSection() {
  const section = document.getElementById('problem');
  if (!section) return;

  const stack = section.querySelector('.pb__stack');
  if (!stack) return;

  // Section reveal on enter
  const revealObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      section.classList.add('pb--revealed');
      revealObs.disconnect();
    }
  }, { threshold: 0.1 });
  revealObs.observe(section);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.classList.add('pb--revealed');
    return;
  }

  const cards    = [...stack.querySelectorAll('.pb__card')];
  // Must match CSS nth-child top values
  const CARD_TOPS = [108, 136, 164];

  function updateStack() {
    const vh = window.innerHeight;

    cards.forEach((card, i) => {
      // Sum how much subsequent cards have slid on top of this one
      let buried = 0;
      for (let j = i + 1; j < cards.length; j++) {
        const nextTop = cards[j].getBoundingClientRect().top;
        const stickyTop = CARD_TOPS[j] ?? CARD_TOPS[CARD_TOPS.length - 1];
        // 0 = next card just entering from below; 1 = fully stacked at sticky position
        const progress = Math.max(0, Math.min(1, (vh - nextTop) / (vh - stickyTop)));
        buried += progress;
      }

      const scale = Math.max(0.88, 1 - buried * 0.04);
      card.style.transform = `scale(${scale.toFixed(4)})`;
    });
  }

  window.addEventListener('scroll', updateStack, { passive: true });
  updateStack();
}

// ============================================================
//  SYSTEM SECTION — signal animation through connectors
// ============================================================
function initSystemSection() {
  const section = document.querySelector('.system');
  const stack   = $('#systemGrid');
  if (!stack || !section) return;

  const cards = $$('.system__card', stack);
  const dots  = $$('.system__dot');
  if (!cards.length) return;

  const slots = {
    center: { x: 0,    z: 0,    rotateY: 0,   scale: 1,    opacity: 1    },
    left:   { x: -310, z: -160, rotateY: 38,  scale: 0.82, opacity: 0.55 },
    right:  { x: 310,  z: -160, rotateY: -38, scale: 0.82, opacity: 0.55 },
  };

  const layout = [
    ['center', 'right', 'left'],
    ['left',   'center', 'right'],
    ['right',  'left',  'center'],
  ];

  let currentIdx = -1;

  function place(card, slot, animate) {
    const s = slots[slot];
    const isCenter = slot === 'center';
    const props = { x: s.x, z: s.z, rotateY: s.rotateY, scale: s.scale, opacity: isCenter ? 1 : s.opacity, zIndex: isCenter ? 10 : 1 };
    if (animate) gsap.to(card,  { ...props, duration: 0.65, ease: 'power3.out', overwrite: true });
    else         gsap.set(card, props);
    card.classList.toggle('system__card--active', isCenter);
  }

  function activate(idx, animate) {
    if (idx === currentIdx) return;
    currentIdx = idx;
    layout[idx].forEach((slot, i) => place(cards[i], slot, animate));
    dots.forEach((d, i) => d.classList.toggle('system__dot--active', i === idx));
  }

  // Set initial slot positions silently, fully hidden
  cards.forEach((c, i) => { gsap.set(c, { ...slots[layout[0][i]], opacity: 0 }); c.classList.toggle('system__card--active', layout[0][i] === 'center'); });
  currentIdx = 0;

  // Fade in once section enters view
  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    onEnter: () => {
      cards.forEach((c, i) => {
        gsap.to(c, { opacity: slots[layout[0][i]].opacity === 1 ? 1 : 0.55, duration: 0.7, delay: i * 0.1, ease: 'power3.out' });
      });
      cards[0].style.opacity = 1; // ensure center card is full opacity
    },
    once: true,
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Pin + scroll-drive rotation
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${window.innerHeight * 1.4}`,
    pin: true,
    scrub: 0.5,
    onUpdate: self => {
      const p = self.progress;
      if (p < 0.33)      activate(0, true);
      else if (p < 0.66) activate(1, true);
      else               activate(2, true);
    },
  });
}

// ============================================================
//  PROCESS SECTION — column reveals
// ============================================================
function initProcessSection() {
  const colsWrap = document.querySelector('.process__cols');
  const cols     = $$('.process__col');
  const line     = $('#processLine');
  if (!colsWrap || !cols.length) return;

  gsap.set(cols, { opacity: 0, y: 32 });

  ScrollTrigger.create({
    trigger: colsWrap,
    start: 'top 75%',
    onEnter: () => {
      gsap.to(cols, { opacity: 1, y: 0, duration: 0.7, stagger: 0.14, ease: 'power3.out' });
      if (line) gsap.to(line, { scaleX: 1, duration: 1.1, delay: 0.5, ease: 'power3.inOut' });
      setTimeout(() => colsWrap.classList.add('animated'), 100);
    },
    once: true,
  });
}

// ============================================================
//  RESULTS — stat accent lines + card reveals
// ============================================================
function initResultsSection() {
  const stats = $$('.results__stat');
  const cards = $$('.result__card');
  if (!stats.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Stat numbers scale in
  gsap.set(stats, { opacity: 0, y: 24 });
  ScrollTrigger.create({
    trigger: '.results__stats',
    start: 'top 80%',
    onEnter: () => {
      gsap.to(stats, {
        opacity: 1, y: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        onComplete: () => stats.forEach(s => s.classList.add('in-view')),
      });
    },
    once: true,
  });

  // Case cards
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 28 });
    ScrollTrigger.create({
      trigger: '.results__cases',
      start: 'top 82%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1, y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  }
}

// ============================================================
//  CTA + FOOTER — ambient reveal triggers
// ============================================================
function initCtaFooter() {
  // CTA accent line
  const ctaLine = $('.cta__line');
  if (ctaLine) {
    ScrollTrigger.create({
      trigger: '.cta',
      start: 'top 75%',
      onEnter: () => ctaLine.classList.add('in-view'),
      once: true,
    });
  }

  // Footer animated divider
  const footer = $('.footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 95%',
      onEnter: () => footer.classList.add('in-view'),
      once: true,
    });
  }
}

// ============================================================
//  FAQ ACCORDION
// ============================================================
function initFAQ() {
  $$('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      $$('.faq__q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq__item').querySelector('.faq__a').classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.closest('.faq__item').querySelector('.faq__a').classList.add('open');
      }
    });
  });
}

// ============================================================
//  SCROLL-TRIGGERED FADE-UPS (non-hero elements)
// ============================================================
function initScrollFades() {
  // Hero elements are animated by sequence — exclude them
  const HERO_IDS = new Set(['heroEyebrow', 'heroH1', 'heroSub', 'heroCtas', 'heroStats', 'problemH2']);

  const SELECTORS = [
    '.section-label', '.section-h2', '.section-sub',
    '.trust__pills',
    '.service__card',
    '.faq__item',
    '.cta__h2', '.cta__sub',
    '.instagram__header',
    '.ai-feat__copy', '.ai-feat__media',
    '.svc__list', '.cta',
  ].join(', ');

  const els = $$(SELECTORS).filter(el => !HERO_IDS.has(el.id));
  els.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in', 'in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

  els.forEach(el => io.observe(el));

  // Stagger ai-feat columns
  const aiFeatMedia = document.querySelector('.ai-feat__media');
  if (aiFeatMedia) aiFeatMedia.style.transitionDelay = '120ms';


  // Stagger children inside grid parents
  [
    '.services__grid',
    '.faq__list',
  ].forEach(sel => {
    const grid = $(sel);
    if (!grid) return;
    $$('.fade-up', grid).forEach((el, i) => {
      el.style.transitionDelay = `${i * 65}ms`;
    });
  });
}

// ============================================================
//  LOGO MARQUEE — keep infinite even after tab switch
// ============================================================
function initMarquee() {
  const track = document.querySelector('.clients__track');
  if (!track) return;

  // Resume if browser paused the animation on tab hide
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      track.style.animationPlayState = 'running';
    }
  });
}

// ============================================================
//  TRACING BEAM — full-page left-side scroll indicator
// ============================================================
function initTracingBeam() {
  if (window.innerWidth <= 1100) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svg  = document.getElementById('traceBeamSvg');
  const fill = document.getElementById('traceBeamFill');
  const dot  = document.getElementById('traceBeamDot');
  if (!svg || !fill || !dot) return;

  // Inject gradient def into SVG
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="traceGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#1eb5a8" stop-opacity="0"/>
      <stop offset="60%"  stop-color="#1eb5a8" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#1eb5a8" stop-opacity="1"/>
    </linearGradient>`;
  svg.prepend(defs);

  let ticking = false;

  function update() {
    ticking = false;
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const progress = Math.min(scrolled / maxScroll, 1);
    const h = svg.getBoundingClientRect().height;
    const y = progress * h;

    fill.setAttribute('y2', y);
    dot.setAttribute('cy', y);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
}

// ============================================================
//  BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // 0. Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // 1. Lenis smooth scroll
  const lenis = new Lenis({
    lerp:            0.1,       // 1.1.x API — interpolation factor (0.1 = smooth)
    smoothWheel:     true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.5,
    infinite:        false,
  });
  // Sync Lenis raf with GSAP ticker for ScrollTrigger compatibility
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
  let lastScrollY = 0;
  let menuOpenedAt = 0;
  const isMobile = () => window.innerWidth < 768;
  const _origOpen = openMenu;
  openMenu = function() { _origOpen(); menuOpenedAt = Date.now(); };

  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 10);
    // Only close menu on scroll if it wasn't just opened (prevents tap+inertia race)
    if (nav.classList.contains('nav--open') && Date.now() - menuOpenedAt > 400) closeMenu();

    // Auto-hide nav on scroll down, reveal on scroll up (mobile only)
    if (isMobile()) {
      const delta = scroll - lastScrollY;
      if (Math.abs(delta) > 4) {
        if (delta > 0 && scroll > 120) {
          nav.classList.add('nav--hidden');
        } else {
          nav.classList.remove('nav--hidden');
        }
      }
      lastScrollY = scroll;
    } else {
      nav.classList.remove('nav--hidden');
    }
  });

  // 2. Split headline + hero sequence
  const h1    = $('#heroH1');
  const words = splitHeadlineWords(h1);
  const particleContainer = $('#heroParticles');
  if (particleContainer) createParticles(particleContainer);
  runHeroSequence(words);

  // 3. Hero canvas + scroll parallax + story card
  initHeroCanvas();
  initHeroScroll();
  initHeroStory();

  // 4. FAQ
  initFAQ();

  // 5. Scroll fades
  initScrollFades();

  // 6. Marquee infinite guard
  initMarquee();

  // 7. Problem section premium animation
  initProblemSection();

  // 8. System section signal animation
  initSystemSection();

  // 9. Process section spine + steps
  initProcessSection();

  // 10. Results section
  initResultsSection();

  // 11. CTA + Footer ambient reveals
  initCtaFooter();

  // 12. Testimonials carousel
  initTestimonials();

  // 13b. Pricing toggle + tilt
  initPricing();

  // 13. Floating action button
  initFab();

  // 14. Custom cursor
  initCursor();

  // 16. Back to top
  initBackToTop();

  // 17. Tracing beam
  initTracingBeam();

  // 15. Roadmap scroll path
  initRoadmap();

  // 16. Scroll-activated states for touch devices (replaces hover)
  initScrollActivation();

  // 17. Mobile sticky CTA bar
  initMobileCta();
});

function initScrollActivation() {
  // Only run on touch/no-hover devices
  if (!window.matchMedia('(hover: none)').matches) return;

  // Elements where hover effects should be scroll-activated
  // Each entry: [selector, threshold] — larger elements need lower threshold
  const groups = [
    ['.system__card',      0.55],
    ['.svc__item',         0.65],
    ['.process__col',      0.45],
    ['.result__feature',   0.25],
    ['.faq__item',         0.70],
  ];

  groups.forEach(([selector, threshold]) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, {
      threshold,
      rootMargin: '0px 0px -8% 0px', // element must be slightly past screen edge
    });

    els.forEach(el => observer.observe(el));
  });
}

function initRoadmap() {
  const path  = document.getElementById('roadmapPath');
  const items = document.querySelectorAll('.roadmap__item');
  if (!items.length) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!isMobile && path) {
    // Double rAF: ensures browser has completed layout before getTotalLength()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const length = path.getTotalLength();
        path.style.strokeDasharray  = length;
        path.style.strokeDashoffset = length;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '#roadmap',
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: 0.6,
            }
          });
        }
      });
    });
  }

  if (isMobile) {
    const vline = document.querySelector('.roadmap__vline');
    if (vline && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(vline,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#roadmap',
            start: 'top 80%',
            end: 'bottom 60%',
            scrub: 0.6,
          }
        }
      );
    }
  }

  // Defer observer by one rAF to avoid firing immediately on items already
  // in the viewport before the page has fully painted (prevents initial flash)
  requestAnimationFrame(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
  });
}

function initBackToTop() {
  const btn    = document.getElementById('btt');
  const mobCta = document.getElementById('mobCta');
  if (!btn) return;

  function update() {
    const isMob = window.innerWidth < 768;
    // Desktop: show near page bottom. Mobile: show after 400px scroll.
    const threshold = isMob ? 400 : document.body.scrollHeight - window.innerHeight - 300;
    const show = isMob ? window.scrollY > threshold
                       : (window.scrollY + window.innerHeight) >= (document.body.scrollHeight - 300);
    btn.classList.toggle('btt--visible', show);

    // On mobile, sit above the sticky CTA bar when it's visible
    if (isMob && mobCta) {
      const ctaUp = mobCta.classList.contains('mob-cta--visible');
      btn.style.bottom = ctaUp
        ? `calc(${mobCta.offsetHeight}px + 12px + env(safe-area-inset-bottom, 0px))`
        : '16px';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Only on fine pointer devices (not touch)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = -9999, mouseY = -9999;
  let dotX   = -9999, dotY   = -9999;
  let ringX  = -9999, ringY  = -9999;
  let rafId;
  let firstMove = true;

  dot.style.opacity  = '0';
  ring.style.opacity = '0';

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (firstMove) {
      dotX  = mouseX; dotY  = mouseY;
      ringX = mouseX; ringY = mouseY;
      firstMove = false;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  });

  // Both dot and ring chase mouse with lerp — dot faster, ring slower
  function animateCursor() {
    dotX  += (mouseX - dotX)  * 0.18;
    dotY  += (mouseY - dotY)  * 0.18;
    ringX += (mouseX - ringX) * 0.10;
    ringY += (mouseY - ringY) * 0.10;
    dot.style.transform  = `translate(calc(${dotX}px - 50%),  calc(${dotY}px - 50%))`;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    rafId = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover on interactive elements
  const interactives = 'a, button, [role="button"], input, textarea, select, label, .fab__trigger, .fab__child, .story__slide, .testi__arrow, .testi__dot, .faq__q';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      dot.classList.add('cursor--hover');
      ring.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      dot.classList.remove('cursor--hover');
      ring.classList.remove('cursor--hover');
    }
  });

  // Click flash
  document.addEventListener('mousedown', () => {
    dot.classList.add('cursor--click');
    ring.classList.add('cursor--click');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('cursor--click');
    ring.classList.remove('cursor--click');
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

function initPricing() {
  const toggle = document.getElementById('pricingToggle');
  if (!toggle) return;
  const amounts = document.querySelectorAll('.pricing__amount');

  toggle.addEventListener('click', () => {
    const isAnnual = toggle.getAttribute('aria-checked') === 'true';
    toggle.setAttribute('aria-checked', isAnnual ? 'false' : 'true');

    amounts.forEach(el => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = isAnnual ? el.dataset.monthly : el.dataset.annual;
        el.style.opacity = '1';
      }, 150);
    });
  });

  // 3D tilt on cards — throttled via rAF
  document.querySelectorAll('.pricing__card').forEach(card => {
    let tiltPending = false;
    card.addEventListener('mousemove', e => {
      if (tiltPending) return;
      tiltPending = true;
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
        card.style.transition = 'transform 0.1s ease, border-color 0.3s, box-shadow 0.4s';
        tiltPending = false;
      });
    });
    card.addEventListener('mouseleave', () => {
      tiltPending = false;
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.4s';
    });
  });
}

function initFab() {
  const fab     = document.getElementById('fab');
  const trigger = document.getElementById('fabTrigger');
  if (!fab || !trigger) return;

  let open = false;

  trigger.addEventListener('click', () => {
    open = !open;
    fab.classList.toggle('fab--open', open);
    trigger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (open && !fab.contains(e.target)) {
      open = false;
      fab.classList.remove('fab--open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

function initTestimonials() {
  const slides  = Array.from(document.querySelectorAll('.testi__slide'));
  const dots    = Array.from(document.querySelectorAll('.testi__dot'));
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (!slides.length || !prevBtn) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.index); startTimer(); }));

  // Touch swipe support for mobile
  const stage = document.querySelector('.testi__stage');
  if (stage) {
    let touchStartX = 0;
    let touchStartY = 0;
    stage.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
      // Only trigger on predominantly horizontal swipes (> 48px, not a vertical scroll)
      if (Math.abs(dx) > 48 && Math.abs(dx) > dy * 1.5) {
        dx > 0 ? goTo(current + 1) : goTo(current - 1);
        startTimer();
      }
    }, { passive: true });
  }

  startTimer();
}

// ============================================================
//  MOBILE STICKY CTA BAR
//  Slides up once hero scrolls out of view. Hidden on desktop.
// ============================================================
function initMobileCta() {
  const bar = document.getElementById('mobCta');
  if (!bar) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const observer = new IntersectionObserver(entries => {
    const visible = !entries[0].isIntersecting;
    bar.classList.toggle('mob-cta--visible', visible);
    bar.setAttribute('aria-hidden', String(!visible));
  }, { threshold: 0.1 });

  observer.observe(hero);
}
