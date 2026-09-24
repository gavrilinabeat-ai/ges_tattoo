/* Sacred Ink Academy — 10% discount popup
   Front-end only. Wire `submitToCrm()` to your real ESP/CRM endpoint —
   right now it mocks a network call and stores state in localStorage. */
window.SIA_Popup = (function () {
  'use strict';

  var STORAGE_KEY = 'sia_discount_state'; // 'dismissed' | 'submitted'
  var CAMPAIGN = '10-percent-popup';
  var PROMO_CODE = 'SACREDINK10'; // TODO: replace with backend-generated code

  var overlay, closeBtn, fab, revealCard, revealCover, revealFallback;
  var form, emailInput, emailError, promoCodeEl, copyBtn;
  var dragging = false, startX = 0, revealed = false;

  function els() {
    overlay = document.getElementById('discountOverlay');
    closeBtn = document.getElementById('discountClose');
    fab = document.getElementById('discountFab');
    revealCard = document.getElementById('revealCard');
    revealCover = document.getElementById('revealCover');
    revealFallback = document.getElementById('revealFallback');
    form = document.getElementById('discountForm');
    emailInput = document.getElementById('discountEmail');
    emailError = document.getElementById('discountEmailError');
    promoCodeEl = document.getElementById('promoCode');
    copyBtn = document.getElementById('promoCopyBtn');
  }

  function getState() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setState(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) { /* ignore */ }
  }

  function goToStep(name) {
    document.querySelectorAll('.modal-step').forEach(function (s) {
      s.classList.toggle('is-active', s.dataset.step === name);
    });
  }

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    fab.classList.remove('is-visible');
  }

  function closeModal(markDismissed) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (markDismissed && getState() !== 'submitted') {
      setState('dismissed');
      showFabSoon();
    }
  }

  function showFabSoon() {
    if (getState() === 'submitted') return;
    setTimeout(function () { fab.classList.add('is-visible'); }, 600);
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    revealCover.classList.add('is-revealed');
    setTimeout(function () { goToStep('email'); emailInput.focus({ preventScroll: true }); }, 450);
  }

  function initRevealDrag() {
    revealCover.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX;
      revealCover.setPointerCapture(e.pointerId);
      revealCover.style.cursor = 'grabbing';
    });
    revealCover.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 60) reveal();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      revealCover.addEventListener(evt, function () {
        dragging = false;
        revealCover.style.cursor = 'grab';
      });
    });
    revealFallback.addEventListener('click', reveal);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* Mock CRM/ESP submission. Replace with a real fetch() to your
     email platform (e.g. Klaviyo, Mailchimp, custom backend). */
  function submitToCrm(email) {
    var payload = {
      email: email,
      language: 'ua',
      source_page: window.location.pathname,
      utm: Object.fromEntries(new URLSearchParams(window.location.search)),
      created_at: new Date().toISOString(),
      campaign: CAMPAIGN
    };
    console.info('[SIA] discount popup lead (mock submit):', payload);
    return Promise.resolve({ promoCode: PROMO_CODE });
  }

  function initForm() {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();
      if (!isValidEmail(value)) {
        emailError.classList.add('is-visible');
        emailInput.setAttribute('aria-invalid', 'true');
        return;
      }
      emailError.classList.remove('is-visible');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      submitToCrm(value).then(function (res) {
        promoCodeEl.textContent = res.promoCode;
        setState('submitted');
        goToStep('success');
        btn.disabled = false;
      });
    });
  }

  function initCopy() {
    copyBtn.addEventListener('click', function () {
      var text = promoCodeEl.textContent;
      var done = function () {
        copyBtn.textContent = 'Скопійовано ✓';
        setTimeout(function () { copyBtn.textContent = 'Скопіювати'; }, 1800);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  function initTriggers() {
    if (getState() === 'submitted') return;
    if (getState() === 'dismissed') { showFabSoon(); return; }

    var triggered = false;
    function trigger() {
      if (triggered) return;
      triggered = true;
      openModal();
    }
    setTimeout(trigger, 7000);
    window.addEventListener('scroll', function onScroll() {
      if (window.scrollY > 200) {
        trigger();
        window.removeEventListener('scroll', onScroll);
      }
    }, { passive: true });
  }

  function init() {
    els();
    if (!overlay) return;
    initRevealDrag();
    initForm();
    initCopy();

    closeBtn.addEventListener('click', function () { closeModal(true); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(true);
    });
    fab.addEventListener('click', openModal);

    initTriggers();
  }

  return { init: init };
})();
