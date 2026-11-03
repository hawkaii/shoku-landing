/* Shoku — one page.
 *
 * Three pieces of behaviour and nothing else: the annotation window over the
 * hero screenshot, the three-step pair, and the scroll reveals.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------- the one mark */

const BOARDS = {
  dish: [{ n: 1, box: [16, 290, 358, 66] }],
};

function drawBoard(figure) {
  const marks = BOARDS[figure.dataset.board];
  const svg = figure.querySelector('.marks');
  const img = figure.querySelector('img');
  if (!marks || !svg || !img) return;

  const W = 390;
  const H = 844;
  const uid = figure.dataset.board;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const defs = document.createElementNS(SVG_NS, 'defs');

  const mask = document.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', `hole-${uid}`);
  mask.innerHTML = `<rect width="${W}" height="${H}" fill="white"/>`;
  marks.forEach(({ box: [x, y, w, h] }) => {
    mask.insertAdjacentHTML(
      'beforeend',
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="black"/>`,
    );
  });
  defs.append(mask);

  const blur = document.createElementNS(SVG_NS, 'filter');
  blur.setAttribute('id', `soft-${uid}`);
  blur.setAttribute('x', '-5%');
  blur.setAttribute('y', '-5%');
  blur.setAttribute('width', '110%');
  blur.setAttribute('height', '110%');
  blur.innerHTML = '<feGaussianBlur stdDeviation="3"/>';
  defs.append(blur);

  const glow = document.createElementNS(SVG_NS, 'filter');
  glow.setAttribute('id', `glow-${uid}`);
  glow.setAttribute('x', '-30%');
  glow.setAttribute('y', '-30%');
  glow.setAttribute('width', '160%');
  glow.setAttribute('height', '160%');
  glow.innerHTML =
    '<feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#c8372b" flood-opacity="0.5"/>';
  defs.append(glow);

  svg.append(defs);

  const soft = document.createElementNS(SVG_NS, 'image');
  soft.setAttribute('href', img.getAttribute('src'));
  soft.setAttribute('width', W);
  soft.setAttribute('height', H);
  soft.setAttribute('preserveAspectRatio', 'none');
  soft.setAttribute('filter', `url(#soft-${uid})`);
  soft.setAttribute('mask', `url(#hole-${uid})`);
  soft.setAttribute('class', 'soft-layer');
  svg.append(soft);

  const veil = document.createElementNS(SVG_NS, 'rect');
  veil.setAttribute('width', W);
  veil.setAttribute('height', H);
  veil.setAttribute('class', 'veil');
  veil.setAttribute('mask', `url(#hole-${uid})`);
  svg.append(veil);

  marks.forEach((mark, index) => {
    const [x, y, w, h] = mark.box;

    const halo = document.createElementNS(SVG_NS, 'rect');
    halo.setAttribute('x', x);
    halo.setAttribute('y', y);
    halo.setAttribute('width', w);
    halo.setAttribute('height', h);
    halo.setAttribute('rx', 12);
    halo.setAttribute('class', 'window-halo');
    halo.setAttribute('filter', `url(#glow-${uid})`);
    svg.append(halo);

    const frame = document.createElementNS(SVG_NS, 'rect');
    frame.setAttribute('x', x);
    frame.setAttribute('y', y);
    frame.setAttribute('width', w);
    frame.setAttribute('height', h);
    frame.setAttribute('rx', 12);
    frame.setAttribute('class', 'window');
    frame.style.setProperty('--delay', `${index * 140}ms`);
    svg.append(frame);

    const pin = document.createElementNS(SVG_NS, 'g');
    pin.setAttribute('class', 'window-pin');
    pin.style.setProperty('--delay', `${index * 140}ms`);
    pin.innerHTML =
      `<circle cx="${x}" cy="${y}" r="12.5" class="pin-ring"/>` +
      `<circle cx="${x}" cy="${y}" r="8.5" class="pin-dot"/>` +
      `<text x="${x}" y="${y + 3.4}" text-anchor="middle" class="pin-num">${mark.n}</text>`;
    svg.append(pin);
  });
}

document.querySelectorAll('.board').forEach(drawBoard);

/* -------------------------------------------------------- the pair */

const STEPS = [
  {
    n: 1,
    shot: 'assets/shots/cook-01.webp',
    photo: 'assets/cooks/spinach.webp',
    alt: 'Cook mode at step one: wash the palak.',
    text: 'Wash the palak thoroughly under running water and drain.',
  },
  {
    n: 4,
    shot: 'assets/shots/cook-04.webp',
    photo: 'assets/cooks/puree.webp',
    alt: 'Cook mode at step four: blend the palak to a puree.',
    text: 'Cover and cook until wilted, then transfer to a blender jar and blend to a smooth vibrant green puree.',
  },
  {
    n: 11,
    shot: 'assets/shots/cook-11.webp',
    photo: 'assets/cooks/pan.webp',
    alt: 'Cook mode at step eleven: add the paneer and serve.',
    text: 'Add the paneer cubes to the gravy, drizzle with cream and serve.',
  },
];

const pair = {
  shot: document.getElementById('app-shot'),
  photo: document.getElementById('cook-photo'),
  step: document.getElementById('pair-step'),
  text: document.getElementById('pair-text'),
  steps: document.getElementById('steps'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
};

if (pair.shot && pair.steps) {
  let index = 0;
  const pad = (n) => String(n).padStart(2, '0');

  STEPS.forEach((step, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = pad(step.n);
    b.setAttribute('aria-label', `Step ${step.n}`);
    b.addEventListener('click', () => go(i));
    pair.steps.append(b);
  });

  function paint(animate) {
    const step = STEPS[index];
    pair.shot.src = step.shot;
    pair.shot.alt = step.alt;
    pair.photo.src = step.photo;
    pair.step.textContent = pad(step.n);
    pair.text.textContent = step.text;

    Array.from(pair.steps.children).forEach((b, i) => {
      b.setAttribute('aria-current', String(i === index));
    });
    pair.prev.disabled = index === 0;
    pair.next.disabled = index === STEPS.length - 1;

    if (animate && !reduceMotion) {
      pair.photo.animate(
        [
          { opacity: 0.3, transform: 'scale(1.012)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      pair.shot.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
  }

  function go(next) {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    if (clamped === index) return;
    index = clamped;
    paint(true);
  }

  pair.prev.addEventListener('click', () => go(index - 1));
  pair.next.addEventListener('click', () => go(index + 1));

  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea')) return;
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  });

  paint(false);
}

/* ------------------------------------------------------------ reveals */

const revealables = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  revealables.forEach((el) => observer.observe(el));
}
