// Our Work — phone reel player + cursor
(function () {

  // Custom cursor
  (function initCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
      requestAnimationFrame(animateRing);
    })();

    const interactives = 'a, button, [role="button"]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) { dot.classList.add('cursor--hover'); ring.classList.add('cursor--hover'); }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor--hover'); }
    });
    document.addEventListener('mousedown', () => { dot.classList.add('cursor--click'); ring.classList.add('cursor--click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('cursor--click'); ring.classList.remove('cursor--click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  })();
  document.querySelectorAll('.phone').forEach(function (phone) {
    const video = phone.querySelector('.phone__video');
    const btn = phone.querySelector('.phone__play');
    if (!video || !btn) return;

    btn.addEventListener('click', function () {
      if (video.paused) {
        // Pause any other playing videos first
        document.querySelectorAll('.phone__video').forEach(function (v) {
          if (v !== video && !v.paused) {
            v.pause();
            const otherBtn = v.closest('.phone').querySelector('.phone__play');
            if (otherBtn) otherBtn.classList.remove('is-playing');
          }
        });
        video.play();
        btn.classList.add('is-playing');
      } else {
        video.pause();
        btn.classList.remove('is-playing');
      }
    });

    // Show play button again when video ends
    video.addEventListener('ended', function () {
      btn.classList.remove('is-playing');
    });
  });
})();
