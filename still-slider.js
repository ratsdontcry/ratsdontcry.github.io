// Film stills slider: one picture at a time. Swiping or scrolling sideways
// moves between them (the browser snaps to each picture); clicking shows the
// next one, wrapping from the last back to the first. The caption under it
// keeps count, e.g. "2 / 5".
document.querySelectorAll('.slider').forEach(slider => {
  const slides = slider.querySelectorAll('img');
  const count = slider.parentElement.querySelector('.slider-count');
  const current = () => Math.round(slider.scrollLeft / slider.clientWidth);

  const show = i => slider.scrollTo({ left: i * slider.clientWidth, behavior: 'smooth' });

  slider.addEventListener('click', () => show((current() + 1) % slides.length));
  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') show(Math.min(current() + 1, slides.length - 1));
    if (event.key === 'ArrowLeft') show(Math.max(current() - 1, 0));
  });
  slider.addEventListener('scroll', () => {
    if (count) count.textContent = `${current() + 1} / ${slides.length}`;
    // the stills moved sideways, so let nav-contrast.js recheck what is behind the nav
    dispatchEvent(new Event('scroll'));
  }, { passive: true });
});
