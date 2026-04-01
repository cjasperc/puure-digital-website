/* ============================================================
   ABOUT PAGE — animations
   ============================================================ */
(function () {

  // ── Nav ──────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mobile.setAttribute('aria-hidden', String(open));
    nav.classList.toggle('nav--open', !open);
  });

  // ── Cursor ───────────────────────────────────────────────
  (function () {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || !window.matchMedia('(pointer: fine)').matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.opacity = '1'; ring.style.opacity = '1';
      dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
      requestAnimationFrame(loop);
    })();
    const i = 'a, button, [role="button"]';
    document.addEventListener('mouseover', e => { if (e.target.closest(i)) { dot.classList.add('cursor--hover'); ring.classList.add('cursor--hover'); } });
    document.addEventListener('mouseout',  e => { if (e.target.closest(i)) { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor--hover'); } });
    document.addEventListener('mousedown', () => { dot.classList.add('cursor--click'); ring.classList.add('cursor--click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('cursor--click'); ring.classList.remove('cursor--click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  })();

  // ── Hero — lines mask-reveal ─────────────────────────────
  const eyebrow = document.querySelector('.ab-hero__eyebrow');
  const lines   = document.querySelectorAll('.ab-hero__line');
  const meta    = document.querySelector('.ab-hero__meta');
  const scroll  = document.querySelector('.ab-hero__scroll');

  if (eyebrow) {
    eyebrow.style.opacity = '0';
    eyebrow.style.transition = 'opacity 0.6s ease 0.1s';
  }
  lines.forEach((line, i) => {
    line.style.transform = 'translateY(105%)';
    line.style.transition = `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.12}s`;
  });
  if (meta) {
    meta.style.opacity = '0';
    meta.style.transition = 'opacity 0.6s ease 0.7s';
  }
  if (scroll) {
    scroll.style.opacity = '0';
    scroll.style.transition = 'opacity 0.6s ease 1s';
  }

  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (eyebrow) eyebrow.style.opacity = '1';
    lines.forEach(line => line.style.transform = 'translateY(0)');
    if (meta) meta.style.opacity = '1';
    if (scroll) scroll.style.opacity = '1';
  }));

  // ── Mission — word-by-word highlight on scroll ───────────
  const missionText = document.querySelector('.ab-mission__text');
  if (missionText) {
    missionText.style.opacity = '0';
    missionText.style.transform = 'translateY(24px)';
    missionText.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        missionText.style.opacity = '1';
        missionText.style.transform = 'translateY(0)';
        obs.unobserve(missionText);
      });
    }, { threshold: 0.3 });
    obs.observe(missionText);
  }

  // ── Values — rows slide in ───────────────────────────────
  document.querySelectorAll('.ab-value-row').forEach((row, i) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-16px)';
    row.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
        obs.unobserve(row);
      });
    }, { threshold: 0.3 });
    obs.observe(row);
  });

  // ── Team — photos scale in ───────────────────────────────
  document.querySelectorAll('.ab-person').forEach((person, i) => {
    person.style.opacity = '0';
    person.style.transform = 'translateY(40px)';
    person.style.transition = `opacity 0.7s ease ${i * 0.2}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.2}s`;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        person.style.opacity = '1';
        person.style.transform = 'translateY(0)';
        obs.unobserve(person);
      });
    }, { threshold: 0.2 });
    obs.observe(person);
  });

  // ── Pull quote — fade up ─────────────────────────────────
  const quote = document.querySelector('.ab-pullquote__text');
  const cite  = document.querySelector('.ab-pullquote__cite');
  [quote, cite].filter(Boolean).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.8s ease ${i * 0.2}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.2}s`;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    obs.observe(el);
  });

  // ── CTA — magnetic button ────────────────────────────────
  const ctaLine = document.querySelector('.ab-cta__line');
  const ctaBtn  = document.querySelector('.ab-cta .btn');
  [ctaLine, ctaBtn].filter(Boolean).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', e => {
      const r = ctaBtn.getBoundingClientRect();
      ctaBtn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.2}px, ${(e.clientY - r.top - r.height/2) * 0.3}px)`;
    });
    ctaBtn.addEventListener('mouseleave', () => {
      ctaBtn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      ctaBtn.style.transform = 'translate(0,0)';
      setTimeout(() => ctaBtn.style.transition = '', 400);
    });
  }

})();
