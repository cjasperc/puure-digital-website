/* ============================================================
   ABOUT PAGE — animations + interactivity
   ============================================================ */
(function () {

  // Nav
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

  // Cursor
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
    const interactive = 'a, button, [role="button"]';
    document.addEventListener('mouseover', e => { if (e.target.closest(interactive)) { dot.classList.add('cursor--hover'); ring.classList.add('cursor--hover'); } });
    document.addEventListener('mouseout',  e => { if (e.target.closest(interactive)) { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor--hover'); } });
    document.addEventListener('mousedown', () => { dot.classList.add('cursor--click'); ring.classList.add('cursor--click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('cursor--click'); ring.classList.remove('cursor--click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  })();

  // ── Shared fade-up observer ──────────────────────────────
  function fadeUp(el, delay) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.65s ease ${delay || 0}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay || 0}s`;
    return el;
  }
  function observe(el, opts) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) translateX(0)';
        obs.unobserve(entry.target);
      });
    }, opts || { threshold: 0.15 });
    obs.observe(el);
  }

  // ── Hero entrance ────────────────────────────────────────
  const heroEls = ['.ab-hero__label', '.ab-hero__h1', '.ab-hero__sub'].map(s => document.querySelector(s)).filter(Boolean);
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.7s ease ${i * 0.13}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.13}s`;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    heroEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  }));

  // ── Split section: image slides in from side ─────────────
  document.querySelectorAll('.ab-split__img-wrap').forEach((wrap, i) => {
    const dir = i % 2 === 0 ? '-40px' : '40px';
    wrap.style.opacity = '0';
    wrap.style.transform = `translateX(${dir})`;
    wrap.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    observe(wrap, { threshold: 0.2 });
  });

  // ── Split headings ───────────────────────────────────────
  document.querySelectorAll('.ab-split__h2').forEach(el => {
    fadeUp(el, 0);
    observe(el, { threshold: 0.2 });
  });

  // ── Value items stagger ──────────────────────────────────
  document.querySelectorAll('.ab-split__text-col').forEach(col => {
    const values = col.querySelectorAll('.ab-value');
    values.forEach((v, i) => {
      v.style.opacity = '0';
      v.style.transform = 'translateY(20px)';
      v.style.transition = `opacity 0.55s ease ${i * 0.12}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`;
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        values.forEach(v => { v.style.opacity = '1'; v.style.transform = 'translateY(0)'; });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    obs.observe(col);
  });

  // ── Team section ─────────────────────────────────────────
  const teamLabel = document.querySelector('.ab-section-label');
  const teamH2    = document.querySelector('.ab-team__h2');
  if (teamLabel) { fadeUp(teamLabel, 0); observe(teamLabel); }
  if (teamH2)    { fadeUp(teamH2, 0.1); observe(teamH2); }

  document.querySelectorAll('.ab-member').forEach((m, i) => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(32px)';
    m.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    obs.observe(m);
  });

  // ── Quote cards stagger ──────────────────────────────────
  document.querySelectorAll('.ab-quote').forEach((q, i) => {
    q.style.opacity = '0';
    q.style.transform = 'translateY(28px)';
    q.style.transition = `opacity 0.6s ease ${i * 0.18}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s, border-color 0.3s, box-shadow 0.3s`;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    obs.observe(q);

    // Tilt on hover
    q.addEventListener('mousemove', e => {
      const rect = q.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      q.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      q.style.transition = 'border-color 0.3s, box-shadow 0.3s';
    });
    q.addEventListener('mouseleave', () => {
      q.style.transition = 'border-color 0.3s, transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s';
      q.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
    q.style.transformStyle = 'preserve-3d';
  });

  // ── CTA entrance ─────────────────────────────────────────
  const ctaH2  = document.querySelector('.ab-cta__h2');
  const ctaSub = document.querySelector('.ab-cta__sub');
  const ctaBtn = document.querySelector('.ab-cta .btn');
  if (ctaH2)  { fadeUp(ctaH2, 0);    observe(ctaH2); }
  if (ctaSub) { fadeUp(ctaSub, 0.1); observe(ctaSub); }
  if (ctaBtn) {
    fadeUp(ctaBtn, 0.2);
    observe(ctaBtn);
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
