// Our Work — phone reel player
(function () {
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
