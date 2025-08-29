document.addEventListener('DOMContentLoaded', () => {
  const timers = new Map();

  function show(mediaEl, explicit = null){
    const imgs = mediaEl.querySelectorAll('img');
    if (!imgs.length) return;
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const next = explicit != null ? explicit : (cur + 1) % imgs.length;
    imgs.forEach((img,k) => img.classList.toggle('active', k === next));
  }
  function start(mediaEl){ stop(mediaEl); timers.set(mediaEl, setInterval(() => show(mediaEl), 5000)); }
  function stop(mediaEl){ const t = timers.get(mediaEl); if (t){ clearInterval(t); timers.delete(mediaEl); } }

  // auto-advance + pause on hover (products + index hero)
  document.querySelectorAll('.productMedia, .bigImage .imageContainer').forEach(media => {
    if (media.closest('.categoryCard')) return;
    const imgs = media.querySelectorAll('img');
    if (imgs.length <= 1) return;                  // rotate only if 2+ images
    if (![...imgs].some(i => i.classList.contains('active'))) {
      imgs[0].classList.add('active');             // ensure one is active
    }
    start(media);
    media.addEventListener('mouseenter', () => stop(media));
    media.addEventListener('mouseleave', () => start(media));
  });
  
  // ◀ ▶ controls (event delegation)
  document.addEventListener('click', (e) => {
    const prev = e.target.closest('.prev');
    const next = e.target.closest('.next');
    if (!(prev || next)) return;

    const card  = (prev || next).closest('.productCard');
    const media = card?.querySelector('.productMedia');
    const imgs  = media?.querySelectorAll('img') ?? [];
    if (!imgs.length) return;

    const cur = [...imgs].findIndex(img => img.classList.contains('active'));
    const n   = prev ? (cur - 1 + imgs.length) % imgs.length : (cur + 1) % imgs.length;
    show(media, n);
  });
});
