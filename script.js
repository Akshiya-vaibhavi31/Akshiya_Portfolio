/**
 * script.js — SHARED across index.html & contact.html
 * =====================================================
 * Handles:
 *  1. Reduced-motion check
 *  2. Custom cursor (dot + ring)
 *  3. Nav: scroll state, active section, mobile menu
 *  4. Scroll progress bar (GSAP)
 *  5. Hero animations (SVG draw-in, wave arm, speech bubble, typewriter, entrance)
 *  6. Eye/cursor tracking on SVG character
 *  7. Scroll-triggered reveals (fade-up, fade-left, scale-in, timeline, card)
 *  8. Skills pill hover (GSAP-driven)
 *  9. Project card tilt-on-hover (GSAP 3D)
 * 10. Button magnetic hover effect
 * 11. Mobile menu open/close (GSAP)
 * 12. Contact page load animations (contact.html specific)
 */

/* ─────────────────────────────────────────────────────────────
   0.  UTILITIES
   ───────────────────────────────────────────────────────────── */

/** Check if this page is the contact page */
const IS_CONTACT = window.location.pathname.includes('contact');

/** Detect prefers-reduced-motion */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Wait for DOM ready */
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* ─────────────────────────────────────────────────────────────
   1.  GSAP SETUP
   ───────────────────────────────────────────────────────────── */
ready(() => {
  // Register ScrollTrigger plugin
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // If GSAP not loaded, exit gracefully
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded — animations disabled.');
    return;
  }

  /* ─────────────────────────────────────────────────────────
     2.  CUSTOM CURSOR
     ───────────────────────────────────────────────────────── */
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  // Only activate on non-touch devices
  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;

    // QuickTo for smooth lag on the ring
    const moveRingX = gsap.quickTo(cursorRing, 'x', { duration: 0.45, ease: 'power3' });
    const moveRingY = gsap.quickTo(cursorRing, 'y', { duration: 0.45, ease: 'power3' });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      gsap.set(cursorDot,  { x: mouseX, y: mouseY });
      // Ring lags behind
      moveRingX(mouseX);
      moveRingY(mouseY);
    });

    // Grow cursor on interactive elements
    const interactiveEls = document.querySelectorAll('a, button, .skill-pill, .project-card, .cert-card, input, textarea');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursorRing, { scale: 1.9, opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorDot,  { scale: 0,   opacity: 0, duration: 0.2 });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(cursorRing, { scale: 1, opacity: 0.6, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorDot,  { scale: 1, opacity: 1,   duration: 0.2 });
      });
    });
  } else {
    // Touch device — hide custom cursors and restore default
    if (cursorDot)  cursorDot.style.display  = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ─────────────────────────────────────────────────────────
     3.  NAVIGATION
     ───────────────────────────────────────────────────────── */
  const nav = document.getElementById('main-nav');

  // Add scrolled class with blur effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav && nav.classList.add('scrolled');
    } else {
      nav && nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* Active section highlight (index.html only) */
  if (!IS_CONTACT) {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id),
      });
    });

    function setActiveNav(id) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     4.  MOBILE MENU
     ───────────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  window.closeMobileMenu = closeMobileMenu; // expose to inline onclick attributes

  function toggleMobileMenu() {
    menuOpen ? closeMobileMenu() : openMobileMenu();
  }

  function openMobileMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');

    // Animate hamburger → X
    const spans = hamburger.querySelectorAll('span');
    if (!prefersReducedMotion) {
      gsap.to(spans[0], { rotation: 45,  y: 7,  duration: 0.3, ease: 'power2.inOut' });
      gsap.to(spans[1], { opacity: 0,         duration: 0.2 });
      gsap.to(spans[2], { rotation: -45, y: -7, duration: 0.3, ease: 'power2.inOut' });

      // Animate menu links in
      const links = mobileMenu.querySelectorAll('a');
      gsap.fromTo(links,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(mobileMenu,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }

  function closeMobileMenu() {
    menuOpen = false;

    if (!prefersReducedMotion) {
      const spans = hamburger.querySelectorAll('span');
      gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(spans[1], { opacity: 1,         duration: 0.2 });
      gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });

      gsap.to(mobileMenu, {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    } else {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  /* ─────────────────────────────────────────────────────────
     5.  SCROLL PROGRESS BAR
     ───────────────────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     6.  HERO ANIMATIONS (index.html only)
     ───────────────────────────────────────────────────────── */
  if (!IS_CONTACT) {
    initHeroAnimations();
  }

  function initHeroAnimations() {
    if (prefersReducedMotion) {
      // Just show everything immediately
      gsap.set(['#hero-greeting','#hero-name','#hero-role','#hero-desc','#hero-cta','#hero-location','#speech-bubble'], { opacity: 1, y: 0, x: 0 });
      document.getElementById('bubble-text') && (document.getElementById('bubble-text').textContent = "Hi, I'm Akshiya 👋");
      const bubbleSub = document.getElementById('bubble-sub');
      if (bubbleSub) gsap.set(bubbleSub, { opacity: 1, y: 0 });
      return;
    }

    /* ── SVG Character Draw-In ── */
    // Collect all stroked paths/lines/circles/rects in the SVG
    const charSvg = document.getElementById('char-svg');
    if (charSvg) {
      const paths = charSvg.querySelectorAll('path[stroke], line[stroke], ellipse[stroke], circle[stroke], rect[stroke]');

      paths.forEach(el => {
        const len = el.getTotalLength ? el.getTotalLength() : 200;
        gsap.set(el, {
          strokeDasharray: len,
          strokeDashoffset: len,
        });
      });

      const drawTl = gsap.timeline({ delay: 0.3 });
      drawTl.to(paths, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: 'power3.inOut',
        stagger: { amount: 1.4 }
      });

      // After draw-in: show speech bubble (arm stays static)
      drawTl.call(() => {
        showSpeechBubble();
      }, [], '-=0.5');
    }

    /* ── Hero Text Entrance (staggered fade-up) ── */
    const heroTl = gsap.timeline({ delay: 0.5 });
    heroTl
      .fromTo('#hero-greeting',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
      .fromTo('#hero-name',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('#hero-role',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('#hero-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('#hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo('#hero-location',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.1'
      );
  }

  /* ── Wave Arm Animation — disabled (arm is static) ── */
  // The arm is drawn in via the stroke-dashoffset animation above
  // but stays in its raised/waving pose without any looping motion.
  function startWaveAnimation() {
    // Intentionally left empty — arm is static.
  }

  /* ── Speech Bubble + Typewriter ── */
  function showSpeechBubble() {
    const bubble = document.getElementById('speech-bubble');
    const bubbleText = document.getElementById('bubble-text');
    const bubbleSub  = document.getElementById('bubble-sub');
    if (!bubble || !bubbleText) return;

    // Animate bubble appearing
    gsap.fromTo(bubble,
      { opacity: 0, scale: 0.7, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }
    );

    // Typewriter effect
    const fullText = "Hi, I'm Akshiya 👋";
    let i = 0;
    bubbleText.textContent = '';

    const typeInterval = setInterval(() => {
      bubbleText.textContent = fullText.slice(0, i + 1);
      i++;
      if (i >= fullText.length) {
        clearInterval(typeInterval);
        // Animate the sub-title in after typing completes
        gsap.to(bubbleSub, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          delay: 0.2
        });
      }
    }, 60);
  }

  /* ─────────────────────────────────────────────────────────
     7.  EYE / CURSOR TRACKING (index.html only)
     ───────────────────────────────────────────────────────── */
  if (!IS_CONTACT) {
    const charSvg = document.getElementById('char-svg');
    if (charSvg) {
      const eyeLeft  = document.getElementById('iris-left');
      const eyeRight = document.getElementById('iris-right');
      const pupilLeft  = document.getElementById('pupil-left');
      const pupilRight = document.getElementById('pupil-right');

      // quickTo for smooth eye tracking
      const moveIrisLX = eyeLeft  ? gsap.quickTo(eyeLeft,  'x', { duration: 0.5, ease: 'power2.out' }) : null;
      const moveIrisLY = eyeLeft  ? gsap.quickTo(eyeLeft,  'y', { duration: 0.5, ease: 'power2.out' }) : null;
      const moveIrisRX = eyeRight ? gsap.quickTo(eyeRight, 'x', { duration: 0.5, ease: 'power2.out' }) : null;
      const moveIrisRY = eyeRight ? gsap.quickTo(eyeRight, 'y', { duration: 0.5, ease: 'power2.out' }) : null;

      window.addEventListener('mousemove', (e) => {
        const rect = charSvg.getBoundingClientRect();
        const svgCenterX = rect.left + rect.width * 0.5;
        const svgCenterY = rect.top  + rect.height * 0.35;

        const dx = (e.clientX - svgCenterX) / (rect.width / 2);
        const dy = (e.clientY - svgCenterY) / (rect.height / 2);

        // Clamp and scale the iris offset (max 4px)
        const maxOffset = 4;
        const ix = Math.max(-1, Math.min(1, dx)) * maxOffset;
        const iy = Math.max(-1, Math.min(1, dy)) * maxOffset;

        if (moveIrisLX) { moveIrisLX(ix); moveIrisLY(iy); }
        if (moveIrisRX) { moveIrisRX(ix); moveIrisRY(iy); }

        // Pupils follow irises
        if (pupilLeft)  { gsap.to(pupilLeft,  { x: ix, y: iy, duration: 0.5, ease: 'power2.out' }); }
        if (pupilRight) { gsap.to(pupilRight, { x: ix, y: iy, duration: 0.5, ease: 'power2.out' }); }
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────────────────────
     8.  SCROLL-TRIGGERED SECTION REVEALS
     ───────────────────────────────────────────────────────── */

  /* Helper: animate element in based on its data-reveal attribute */
  function setupScrollReveal(selector, animProps, triggerProps) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    els.forEach(el => {
      if (prefersReducedMotion) {
        gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 });
        return;
      }
      gsap.fromTo(el,
        animProps.from,
        {
          ...animProps.to,
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            once: true,
            ...triggerProps
          }
        }
      );
    });
  }

  /* Fade-up (generic reveal) */
  setupScrollReveal(
    '[data-reveal="fade-up"]',
    { from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' } }
  );

  /* Fade-left (section headings) */
  setupScrollReveal(
    '[data-reveal="fade-left"]',
    { from: { opacity: 0, x: -50 }, to: { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' } }
  );

  /* Scale-in (skill categories, certs) */
  const scaleInEls = document.querySelectorAll('[data-reveal="scale-in"]');
  if (scaleInEls.length && !prefersReducedMotion) {
    gsap.fromTo(scaleInEls,
      { opacity: 0, scale: 0.88, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.5)',
        stagger: 0.1,
        scrollTrigger: {
          trigger: scaleInEls[0],
          start: 'top 80%',
          once: true,
        }
      }
    );
  }

  /* Card reveal (project cards) */
  const cardEls = document.querySelectorAll('[data-reveal="card"]');
  if (cardEls.length && !prefersReducedMotion) {
    gsap.fromTo(cardEls,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: cardEls[0].closest('.projects-grid') || cardEls[0],
          start: 'top 80%',
          once: true,
        }
      }
    );
  }

  /* ─────────────────────────────────────────────────────────
     9.  ANIMATED TIMELINES (Education + Experience)
     ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.timeline').forEach(timeline => {
    if (prefersReducedMotion) return;

    /* Draw the vertical line as user scrolls */
    const line = timeline.querySelector('::before') || timeline;
    // We target the ::before via a wrapper approach
    gsap.to(timeline, {
      '--line-scale': 1,
      scrollTrigger: {
        trigger: timeline,
        start: 'top 75%',
        end: 'bottom 80%',
        scrub: 1,
      }
    });

    /* Pop-in each timeline item */
    const items = timeline.querySelectorAll('.timeline-item');
    items.forEach((item, i) => {
      const dot = item.querySelector('.timeline-dot');
      const card = item.querySelector('.timeline-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          once: true,
        }
      });

      if (dot) {
        tl.fromTo(dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
        );
      }
      if (card) {
        tl.fromTo(card,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.2'
        );
      }
    });

    /* Also animate the vertical line using a pseudo-element trick */
    const lineEl = document.createElement('div');
    lineEl.style.cssText = `
      position:absolute;left:8px;top:0;width:2px;
      background:linear-gradient(to bottom, var(--clr-accent), transparent);
      transform-origin:top;transform:scaleY(0);height:100%;pointer-events:none;
    `;
    timeline.style.position = 'relative';
    timeline.prepend(lineEl);

    gsap.to(lineEl, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 75%',
        end: 'bottom 80%',
        scrub: 1.5,
      }
    });
  });

  /* ─────────────────────────────────────────────────────────
     10.  SKILLS PILL HOVER (GSAP-driven)
     ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.skill-pill').forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      if (prefersReducedMotion) return;
      gsap.to(pill, {
        scale: 1.12,
        backgroundColor: 'rgba(108,99,255,0.25)',
        borderColor: 'rgba(108,99,255,0.65)',
        color: '#fff',
        duration: 0.25,
        ease: 'power2.out',
      });
    });
    pill.addEventListener('mouseleave', () => {
      if (prefersReducedMotion) return;
      gsap.to(pill, {
        scale: 1,
        backgroundColor: 'rgba(108,99,255,0.08)',
        borderColor: 'rgba(108,99,255,0.18)',
        color: 'var(--clr-text)',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    });
  });

  /* ─────────────────────────────────────────────────────────
     11.  PROJECT CARD TILT HOVER (3D perspective)
     ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    if (prefersReducedMotion) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * -8; // max ±8deg
      const ry = ((e.clientX - cx) / (rect.width  / 2)) *  8;

      gsap.to(card, {
        rotationX: rx,
        rotationY: ry,
        transformPerspective: 800,
        ease: 'power2.out',
        duration: 0.3,
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });

  /* ─────────────────────────────────────────────────────────
     12.  BUTTON MAGNETIC HOVER EFFECT
     ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    if (prefersReducedMotion) return;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;

      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });

  /* ─────────────────────────────────────────────────────────
     13.  CONTACT PAGE ANIMATIONS (contact.html only)
     ───────────────────────────────────────────────────────── */
  if (IS_CONTACT) {
    initContactPageAnimations();
  }

  function initContactPageAnimations() {
    if (prefersReducedMotion) return;

    /* Hero heading stagger */
    const contactHeroEls = ['#ch-label', '#contact-page-heading', '#ch-role'];
    gsap.fromTo(contactHeroEls,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15, delay: 0.3 }
    );

    /* Contact photo */
    const photo = document.getElementById('contact-photo');
    if (photo) {
      gsap.fromTo(photo,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: photo, start: 'top 80%', once: true } }
      );
    }

    /* Info items stagger on scroll */
    const infoItems = document.querySelectorAll('#ci-heading, #ci-email, #ci-phone, #ci-location, #ci-linkedin');
    gsap.fromTo(infoItems,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.contact-info', start: 'top 80%', once: true }
      }
    );

    /* Form fields stagger on scroll */
    const formEls = document.querySelectorAll('.form-group, .btn-submit');
    gsap.fromTo(formEls,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '#form-wrap', start: 'top 80%', once: true }
      }
    );

    /* Input focus border glow via GSAP */
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        gsap.to(input, {
          boxShadow: '0 0 0 3px rgba(108,99,255,0.2), 0 0 16px rgba(108,99,255,0.15)',
          borderColor: 'rgba(108,99,255,1)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      input.addEventListener('blur', () => {
        if (!input.classList.contains('error')) {
          gsap.to(input, {
            boxShadow: 'none',
            borderColor: 'rgba(108,99,255,0.18)',
            duration: 0.3,
            ease: 'power2.inOut',
          });
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     14.  NAV ENTRANCE ON PAGE LOAD
     ───────────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    gsap.fromTo('#main-nav',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 }
    );
  }

  /* ─────────────────────────────────────────────────────────
     15.  CERT CARDS STAGGER REVEAL
     ───────────────────────────────────────────────────────── */
  // Handled via data-reveal="scale-in" above,
  // but we also animate them with a bit of delay between each
  const certCards = document.querySelectorAll('.cert-card');
  if (certCards.length && !prefersReducedMotion) {
    // Hover lift effect (GSAP)
    certCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -6, scale: 1.03, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     16.  CTA SECTION REVEAL (index.html)
     ───────────────────────────────────────────────────────── */
  if (!IS_CONTACT) {
    const ctaEls = document.querySelectorAll('#cta-inner [data-reveal]');
    if (ctaEls.length && !prefersReducedMotion) {
      gsap.fromTo(ctaEls,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: '#cta-inner', start: 'top 78%', once: true }
        }
      );
    }
  }

  /* ─────────────────────────────────────────────────────────
     17.  BACK TO TOP BUTTON
     ───────────────────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

}); // end ready()

