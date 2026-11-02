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
  wall: {
    h: 427,
    marks: [{ n: 1, box: [14, 60, 362, 132] }],
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
  if (!board || !svg) return;

  const { h: vbHeight, marks } = board;
  svg.setAttribute('viewBox', `0 0 390 ${vbHeight}`);

  const maskId = `cut-${figure.dataset.board}`;
  const defs = document.createElementNS(SVG_NS, 'defs');
  const mask = document.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', maskId);
  const white = document.createElementNS(SVG_NS, 'rect');
  white.setAttribute('width', '390');
  white.setAttribute('height', String(vbHeight));
  white.setAttribute('fill', 'white');
  mask.append(white);

  marks.forEach((mark) => {
    const [x, y, w, h] = mark.box;
    const hole = document.createElementNS(SVG_NS, 'rect');
    hole.setAttribute('x', String(x - 4));
    hole.setAttribute('y', String(y - 4));
    hole.setAttribute('width', String(w + 8));
    hole.setAttribute('height', String(h + 8));
    hole.setAttribute('rx', '10');
    hole.setAttribute('fill', 'black');
    mask.append(hole);
  });
  defs.append(mask);
  svg.append(defs);

  const scrim = document.createElementNS(SVG_NS, 'rect');
  scrim.setAttribute('width', '390');
  scrim.setAttribute('height', String(vbHeight));
  scrim.setAttribute('class', 'scrim');
  scrim.setAttribute('mask', `url(#${maskId})`);
  svg.append(scrim);

  marks.forEach((mark, index) => {
    const [x, y, w, h] = mark.box;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', roughPath(x, y, w, h, 11 + index * 37 + figure.dataset.board.length));
    path.setAttribute('class', 'mark');
    path.dataset.mark = String(mark.n);
    path.style.setProperty('--delay', `${index * 160}ms`);
    svg.append(path);

    const pin = document.createElementNS(SVG_NS, 'g');
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('class', 'mark-pin');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '9.5');
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', 'mark-pin-label');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(y + 3.2));
    label.setAttribute('text-anchor', 'middle');
    label.textContent = String(mark.n);
    pin.append(circle, label);
    pin.style.setProperty('--delay', `${index * 160}ms`);
    svg.append(pin);

    path.dataset.length = String(path.getTotalLength ? path.getTotalLength() : 900);
    path.style.setProperty('--len', path.dataset.length);
  });

  // The notes under the phone light their mark, and the other way round.
  figure.querySelectorAll('.board-note').forEach((note) => {
    const id = note.dataset.mark;
    const path = svg.querySelector(`.mark[data-mark="${id}"]`);
    if (!path) return;
    const light = () => path.classList.add('lit');
    const dim = () => path.classList.remove('lit');
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

const WALK_STEPS = [
  'Wash the palak thoroughly under running water and drain.',
  'Heat ghee in a pan and add chopped garlic, green chilli and sliced onion.',
  'Add the washed palak and fresh coriander to the pan.',
  'Cover and cook until wilted, then transfer to a blender jar and blend to a smooth vibrant green puree.',
  'Heat ghee in the same pan and temper bayleaf, cardamom pods and cloves.',
  'Add finely chopped ginger, chopped tomato, jeera powder, coriander powder and garam masala and cook until soft and jammy.',
  'Add the blended palak puree, water, salt, kasuri methi and cream and simmer.',
  'Heat oil in a separate pan and brown the whole paneer block on all sides.',
  'Cut the browned paneer into cubes.',
  'Heat ghee for tadka and sizzle smashed garlic, dried red chillies, jeera and red chilli powder and pour over the curry.',
  'Add the paneer cubes to the gravy, drizzle with cream and serve.',
];

const DARK_INK = { stroke: '#f5efe6', crimson: '#c8372b', leaf: '#4ea882' };
const LIGHT_INK = { stroke: '#1c1614', crimson: '#9e281e', leaf: '#28664b' };

/* The app picks a drawing from the words in the step. So does this. */
function motionFor(text) {
  const t = text.toLowerCase();
  if (t.includes('serve') || t.includes('plate')) return 'plate';
  if (t.includes('chop') || t.includes('slice') || t.includes('cube')) return 'chop';
  if (t.includes('simmer') || t.includes('cook') || t.includes('heat') || t.includes('fry') || t.includes('temper')) return 'simmer';
  if (t.includes('blend') || t.includes('cover') || t.includes('add')) return 'fold';
  return 'plate';
}

const SHAPES = {
  plate: (c) => `<svg viewBox="0 0 256 256" fill="none">
    <ellipse cx="128" cy="134" rx="92" ry="74" stroke="${c.stroke}" stroke-width="9"/>
    <ellipse cx="128" cy="126" rx="70" ry="54" stroke="${c.stroke}" stroke-width="9"/>
    <circle cx="112" cy="120" r="25" fill="${c.crimson}"/>
    <path d="M112 96c-6-9-14-12-22-11 3 8 8 12 15 14-5 2-8 6-9 11 8 1 13-2 16-7 3 5 8 8 16 7-1-5-4-9-9-11 7-2 12-6 15-14-8-1-16 2-22 11z" fill="${c.leaf}"/>
    <path d="M152 140c11-12 27-15 37-8-9 14-26 18-37 8z" fill="${c.leaf}"/>
  </svg>`,
  chop: (c) => `<svg viewBox="0 0 256 256" fill="none" stroke="${c.stroke}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <rect x="26" y="158" width="204" height="52" rx="14"/>
    <path d="M132 40h48a16 16 0 0 1 16 16v56a16 16 0 0 1-16 16h-48Z" fill="${c.crimson}" stroke="${c.crimson}"/>
    <path d="M196 40l38 12v24l-38 8Z" fill="${c.stroke}" stroke="${c.stroke}"/>
    <circle cx="66" cy="140" r="9" fill="${c.leaf}" stroke="none"/>
    <circle cx="94" cy="124" r="7" fill="${c.stroke}" stroke="none"/>
    <circle cx="74" cy="112" r="5" fill="${c.stroke}" stroke="none"/>
  </svg>`,
  simmer: (c) => `<svg viewBox="0 0 256 256" fill="none" stroke="${c.stroke}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 116h184v58a44 44 0 0 1-44 44H80a44 44 0 0 1-44-44Z"/>
    <path d="M36 116c26 12 46-8 74 0s52 12 74 0" stroke="${c.crimson}"/>
    <path d="M74 92c0-14 14-14 14-30"/>
    <path d="M128 92c0-14 14-14 14-30"/>
    <path d="M182 92c0-14 14-14 14-30"/>
  </svg>`,
  fold: (c) => `<svg viewBox="0 0 256 256" fill="none" stroke="${c.stroke}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 118h188c0 46-38 80-94 80s-94-34-94-80Z"/>
    <ellipse cx="128" cy="118" rx="94" ry="16"/>
    <path d="M148 26l44 44-58 58"/>
    <ellipse cx="96" cy="146" rx="30" ry="16" fill="${c.leaf}" stroke="${c.leaf}"/>
  </svg>`,
};

function diagram(motion, colours) {
  return (SHAPES[motion] || SHAPES.plate)(colours);
}

const deck = document.getElementById('deck');
const walk = {
  card: document.getElementById('stepcard'),
  num: document.getElementById('step-num'),
  count: document.getElementById('step-count'),
  art: document.getElementById('step-art'),
  text: document.getElementById('step-text'),
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

if (walk.card && walk.rail) {
  let index = 0;
  let shared = false;

  const pad = (n) => String(n + 1).padStart(2, '0');

  WALK_STEPS.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(i + 1).padStart(2, '0');
    b.setAttribute('aria-label', `Step ${i + 1}`);
    b.addEventListener('click', () => go(i));
    walk.rail.append(b);
  });

  function paint(animate) {
    const text = WALK_STEPS[index];
    const motion = motionFor(text);

    walk.num.textContent = pad(index);
    walk.art.innerHTML = diagram(motion, DARK_INK);
    walk.text.textContent = text;
    walk.scNum.textContent = `Step ${pad(index)} of ${WALK_STEPS.length}`;
    walk.scArt.innerHTML = diagram(motion, LIGHT_INK);
    walk.scText.textContent = text;

    Array.from(walk.rail.children).forEach((b, i) => {
      b.setAttribute('aria-current', String(i === index));
    });

    walk.prev.disabled = index === 0;
    walk.next.disabled = index === WALK_STEPS.length - 1;

    if (animate && !reduceMotion) {
      walk.card.animate(
        [
          { opacity: 0.35, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  }

  function go(next) {
    const clamped = Math.max(0, Math.min(WALK_STEPS.length - 1, next));
    if (clamped === index) return;
    index = clamped;
    paint(true);
  }

  walk.prev.addEventListener('click', () => go(index - 1));
  walk.next.addEventListener('click', () => go(index + 1));

  walk.card.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
  });

  /* swipe on the card, the way the app moves between steps */
  let startX = null;
  let dx = 0;

  walk.card.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startX = event.clientX;
    dx = 0;
    walk.card.classList.add('is-dragging');
    walk.card.setPointerCapture(event.pointerId);
  });

  walk.card.addEventListener('pointermove', (event) => {
    if (startX === null) return;
    dx = event.clientX - startX;
    walk.card.style.transform = `translateX(${dx * 0.35}px)`;
  });

  const endDrag = () => {
    if (startX === null) return;
    walk.card.classList.remove('is-dragging');
    walk.card.style.transform = '';
    if (dx < -50) go(index + 1);
    else if (dx > 50) go(index - 1);
    startX = null;
    dx = 0;
  };

  walk.card.addEventListener('pointerup', endDrag);
  walk.card.addEventListener('pointercancel', endDrag);
  walk.card.addEventListener('pointerleave', endDrag);

  /* the sheet a shared step becomes */
  walk.share.addEventListener('click', () => {
    shared = !shared;
    walk.panel.dataset.open = String(shared);
    walk.sheet.dataset.open = String(shared);
    walk.sheet.setAttribute('aria-hidden', String(!shared));
    walk.share.textContent = shared ? 'Put the sheet away' : 'Share this step';
    walk.note.textContent = shared
      ? 'this is what leaves the app'
      : 'swipe, or use the arrow keys';
    const hint = document.getElementById('share-hint');
    if (hint) {
      hint.textContent = shared
        ? 'The sheet, ready to send.'
        : 'Tap “Share this step” to see the sheet.';
    }
  });

  paint(false);

  // `?share=1` opens the sheet, which is how it gets screenshotted.
  if (new URLSearchParams(window.location.search).get('share') === '1') {
    walk.share.click();
  }
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
