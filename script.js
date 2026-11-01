const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

document.documentElement.classList.add('js');

if (menuToggle && siteNav) {
  const closeMenu = (restoreFocus = false) => {
    siteNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

// Content stays visible by default, including when JavaScript or motion APIs are unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  const activeReveals = new Map();
  const revealTargets = document.querySelectorAll([
    '.hero-copy', '.hero-art', '.intro-content', '.section-heading > div',
    '.service-list', '.projects-heading', '.project-card', '.contact h2',
    '.detail-hero > div', '.detail-panel',
  ].join(', '));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (reducedMotion.matches || target.contains(document.activeElement)) return;

      const animation = target.animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 480,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });

      activeReveals.set(target, animation);
      const release = () => activeReveals.delete(target);
      animation.onfinish = release;
      animation.oncancel = release;
    });
  }, { threshold: 0.08 });

  revealTargets.forEach((target) => observer.observe(target));

  // Focused content is immediately visible; reveals never delay keyboard navigation.
  document.addEventListener('focusin', (event) => {
    revealTargets.forEach((target) => {
      if (target.contains(event.target)) {
        observer.unobserve(target);
        activeReveals.get(target)?.cancel();
      }
    });
  });

  const stopReveals = () => {
    observer.disconnect();
    activeReveals.forEach((animation) => animation.cancel());
    activeReveals.clear();
  };
  const onMotionChange = (event) => {
    if (event.matches) stopReveals();
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
  window.addEventListener('pagehide', stopReveals);
}


// Navigate the hero photos with arrows, keyboard, or a swipe.
const heroCarousel = document.querySelector('.hero-slideshow');
if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
  const status = heroCarousel.querySelector('.hero-slide-status');
  const descriptions = ['San Francisco hills', 'Waterfront harbor and hillside homes', 'Neighborhoods below Sutro Tower'];
  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    status.textContent = 'Photo ' + (current + 1) + ' of ' + slides.length + ': ' + descriptions[current];
  };
  heroCarousel.querySelector('.hero-previous').addEventListener('click', () => show(current - 1));
  heroCarousel.querySelector('.hero-next').addEventListener('click', () => show(current + 1));
  heroCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  let start;
  heroCarousel.addEventListener('touchstart', (event) => {
    start = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }, { passive: true });
  heroCarousel.addEventListener('touchend', (event) => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    start = undefined;
  }, { passive: true });
  heroCarousel.querySelector('.hero-carousel-controls').hidden = false;
}
