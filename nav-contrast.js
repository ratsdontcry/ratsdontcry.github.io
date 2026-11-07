// Switch the name, the nav links next to it, the Index titles (and the email
// under the name, where there is one) to porcelain white only while they sit
// on a dark part of a picture, where the dark gray would disappear.
// Dark parts are marked on each <img> with data-dark="from-to,from-to",
// as fractions of the picture's height (0 = top edge, 1 = bottom edge).
const labels = document.querySelectorAll('.site-id a, .site-nav a, .index-toggle, .index-list a');
const pictures = [...document.querySelectorAll('img[data-dark]')];

function darkBands(img) {
  const r = img.getBoundingClientRect();
  return img.dataset.dark.split(',').map(band => {
    const [from, to] = band.split('-').map(Number);
    return { left: r.left, right: r.right, top: r.top + from * r.height, bottom: r.top + to * r.height };
  });
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function update() {
  labels.forEach(label => {
    const box = label.getBoundingClientRect();
    const onDark = pictures.some(img => darkBands(img).some(band => overlaps(box, band)));
    label.classList.toggle('on-dark', onDark);
  });
}

addEventListener('scroll', update, { passive: true });
addEventListener('resize', update);
addEventListener('load', update);
update();
