/* Shoku landing page behaviour.
 *
 * Three things only: the mobile menu, the scroll reveals, and the word by
 * word tagline. Everything else is CSS. Motion respects the reduced motion
 * preference, and no work is attached to a raw scroll event.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- nav */

const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');
const menuLinks = menu ? Array.from(menu.querySelectorAll('a')) : [];

function setMenu(open) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.dataset.open = String(open);
  menu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  menuLinks.forEach((link, index) => {
    link.style.transitionDelay = open
      ? `${Math.min(60 * index, 400)}ms`
      : '0ms';
  });
}

if (toggle) {
  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
}
menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

/* ------------------------------------------------------------- reveals */

const revealables = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  revealables.forEach((el) => revealObserver.observe(el));
}

/* ------------------------------------------------------------- tagline */

const tagline = document.querySelector('[data-tagline]');

if (tagline) {
  const words = tagline.textContent.trim().split(/\s+/);

  if (reduceMotion || !('IntersectionObserver' in window)) {
    tagline.textContent = words.join(' ');
  } else {
    tagline.textContent = '';
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      tagline.append(span);
      if (index < words.length - 1) tagline.append(' ');
    });

    const wordObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('on');
          wordObserver.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -30% 0px' },
    );
    tagline.querySelectorAll('.word').forEach((word) => wordObserver.observe(word));
  }
}
