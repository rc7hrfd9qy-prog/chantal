/* =============================================================
   CHANTAL MARTINEAU — main.js
   Navigation, scroll animations, and interactivity
   ============================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     NAVIGATION — sticky + hamburger
  ---------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll behaviour: add .scrolled after 80px
  const onScroll = () => {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile hamburger toggle
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !expanded);
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ----------------------------------------------------------
     REVEAL ANIMATIONS — IntersectionObserver
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     ACTIVE NAV LINK on scroll
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  const activeLinkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav__link[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => activeLinkObserver.observe(s));

  /* ----------------------------------------------------------
     CONTACT FORM — basic validation + feedback
  ---------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      // Simple validation
      if (!name || !email || !message) {
        showFormMessage(form, 'Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage(form, 'Please enter a valid email address.', 'error');
        return;
      }

      // Simulate submission (replace with real endpoint when ready)
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        showFormMessage(
          form,
          'Thank you for reaching out! I\'ll be in touch within 48 hours.',
          'success'
        );
        form.reset();
      }, 1200);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFormMessage(form, message, type) {
    // Remove existing message
    const existing = form.querySelector('.form-message');
    if (existing) existing.remove();

    const el = document.createElement('p');
    el.className = 'form-message';
    el.textContent = message;
    el.style.cssText = `
      font-size: 0.875rem;
      padding: 0.85rem 1rem;
      border-radius: 2px;
      margin-top: 0.5rem;
      ${type === 'success'
        ? 'color: #4a6741; background: rgba(74,103,65,0.15); border: 1px solid rgba(74,103,65,0.3);'
        : 'color: #c44c4c; background: rgba(196,76,76,0.12); border: 1px solid rgba(196,76,76,0.25);'}
    `;
    form.appendChild(el);

    if (type === 'success') {
      setTimeout(() => el.remove(), 6000);
    }
  }

  /* ----------------------------------------------------------
     SMOOTH ANCHOR SCROLL with offset for fixed nav
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     BOOK COVER 3D hover — subtle rotation on mousemove
  ---------------------------------------------------------- */
  document.querySelectorAll('.book-card__cover-art').forEach(cover => {
    cover.addEventListener('mousemove', (e) => {
      const rect = cover.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0–1
      const y = (e.clientY - rect.top) / rect.height;   // 0–1
      const rotX = (y - 0.5) * -10; // -5 to 5 deg
      const rotY = (x - 0.5) * 14;  // -7 to 7 deg
      cover.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.02)`;
    });

    cover.addEventListener('mouseleave', () => {
      cover.style.transform = 'rotateY(-8deg) rotateX(2deg)';
    });
  });

  /* ----------------------------------------------------------
     PUBLICATION NAMES — subtle stagger entrance
  ---------------------------------------------------------- */
  const pubNames = document.querySelectorAll('.pub-name');
  pubNames.forEach((name, i) => {
    name.style.transitionDelay = `${i * 30}ms`;
    name.style.transition = 'color 0.3s ease, opacity 0.4s ease';
    name.style.opacity = '0';
  });

  const pubObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          pubNames.forEach((name, i) => {
            setTimeout(() => { name.style.opacity = '1'; }, i * 40);
          });
          pubObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const pubGrid = document.querySelector('.publications__grid');
  if (pubGrid) pubObserver.observe(pubGrid);

})();
