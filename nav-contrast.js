// The name, the nav links, Index and "top" are porcelain white on the dark
// page. When one of them sits over a light part of a picture (the light blue
// album cover, a white poster), it turns black so it stays readable; over a
// dark part, or over the page itself, it stays white. The picture under each
// label is read from a small copy of the image, so this works for every
// picture without marking anything by hand.
const labels = document.querySelectorAll('.site-id a, .site-nav a, .index-toggle, .back-to-top');
const copies = new Map(); // img src -> small canvas copy of the picture

function copyOf(img) {
  if (!img.complete || !img.naturalWidth) return null;
  let entry = copies.get(img.currentSrc || img.src);
  if (!entry) {
    const w = 80, h = Math.max(1, Math.round(80 * img.naturalHeight / img.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    try { x.drawImage(img, 0, 0, w, h); x.getImageData(0, 0, 1, 1); } catch (e) { return null; } // a local file: can't read
    entry = { x, w, h };
    copies.set(img.currentSrc || img.src, entry);
  }
  return entry;
}

// brightness (0-255) of the picture under one point of the screen, or null
// when there is no picture there
function brightnessAt(px, py) {
  const img = document.elementsFromPoint(px, py).find(el => el.tagName === 'IMG');
  if (!img) return null;
  // Framed posters have a wide black padding around the picture. Over that
  // frame the label sits on the frame's own colour, not on the picture, so
  // read the picture only inside its padding.
  const r = img.getBoundingClientRect();
  const s = getComputedStyle(img);
  const left = r.left + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth);
  const top = r.top + parseFloat(s.paddingTop) + parseFloat(s.borderTopWidth);
  const width = r.right - parseFloat(s.paddingRight) - parseFloat(s.borderRightWidth) - left;
  const height = r.bottom - parseFloat(s.paddingBottom) - parseFloat(s.borderBottomWidth) - top;
  if (px < left || px > left + width || py < top || py > top + height) {
    const bg = s.backgroundColor.match(/[\d.]+/g);
    if (!bg || (bg.length > 3 && +bg[3] === 0)) return null; // no frame colour: the page shows through
    return 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2];
  }
  const copy = copyOf(img);
  if (!copy) return null;
  const ix = Math.min(copy.w - 1, Math.max(0, Math.floor((px - left) / width * copy.w)));
  const iy = Math.min(copy.h - 1, Math.max(0, Math.floor((py - top) / height * copy.h)));
  const [red, green, blue] = copy.x.getImageData(ix, iy, 1, 1).data;
  return 0.299 * red + 0.587 * green + 0.114 * blue;
}

function update() {
  labels.forEach(label => {
    const b = label.getBoundingClientRect();
    if (!b.width) return;
    const y = b.top + b.height / 2;
    const samples = [b.left + 2, b.left + b.width / 2, b.right - 2]
      .map(x => brightnessAt(x, y))
      .filter(v => v !== null);
    const light = samples.length > 0 && samples.reduce((a, v) => a + v, 0) / samples.length > 150;
    label.classList.toggle('on-light', light);
  });
}

let pending = false;
function schedule() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; update(); });
}
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
addEventListener('load', schedule);
document.querySelectorAll('img').forEach(img => img.addEventListener('load', schedule));
schedule();
