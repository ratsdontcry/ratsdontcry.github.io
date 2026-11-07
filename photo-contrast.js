// Home and Info pages: the photo fills the window (background-size: cover, centred,
// fixed), so what sits behind Works / Info depends on the window size.
// Read how bright the photo is behind each link and switch the link to
// porcelain white when that part is dark.
const PHOTO = 'assets/background-breakfast.jpg';
// nav links and the Index link sit in different spots, so each group is judged on its own
const groups = ['.site-nav', '.site-index']
  .map(sel => document.querySelector(sel))
  .filter(Boolean)
  .map(box => ({ box, links: box.querySelectorAll(':scope > a') }));

const photo = new Image();
photo.src = PHOTO;
photo.onload = () => {
  // a small copy is plenty for judging light vs dark
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = Math.round(256 * photo.height / photo.width);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

  function brightnessBehind(box) {
    // where the photo lands on screen with background-size: cover, centred
    const scale = Math.max(innerWidth / canvas.width, innerHeight / canvas.height);
    const offsetX = (innerWidth - canvas.width * scale) / 2;
    const offsetY = (innerHeight - canvas.height * scale) / 2;
    const x = Math.max(0, Math.floor((box.left - offsetX) / scale));
    const y = Math.max(0, Math.floor((box.top - offsetY) / scale));
    const w = Math.max(1, Math.min(canvas.width - x, Math.ceil(box.width / scale)));
    const h = Math.max(1, Math.min(canvas.height - y, Math.ceil(box.height / scale)));
    const px = ctx.getImageData(x, y, w, h).data;
    let sum = 0;
    for (let i = 0; i < px.length; i += 4) sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    return sum / (px.length / 4);
  }

  function update() {
    try {
      // links in one group (works + info) always share one colour
      groups.forEach(({ box, links }) => {
        const dark = brightnessBehind(box.getBoundingClientRect()) < 140;
        links.forEach(link => link.classList.toggle('on-dark', dark));
      });
    } catch (e) {
      // the browser refuses to read the photo when the page is opened as a
      // local file; the links then just keep their normal colour
    }
  }

  addEventListener('resize', update);
  update();
};
