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
