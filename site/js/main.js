/* Shoku landing page.
 *
 * Four pieces of behaviour, and nothing else:
 *   1. the annotation layer drawn over the real screenshots
 *   2. the assistant tabs, and the apply that turns v1 into v2
 *   3. the fridge matcher, which is the app's own arithmetic
 *   4. the scroll reveals
 *
 * The annotations live in the app's own coordinate space, 390 x 844, the size
 * the screenshots were taken at. That is why they stay glued to the row they
 * point at no matter how wide the phone is drawn.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------- annotation */

const BOARDS = {
  dish: {
    h: 844,
    marks: [
      { n: 1, box: [16, 412, 358, 46] },
      { n: 2, box: [16, 290, 358, 66] },
    ],
  },
  share: {
    w: 720,
    h: 1600,
    marks: [{ n: 1, box: [148, 1206, 112, 148] }],
  },
  cook: {
    h: 467,
    marks: [
      { n: 1, box: [16, 326, 358, 100] },
      { n: 2, box: [250, 281, 88, 44] },
    ],
  },
  fridge: {
    h: 469,
    marks: [{ n: 1, box: [14, 126, 362, 146] }],
  },
};

const SVG_NS = 'http://www.w3.org/2000/svg';

function seeded(seed) {
  let s = seed | 0 || 7;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 2000) / 2000;
  };
}

function mid(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/* A rounded rectangle walked at a slightly unsteady hand. */
function roughPath(x, y, w, h, seed) {
  const rnd = seeded(seed);
  const steps = 30;
  const jitter = 2.2;
  const perimeter = 2 * (w + h);
  const points = [];

  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * perimeter;
    let px;
    let py;
    if (t < w) {
      px = x + t;
      py = y;
    } else if (t < w + h) {
      px = x + w;
      py = y + (t - w);
    } else if (t < 2 * w + h) {
      px = x + w - (t - w - h);
      py = y + h;
    } else {
      px = x;
      py = y + h - (t - 2 * w - h);
    }
    points.push([px + (rnd() - 0.5) * jitter, py + (rnd() - 0.5) * jitter]);
  }

  const start = mid(points[points.length - 1], points[0]);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    const m = mid(points[i], next);
    d += ` Q ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

function drawBoard(figure) {
  const board = BOARDS[figure.dataset.board];
  const svg = figure.querySelector('.marks');
  const img = figure.querySelector('img');
  if (!board || !svg || !img) return;

  const vbWidth = board.w || 390;
  const { h: vbHeight, marks } = board;
  const uid = figure.dataset.board;
  svg.setAttribute('viewBox', `0 0 ${vbWidth} ${vbHeight}`);

  const defs = document.createElementNS(SVG_NS, 'defs');

  // the window: a hole in the soft focus layer
  const mask = document.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', `hole-${uid}`);
  mask.innerHTML = `<rect width="${vbWidth}" height="${vbHeight}" fill="white"/>`;
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
  blur.innerHTML = '<feGaussianBlur stdDeviation="5"/>';
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

  // everything outside the window falls back: blurred, dimmed, held behind glass
  const soft = document.createElementNS(SVG_NS, 'image');
  soft.setAttribute('href', img.getAttribute('src'));
  soft.setAttribute('width', vbWidth);
  soft.setAttribute('height', vbHeight);
  soft.setAttribute('preserveAspectRatio', 'none');
  soft.setAttribute('filter', `url(#soft-${uid})`);
  soft.setAttribute('mask', `url(#hole-${uid})`);
  soft.setAttribute('class', 'soft-layer');
  svg.append(soft);

  const veil = document.createElementNS(SVG_NS, 'rect');
  veil.setAttribute('width', String(vbWidth));
  veil.setAttribute('height', String(vbHeight));
  veil.setAttribute('class', 'veil');
  veil.setAttribute('mask', `url(#hole-${uid})`);
  svg.append(veil);

  marks.forEach((mark, index) => {
    const [x, y, w, h] = mark.box;

    const halo = document.createElementNS(SVG_NS, 'rect');
    halo.setAttribute('x', String(x));
    halo.setAttribute('y', String(y));
    halo.setAttribute('width', String(w));
    halo.setAttribute('height', String(h));
    halo.setAttribute('rx', '12');
    halo.setAttribute('class', 'window-halo');
    halo.setAttribute('filter', `url(#glow-${uid})`);
    svg.append(halo);

    const frame = document.createElementNS(SVG_NS, 'rect');
    frame.setAttribute('x', String(x));
    frame.setAttribute('y', String(y));
    frame.setAttribute('width', String(w));
    frame.setAttribute('height', String(h));
    frame.setAttribute('rx', '12');
    frame.setAttribute('class', 'window');
    frame.style.setProperty('--delay', `${index * 140}ms`);
    frame.dataset.mark = String(mark.n);
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

  // The notes under the phone light their window, and the other way round.
  figure.querySelectorAll('.board-note').forEach((note) => {
    const frame = svg.querySelector(`.window[data-mark="${note.dataset.mark}"]`);
    if (!frame) return;
    const light = () => frame.classList.add('lit');
    const dim = () => frame.classList.remove('lit');
    note.addEventListener('mouseenter', light);
    note.addEventListener('focus', light);
    note.addEventListener('mouseleave', dim);
    note.addEventListener('blur', dim);
  });
}

document.querySelectorAll('.board').forEach(drawBoard);

/* ------------------------------------------------------------ assistant */

const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));

function selectTab(tab) {
  tabs.forEach((other) => {
    const open = other === tab;
    other.setAttribute('aria-selected', String(open));
    const panel = document.getElementById(other.getAttribute('aria-controls'));
    if (panel) {
      panel.dataset.open = String(open);
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    }
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});

panels.forEach((panel) => {
  if (panel.dataset.open !== 'true') panel.setAttribute('hidden', '');
});

// A panel can be linked to directly, which the page itself does not need but
// a screenshot or a support reply does.
const wanted = new URLSearchParams(window.location.search).get('panel');
if (wanted) {
  const tab = document.getElementById(`tab-${wanted}`);
  if (tab) selectTab(tab);
}

const apply = document.getElementById('apply');
if (apply) {
  apply.addEventListener('click', () => {
    const strip = document.getElementById('version-strip');
    const note = document.getElementById('apply-note');
    apply.disabled = true;
    apply.textContent = 'Applied as v2';

    if (strip) {
      strip.innerHTML = ''
        + '<span>versions</span>'
        + '<span class="vchip">v1</span>'
        + '<span class="vchip is-head">v2</span>'
        + '<span>· v1 kept in history</span>';
    }
    if (note) {
      note.textContent = 'One version written. v1 is still there, and pressing v1 brings it back.';
    }
  });
}

/* -------------------------------------------------------------- matcher */

const matcherItems = Array.from(document.querySelectorAll('.item'));
const haveOut = document.getElementById('m-have');
const buyOut = document.getElementById('m-buy');
const TOTAL = 23;
const ON_LIST = 1;

if (matcherItems.length && haveOut && buyOut) {
  const sync = () => {
    const have = matcherItems.filter((item) => item.dataset.on === '1').length;
    haveOut.textContent = String(have);
    buyOut.textContent = String(TOTAL - have - ON_LIST);
  };

  matcherItems.forEach((item) => {
    const toggle = () => {
      const on = item.dataset.on === '1';
      item.dataset.on = on ? '0' : '1';
      item.setAttribute('aria-pressed', on ? 'false' : 'true');
      item.querySelector('.bx').textContent = on ? '' : '×';
      sync();
    };
    item.addEventListener('click', toggle);
  });

  sync();
}

/* -------------------------------------------------------------- reveals */

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
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
  );
  revealables.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------- step walker */

/* Four steps of this cook: the app's screen, and the photo it became. */
const COOK_STEPS = [
  {
    n: 1,
    shot: 'assets/shots/cook-app-01.jpg',
    photo: 'assets/cooks/spinach.jpg',
    alt: 'Cook mode at step one: wash the palak.',
    text: 'Wash the palak thoroughly under running water and drain.',
  },
  {
    n: 4,
    shot: 'assets/shots/cook-app-04.jpg',
    photo: 'assets/cooks/puree.jpg',
    alt: 'Cook mode at step four: blend the palak to a puree.',
    text: 'Cover and cook until wilted, then transfer to a blender jar and blend to a smooth vibrant green puree.',
  },
  {
    n: 8,
    shot: 'assets/shots/cook-app-08.jpg',
    photo: 'assets/cooks/pan.jpg',
    alt: 'Cook mode at step eight: brown the paneer.',
    text: 'Heat oil in a separate pan and brown the whole paneer block on all sides.',
  },
  {
    n: 11,
    shot: 'assets/shots/cook-app-11.jpg',
    photo: 'assets/cooks/plate.jpg',
    alt: 'Cook mode at step eleven: add the paneer and serve.',
    text: 'Add the paneer cubes to the gravy, drizzle with cream and serve.',
  },
];

const duo = {
  shot: document.getElementById('app-shot'),
  photo: document.getElementById('cook-photo'),
  num: document.getElementById('duo-step'),
  text: document.getElementById('duo-text'),
  rail: document.getElementById('rail'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  share: document.getElementById('share'),
  note: document.getElementById('share-note'),
  panel: document.getElementById('sharePanel'),
  sheet: document.getElementById('sharecard'),
  scNum: document.getElementById('sc-num'),
  scArt: document.getElementById('sc-art'),
  scText: document.getElementById('sc-text'),
};

if (duo.shot && duo.rail) {
  let index = 0;
  let shared = false;

  const pad = (n) => String(n).padStart(2, '0');

  COOK_STEPS.forEach((step, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = pad(step.n);
    b.setAttribute('aria-label', `Step ${step.n}`);
    b.addEventListener('click', () => go(i));
    duo.rail.append(b);
  });

  function paint(animate) {
    const step = COOK_STEPS[index];

    duo.shot.src = step.shot;
    duo.shot.alt = step.alt;
    duo.photo.src = step.photo;
    duo.num.textContent = pad(step.n);
    duo.text.textContent = step.text;
    duo.scNum.textContent = `Step ${pad(step.n)} of 11`;
    duo.scArt.src = step.photo;
    duo.scText.textContent = step.text;

    Array.from(duo.rail.children).forEach((b, i) => {
      b.setAttribute('aria-current', String(i === index));
    });

    duo.prev.disabled = index === 0;
    duo.next.disabled = index === COOK_STEPS.length - 1;

    if (animate && !reduceMotion) {
      duo.photo.animate(
        [
          { opacity: 0.25, transform: 'scale(1.015)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      duo.shot.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
  }

  function go(next) {
    const clamped = Math.max(0, Math.min(COOK_STEPS.length - 1, next));
    if (clamped === index) return;
    index = clamped;
    paint(true);
  }

  duo.prev.addEventListener('click', () => go(index - 1));
  duo.next.addEventListener('click', () => go(index + 1));

  duo.share.addEventListener('click', () => {
    shared = !shared;
    duo.panel.dataset.open = String(shared);
    duo.sheet.dataset.open = String(shared);
    duo.sheet.setAttribute('aria-hidden', String(!shared));
    duo.share.textContent = shared ? 'Put the sheet away' : 'Share this step';
    duo.note.textContent = shared
      ? 'this is what leaves the app'
      : 'four steps · the arrow keys work';
  });

  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea')) return;
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  });

  paint(false);
}

/* --------------------------------------------------------- mobile menu */

const menuToggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

if (menuToggle && menu) {
  const links = Array.from(menu.querySelectorAll('a'));
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    links.forEach((link, i) => {
      link.style.transitionDelay = open ? `${Math.min(i * 50, 300)}ms` : '0ms';
    });
  };
  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
}
