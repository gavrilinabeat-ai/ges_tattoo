/* Sacred Ink Academy — shared site behaviour */
(function () {
  'use strict';

  function initHeader() {
    var burgerBtn = document.getElementById('burgerBtn');
    var closeBtn = document.getElementById('burgerCloseBtn');
    var menu = document.getElementById('mobileMenu');
    if (!burgerBtn || !menu) return;

    function open() {
      menu.classList.add('is-open');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    burgerBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        item.parentElement.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('is-open'); });
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  function initWorksScroller() {
    document.querySelectorAll('.works-scroller').forEach(function (scroller) {
      var wrap = scroller.closest('.reviews-block') || scroller.closest('section') || document;
      var prev = wrap.querySelector('[data-works-prev]');
      var next = wrap.querySelector('[data-works-next]');
      function scrollBy(dir) { scroller.scrollBy({ left: dir * 260, behavior: 'smooth' }); }
      if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
      if (next) next.addEventListener('click', function () { scrollBy(1); });
    });
  }

  function initLightbox() {
    var overlay = document.getElementById('lightboxOverlay');
    var img = document.getElementById('lightboxImg');
    var closeBtn = document.getElementById('lightboxClose');
    if (!overlay || !img) return;

    function open(src) {
      img.src = src;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      img.src = '';
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-lightbox-src]');
      if (trigger) {
        e.preventDefault();
        open(trigger.getAttribute('data-lightbox-src'));
      }
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  function initHeroVideo() {
    var video = document.getElementById('heroMachineVideo');
    if (!video) return;

    video.muted = true;
    video.setAttribute('muted', '');
    video.removeAttribute('controls');

    // Keep the video invisible until it's actually animating, so nobody
    // ever sees a frozen/paused first frame — or Safari's native "tap to
    // play" glyph, which ignores opacity — while it loads.
    video.addEventListener('playing', function () {
      video.style.visibility = 'visible';
      video.style.opacity = '1';
    });

    function tryPlay() {
      video.muted = true;
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* wait for a user gesture, see below */ });
    }

    tryPlay();

    // Some browsers block autoplay even when muted; resume on the first
    // interaction and whenever the tab becomes visible again.
    ['click', 'touchstart', 'scroll', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) tryPlay();
    });
    video.addEventListener('pause', function () {
      if (!document.hidden) tryPlay();
    });
    ['stalled', 'suspend', 'waiting', 'ended'].forEach(function (evt) {
      video.addEventListener(evt, function () {
        if (!document.hidden) tryPlay();
      });
    });

    // Belt-and-suspenders: some browsers silently pause background video
    // without firing a 'pause' event we can catch. Poll and self-heal.
    setInterval(function () {
      if (!document.hidden && video.paused) tryPlay();
    }, 2000);
  }

  function initStickyCta() {
    var el = document.querySelector('.sticky-cta');
    if (!el) return;
    var hero = document.querySelector('.hero, .page-hero');
    if (!hero) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        el.style.display = entry.isIntersecting ? 'none' : 'flex';
      });
    }, { rootMargin: '-90% 0px 0px 0px' });
    io.observe(hero);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initFaq();
    initWorksScroller();
    initLightbox();
    initHeroVideo();
    initStickyCta();
    if (window.SIA_Popup) window.SIA_Popup.init();
  });
})();
