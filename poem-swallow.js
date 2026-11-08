// Diaspora East Cinema: the Du Fu poem is poured into the silhouette of a
// swallow, a calligram. The swallow is drawn as a path (seen from below,
// wings spread, forked tail); every text row inside it is cut into the
// pieces that fall inside the bird, and the poem (English, then Chinese)
// runs through those pieces from top to bottom, letter after letter, with
// no regard for where the poem's own lines break. The type is small (a 64th
// of the width) and the poem starts again from the top until the bird is
// full. The plain lines stay in the page for screen readers and as the
// fallback when this script does not run.

// swallow outline, right half, in a 600 x 420 box; the left half is mirrored
const HALF = [
  [300, 66], [318, 70], [331, 86], [335, 110],                                    // head
  [370, 98], [420, 76], [470, 54], [520, 36], [565, 22], [600, 12],                // wing, leading edge
  [586, 40], [556, 72], [516, 106], [470, 142], [425, 174], [382, 200], [351, 216], // wing, trailing edge
  [346, 242], [340, 268],                                                         // body
  [356, 306], [370, 352], [382, 396], [389, 420],                                 // tail feather
  [370, 414], [348, 372], [324, 334], [300, 308],                                 // inside of the fork
];
const BOX_W = 600, BOX_H = 420;
const OUTLINE = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, y]) => [BOX_W - x, y])];
const FONT = '"Times New Roman", Times, serif';
const LEADING = 1.12;

document.querySelectorAll('.poem').forEach(poem => {
  const lines = [...poem.querySelectorAll('.l')].map(l => l.textContent.trim());
  if (!lines.length) return;
  const text = lines.join('  ') + '    ';

  const art = document.createElement('div');
  art.className = 'poem-art';
  art.setAttribute('aria-hidden', 'true');
  poem.appendChild(art);
  poem.classList.add('calligram');

  const measure = document.createElement('canvas').getContext('2d');

  // the bird as a pixel mask at the size it is shown
  function maskFor(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w); c.height = Math.ceil(h);
    const x = c.getContext('2d');
    x.scale(w / BOX_W, h / BOX_H);
    x.beginPath();
    OUTLINE.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
    x.closePath(); x.fill();
    const data = x.getImageData(0, 0, c.width, c.height).data;
    return (px, py) => px >= 0 && py >= 0 && px < c.width && py < c.height && data[(py * c.width + px) * 4 + 3] > 127;
  }

  // the stretches of one text row (top y, height lh) that lie inside the bird
  function spans(inside, w, y, lh) {
    const ys = [y + 1, y + lh / 2, y + lh - 1].map(Math.round);
    const out = [];
    let start = null;
    for (let px = 0; px <= w; px++) {
      const ok = px < w && ys.every(py => inside(px, py));
      if (ok && start === null) start = px;
      if (!ok && start !== null) { if (px - start > 4) out.push([start, px]); start = null; }
    }
    return out;
  }

  // pour the poem, round and round, into every row piece of the bird
  function pour(inside, w, h, size) {
    measure.font = `${size}px ${FONT}`;
    const lh = size * LEADING;
    const pieces = [];
    let i = 0;
    for (let y = 0; y + lh <= h; y += lh) {
      for (const [x0, x1] of spans(inside, w, y, lh)) {
        let t = '', used = 0;
        for (;;) {
          const ch = text[i % text.length];
          const cw = measure.measureText(ch).width;
          if (used + cw > x1 - x0) break;
          t += ch; used += cw; i++;
        }
        if (t) pieces.push({ x: x0, y, t });
      }
    }
    return pieces;
  }

  function layout() {
    const w = poem.clientWidth;
    const h = w * BOX_H / BOX_W;
    const size = Math.max(6.5, w / 64);
    const pieces = pour(maskFor(w, h), w, h, size);
    art.style.height = `${h}px`;
    art.style.fontSize = `${size}px`;
    art.style.lineHeight = `${size * LEADING}px`;
    art.replaceChildren(...pieces.map(p => {
      const s = document.createElement('span');
      s.textContent = p.t;
      s.style.cssText = `left:${p.x}px;top:${p.y}px`;
      return s;
    }));
  }

  let timer;
  addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(layout, 100); });
  if (document.fonts) document.fonts.ready.then(layout);
  layout();
});
