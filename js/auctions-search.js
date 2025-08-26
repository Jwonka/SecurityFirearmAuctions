document.addEventListener('DOMContentLoaded', () => {

  const heroImgs = document.querySelectorAll('.heroSlide');
  if (heroImgs.length > 1) {
    let i = 0;
    setInterval(() => {
      heroImgs[i].classList.remove('active');
      i = (i + 1) % heroImgs.length;
      heroImgs[i].classList.add('active');
    }, 5000);
  }

  const timers = new Map();

  function show(mediaEl, explicitIndex = null){
    const imgs = mediaEl.querySelectorAll('img');
    if (!imgs.length) return;
    const cur = [...imgs].findIndex(img => img.classList.contains('active'));
    const next = explicitIndex != null ? explicitIndex : (cur + 1) % imgs.length;
    imgs.forEach((img, k) => img.classList.toggle('active', k === next));
  }
  function start(mediaEl){ stop(mediaEl); timers.set(mediaEl, setInterval(() => show(mediaEl), 5000)); }
  function stop(mediaEl){ const t = timers.get(mediaEl); if (t){ clearInterval(t); timers.delete(mediaEl); } }

  document.querySelectorAll('.lotMedia').forEach(media => {
    start(media);
    media.addEventListener('mouseenter', () => stop(media));
    media.addEventListener('mouseleave', () => start(media));
  });

  document.addEventListener('click', (e) => {
    const prev = e.target.closest('.lotPrev');
    const next = e.target.closest('.lotNext');
    if (!prev && !next) return;

    const card  = (prev || next).closest('.lotCard');
    const media = card?.querySelector('.lotMedia');
    if (!media) return;

    const imgs = media.querySelectorAll('img');
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const n    = prev ? (cur - 1 + imgs.length) % imgs.length
                      : (cur + 1) % imgs.length;
    show(media, n);
  });
});
