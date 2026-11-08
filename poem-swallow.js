// Diaspora East Cinema: on a wide window the Du Fu poem is set as a swallow
// seen from below. The six English lines are the two wings: each line is a
// feather fanning out from the body, the first three to the left, the last
// three to the right, steeper towards the top. The three Chinese lines,
// written vertically, are the body and the forked tail. On narrower screens
// the poem stays a plain list of lines, one empty line between each.
const WIDE = matchMedia('(min-width: 1202px)');
const ROOT_GAP = 28;   // space between the wing roots and the body
const ROOT_STEP = 26;  // the feathers' roots sit this far apart down the body
const rad = deg => deg * Math.PI / 180;

document.querySelectorAll('.poem').forEach(poem => {
  const en = [...poem.querySelectorAll('.poem-en .l')];
  const cn = [...poem.querySelectorAll('.poem-cn .l')];
  if (en.length !== 6 || cn.length !== 3) return;

  function reset() {
    poem.classList.remove('swallow');
    poem.style.height = '';
    [...en, ...cn].forEach(l => { l.style.cssText = ''; });
  }

  function layout() {
    reset();
    if (!WIDE.matches) return;
    poem.classList.add('swallow');
    const W = poem.clientWidth;
    const lineH = en[0].offsetHeight;
    const w = en.map(l => l.offsetWidth);

    // angle that makes a line of width lw fit in the room it has (degrees)
    const fit = (lw, room) => lw <= room ? 0 : Math.acos(room / lw) * 180 / Math.PI;

    // left wing: lines 1-3, top feather steepest; the body sits just right
    // of the widest left feather
    const leftA = [36, 24, 12];
    const leftNeed = Math.max(...w.slice(0, 3).map((lw, i) => lw * Math.cos(rad(leftA[i]))));
    const bodyX = Math.min(leftNeed + ROOT_GAP, W * 0.62);
    // right wing: lines 4-6, steepened where needed to stay inside the column
    const room = W - bodyX - ROOT_GAP;
    const a6 = Math.max(18, fit(w[5], room));
    const a5 = Math.max(30, fit(w[4], room), a6 + 8);
    const a4 = Math.max(40, fit(w[3], room), a5 + 8);
    const rightA = [a4, a5, a6];

    // the highest feather tip decides where the roots start
    const rise = Math.max(
      ...w.slice(0, 3).map((lw, i) => lw * Math.sin(rad(leftA[i]))),
      ...w.slice(3).map((lw, i) => lw * Math.sin(rad(rightA[i])))
    );
    const rootTop = rise + lineH;

    en.forEach((l, i) => {
      const left = i < 3;
      const k = left ? i : i - 3;
      const a = left ? leftA[k] : rightA[k];
      const y = rootTop + k * ROOT_STEP - lineH;
      Object.assign(l.style, left
        ? { left: `${bodyX - ROOT_GAP - w[i]}px`, top: `${y}px`, transformOrigin: '100% 100%', transform: `rotate(${a}deg)` }
        : { left: `${bodyX + ROOT_GAP}px`, top: `${y}px`, transformOrigin: '0 100%', transform: `rotate(${-a}deg)` });
    });

    // body and tail: Chinese written top to bottom, read right to left.
    // Line 2 is the body, starting a little above the wings (the head);
    // lines 1 and 3 are the two tail feathers, splaying out below.
    const colW = cn[0].offsetWidth;
    const bodyTop = rootTop - 2 * lineH;
    const tailTop = rootTop + 3 * ROOT_STEP;
    const place = (l, x, top, a) => Object.assign(l.style, {
      left: `${x - colW / 2}px`, top: `${top}px`, transformOrigin: '50% 0', transform: `rotate(${a}deg)`,
    });
    place(cn[1], bodyX, bodyTop, 0);
    place(cn[0], bodyX + colW * 1.4, tailTop, -14);
    place(cn[2], bodyX - colW * 1.4, tailTop, 14);

    const tailLen = Math.max(cn[0].offsetHeight, cn[2].offsetHeight);
    poem.style.height = `${Math.ceil(Math.max(tailTop + tailLen * Math.cos(rad(14)), bodyTop + cn[1].offsetHeight)) + 8}px`;
  }

  WIDE.addEventListener('change', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  layout();
});
