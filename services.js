/* ============================================================
   SERVICES — scroll animations + interactivity
   ============================================================ */
(function () {

  // ── Utility ──────────────────────────────────────────────
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  // ── 1. Nav scroll ────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  // ── 2. Nav burger ────────────────────────────────────────
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mobile.setAttribute('aria-hidden', String(open));
    nav.classList.toggle('nav--open', !open);
  });

  // ── 3. Custom cursor ─────────────────────────────────────
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
    const interactives = 'a, button, [role="button"]';
    document.addEventListener('mouseover', e => { if (e.target.closest(interactives)) { dot.classList.add('cursor--hover'); ring.classList.add('cursor--hover'); } });
    document.addEventListener('mouseout',  e => { if (e.target.closest(interactives)) { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor--hover'); } });
    document.addEventListener('mousedown', () => { dot.classList.add('cursor--click'); ring.classList.add('cursor--click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('cursor--click'); ring.classList.remove('cursor--click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  })();

  // ── 4. Hero entrance ─────────────────────────────────────
  (function () {
    const label = $('.sv-hero__label');
    const h1    = $('.sv-hero__h1');
    const sub   = $('.sv-hero__sub');
    const cta   = $('.sv-hero__cta');
    const els   = [label, h1, sub, cta].filter(Boolean);
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    }));
  })();

  // ── 5. Generic scroll reveal ─────────────────────────────
  // Add data-reveal to anything you want to animate in
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // ── 6. Staggered card reveals ────────────────────────────
  const cardGrids = $$('.sv-included__grid');
  cardGrids.forEach(grid => {
    const cards = $$('.sv-card', grid);
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px)';
      card.style.transition = `opacity 0.55s ease ${i * 0.08}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
    });
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cards.forEach(card => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
        gridObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    gridObserver.observe(grid);
  });

  // ── 7. Steps sequential reveal ───────────────────────────
  const stepRows = $$('.sv-steps');
  stepRows.forEach(row => {
    const steps = $$('.sv-step', row);
    steps.forEach((step, i) => {
      step.style.opacity = '0';
      step.style.transform = 'translateX(-20px)';
      step.style.transition = `opacity 0.5s ease ${i * 0.15}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`;
    });
    const stepsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        steps.forEach(step => { step.style.opacity = '1'; step.style.transform = 'translateX(0)'; });
        stepsObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    stepsObserver.observe(row);
  });

  // ── 8. Section headings slide up ─────────────────────────
  const headings = $$('.sv-included__h2, .sv-process__h2, .sv-included__sub, .sv-cta__h2, .sv-cta__sub');
  headings.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    obs.observe(el);
  });

  // ── 9. Stat counter animation ────────────────────────────
  function animateCounter(el) {
    const raw   = el.textContent.trim();
    const prefix = raw.match(/^[^0-9]*/)[0];
    const suffix = raw.match(/[^0-9]*$/)[0];
    const num    = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const isFloat  = raw.includes('.');
    const duration = 1400;
    const start    = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * num;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsSection = $('.sv-results');
  if (statsSection) {
    const statNums = $$('.sv-stat__num', statsSection);
    let counted = false;
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || counted) return;
        counted = true;
        statNums.forEach(el => animateCounter(el));
        statsObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);

    // Also animate the stats section in
    statsSection.style.opacity = '0';
    statsSection.style.transform = 'translateY(24px)';
    statsSection.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    fadeObserver.observe(statsSection);
  }

  // ── 10. Quote fade in ────────────────────────────────────
  const quote = $('.sv-results__quote');
  if (quote) {
    quote.style.opacity = '0';
    quote.style.transform = 'translateX(20px)';
    quote.style.transition = 'opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s';
    const qObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        qObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    qObs.observe(quote);
  }

  // ── 11. CTA button magnetic effect ───────────────────────
  $$('.sv-cta .btn, .sv-hero__cta .btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform = 'translate(0,0)';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });

  // ── 12. Card hover tilt ───────────────────────────────────
  $$('.sv-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.25s, border-color 0.25s';
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
      setTimeout(() => card.style.transition = '', 400);
    });
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';
  });

  // ── 13. Step number hover glow ───────────────────────────
  $$('.sv-step').forEach(step => {
    const num = step.querySelector('.sv-step__num');
    if (!num) return;
    step.addEventListener('mouseenter', () => { num.style.textShadow = '0 0 20px rgba(94,232,216,0.8)'; num.style.transform = 'scale(1.1)'; num.style.transition = 'all 0.3s ease'; });
    step.addEventListener('mouseleave', () => { num.style.textShadow = ''; num.style.transform = ''; });
  });

})();
