// Album Cover page: clicking a song title opens Spotify's embedded player
// right under that caption, so the song plays on this site instead of
// sending people to Spotify. Clicking the title again closes it, and opening
// one player closes any other. Without JavaScript the title is still a plain
// link to the track on Spotify.
const songLinks = document.querySelectorAll('figcaption a[href*="open.spotify.com/track/"]');

function closePlayer(link) {
  const player = link.closest('figcaption').nextElementSibling;
  if (player && player.classList.contains('song-player')) player.remove();
  link.classList.remove('is-playing');
}

songLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const isOpen = link.classList.contains('is-playing');
    songLinks.forEach(closePlayer);
    if (isOpen) return;

    const trackId = new URL(link.href).pathname.split('/').pop();
    const player = document.createElement('iframe');
    player.className = 'song-player';
    player.src = `https://open.spotify.com/embed/track/${trackId}?theme=0`;
    player.title = `${link.textContent} on Spotify`;
    player.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    player.loading = 'lazy';
    link.closest('figcaption').after(player);
    link.classList.add('is-playing');
  });
});
