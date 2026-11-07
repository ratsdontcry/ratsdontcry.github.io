// Works page: "Index" in the nav opens a list of every work title; clicking a
// title scrolls the page to that work and closes the list. Other pages link
// here with #index, which opens the list straight away.
const toggle = document.querySelector('.index-toggle');
const list = document.querySelector('.index-list');

function setOpen(open) {
  list.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
}

toggle.addEventListener('click', event => {
  event.preventDefault();
  setOpen(list.hidden);
});

list.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  setOpen(false);
  const work = document.querySelector(link.getAttribute('href'));
  if (work) {
    work.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
  }
});

// a click anywhere else closes the list
document.addEventListener('click', event => {
  if (!list.hidden && !event.target.closest('.site-index')) setOpen(false);
});

if (location.hash === '#index') {
  setOpen(true);
  history.replaceState(null, '', location.pathname);
}

// "top" appears once the page has scrolled past the first screen and takes
// you back to the very top.
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const showWhenScrolled = () => { backToTop.hidden = scrollY < innerHeight * 0.6; };
  addEventListener('scroll', showWhenScrolled, { passive: true });
  showWhenScrolled();
  backToTop.addEventListener('click', event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: 'smooth' });
  });
}
