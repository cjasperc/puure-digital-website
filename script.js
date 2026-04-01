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

  // [1] Eyebrow — 500ms
  await delay(500);
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

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Connections — use squared distance to avoid sqrt per pair
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx  = nodes[i].x - nodes[j].x;
        const dy  = nodes[i].y - nodes[j].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < CONNECT_DIST_SQ) {
          const alpha = (1 - Math.sqrt(dSq) / CONNECT_DIST) * 0.05;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      // Mouse repel — gentle push away
      const dx = n.x - mouseX, dy = n.y - mouseY;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 110 && d > 0) {
        const f = (110 - d) / 110 * 0.009;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }

      n.vx *= 0.985;
      n.vy *= 0.985;
      n.x  += n.vx;
      n.y  += n.vy;

      // Wrap edges
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
      scrub: 1.5,
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
      scrub: 1,
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
  const section = document.getElementById('probJourney');
  if (!section) return;

  const intro   = document.getElementById('pjIntro');
  const cards   = [
    document.getElementById('pjCard0'),
    document.getElementById('pjCard1'),
    document.getElementById('pjCard2'),
  ];
  const stage   = document.getElementById('pjStage');
  const resolve = document.getElementById('pjResolve');

  if (!intro || !resolve || !stage) return;

  // Reduced motion — show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set([intro, ...cards, resolve], { opacity: 1, y: 0 });
    return;
  }

  // Set initial state
  gsap.set(intro,   { opacity: 0, y: 18 });
  gsap.set(cards,   { opacity: 0, y: 28 });
  gsap.set(resolve, { opacity: 0, y: 0  });

  // --- Scrubbed timeline ---
  const tl = gsap.timeline();

  // Intro fades in
  tl.to(intro, { opacity: 1, y: 0, duration: 1.2, ease: 'none' }, 0);

  // Cards stagger in one by one
  cards.forEach((card, i) => {
    tl.to(card, { opacity: 1, y: 0, duration: 1.0, ease: 'none' }, 1.4 + i * 1.3);
  });

  // Hold — all three visible
  tl.to({}, { duration: 1.2 });

  // Cards fall off the bottom one by one (right to left order)
  [cards[2], cards[1], cards[0]].forEach((card, i) => {
    tl.to(card, {
      y: 280,
      opacity: 0,
      rotation: (i % 2 === 0 ? 6 : -6),
      duration: 0.9,
      ease: 'none'
    }, `>-0.4`);
  });

  // Intro fades out
  tl.to(intro, { opacity: 0, duration: 0.6, ease: 'none' }, '<+=0.1');

  // Resolution comes in
  tl.to(resolve, { opacity: 1, duration: 1.6, ease: 'none' }, '<+=0.2');

  // Wrap resolve-a and resolve-b words in spans for glow effect
  function wrapWords(el) {
    if (!el) return [];
    const spans = [];
    // Snapshot to static array — avoids live NodeList mutation bugs
    const nodes = [...el.childNodes];
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(part => {
          if (part.match(/^\s+$/)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part) {
            const span = document.createElement('span');
            span.className = 'glow-word';
            span.textContent = part;
            frag.appendChild(span);
            spans.push(span);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const isTeal = node.classList.contains('glow-teal');
        const span = document.createElement('span');
        span.className = 'glow-word' + (isTeal ? ' glow-teal' : '');
        node.parentNode.insertBefore(span, node);
        span.appendChild(node);
        spans.push(span);
      }
    });
    return spans;
  }

  const resolveA = resolve.querySelector('.pj__resolve-a');
  const resolveB = resolve.querySelector('.pj__resolve-b');
  const resolveC = resolve.querySelector('.pj__resolve-c');
  const allWords = [...wrapWords(resolveA), ...wrapWords(resolveB), ...wrapWords(resolveC)];

  // Scroll-driven word reveal — each word lights up as you scroll
  ScrollTrigger.create({
    trigger: section,
    start: 'bottom bottom+=200',
    onEnter: () => resolve.classList.add('pj__resolve--active'),
    onLeaveBack: () => resolve.classList.remove('pj__resolve--active'),
  });

  const total = allWords.length;
  ScrollTrigger.create({
    trigger: resolve,
    start: 'top 80%',
    end: 'bottom 30%',
    scrub: 0.6,
    onUpdate: (self) => {
      const progress = self.progress;
      const litCount = Math.round(progress * total);
      allWords.forEach((word, i) => {
        word.classList.toggle('glow-word--lit', i < litCount);
      });
    },
  });

  // Scroll-driven beam sweep — full viewport width, fixed position
  const beam = document.getElementById('pjBeam');
  const beamWrap = beam ? beam.parentElement : null;
  if (beam && beamWrap) {
    const vw = window.innerWidth;

    // Keep beam vertical position aligned with resolve section centre
    function updateBeamTop() {
      const rect = resolve.getBoundingClientRect();
      beamWrap.style.top = (rect.top + rect.height * 0.72 + window.scrollY) + 'px';
      beamWrap.style.position = 'absolute';
    }
    updateBeamTop();
    window.addEventListener('resize', updateBeamTop);

    gsap.fromTo(beam,
      { x: -200 },
      {
        x: vw + 200,
        ease: 'none',
        scrollTrigger: {
          trigger: resolve,
          start: 'top 75%',
          end: 'bottom 15%',
          scrub: 0.6,
        }
      }
    );
  }

  // Hold at resolution
  tl.to({}, { duration: 1.2 });

  // --- Attach to scroll via ScrollTrigger ---
  ScrollTrigger.create({
    trigger:   section,
    start:     'top top',
    end:       'bottom bottom',
    scrub:     1,            // 1s lag — weighted, deliberate feel
    animation: tl,
  });
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
    end: `+=${window.innerHeight * 2}`,
    pin: true,
    scrub: 1,
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
  ].join(', ');

  const els = $$(SELECTORS).filter(el => !HERO_IDS.has(el.id));
  els.forEach(el => el.classList.add('fade-up'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

  els.forEach(el => io.observe(el));

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
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 10);
    if (nav.classList.contains('nav--open')) closeMenu();
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

  // 15. Roadmap scroll path
  initRoadmap();

  // 16. Scroll-activated states for touch devices (replaces hover)
  initScrollActivation();
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
              scrub: 1.2,
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
            scrub: 1.2,
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

function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Only on fine pointer devices (not touch)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = -9999, mouseY = -9999;
  let ringX  = -9999, ringY  = -9999;
  let rafId;
  let firstMove = true;

  dot.style.opacity  = '0';
  ring.style.opacity = '0';

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (firstMove) {
      // Snap ring to cursor on first move — no crawl from corner
      ringX = mouseX;
      ringY = mouseY;
      firstMove = false;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Ring trails with lerp
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

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
  const overlay      = document.getElementById('testiOverlay');
  const overlayQuote = document.getElementById('testiOverlayQuote');
  const overlayName  = document.getElementById('testiOverlayName');
  const overlayBiz   = document.getElementById('testiOverlayBiz');
  const closeBtn     = document.getElementById('testiOverlayClose');
  if (!overlay || !closeBtn) return;

  function openOverlay(card) {
    overlayQuote.textContent = card.dataset.quote;
    overlayName.textContent  = card.dataset.name;
    overlayBiz.textContent   = card.dataset.biz;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  const googleGSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

  document.querySelectorAll('.testi__card').forEach(card => {
    // Inject stars after the quote mark
    const mark = card.querySelector('.testi__card-mark');
    if (mark && !card.querySelector('.testi__card-stars')) {
      const stars = document.createElement('span');
      stars.className = 'testi__card-stars';
      stars.textContent = '★★★★★';
      mark.insertAdjacentElement('afterend', stars);
    }
    // Inject Google badge in footer
    const footer = card.querySelector('.testi__card-footer');
    if (footer && !card.querySelector('.testi__card-google')) {
      const badge = document.createElement('div');
      badge.className = 'testi__card-google';
      badge.innerHTML = `${googleGSvg}<span>Google Review</span>`;
      footer.insertAdjacentElement('afterend', badge);
    }
    card.addEventListener('click', () => openOverlay(card));
  });

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });
}
