document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const reset = (id, text) => { const el=$(id); if (el){ el.textContent=text; el.style.color='white'; } };
  const err   = (id, text) => { const el=$(id); if (el){ el.textContent=text; el.style.color='yellow'; } };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  try { const u = window.auth?.get?.(); if (u?.email) $('email').value = u.email; } catch {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('email')?.value.trim() || '';
    const password = $('password')?.value || '';

    reset('emailLabel','Email:');
    reset('passwordLabel','Password:');
    $('email')?.removeAttribute('aria-invalid');
    $('password')?.removeAttribute('aria-invalid');

    let ok = true, firstBad = null;

    if (!email || !emailRe.test(email)) {
      err('emailLabel','Valid Email (required):');
      $('email')?.setAttribute('aria-invalid','true');
      firstBad = firstBad || $('email');
      ok = false;
    }
    if (!password) {
      err('passwordLabel','Password (required):');
      $('password')?.setAttribute('aria-invalid','true');
      firstBad = firstBad || $('password');
      ok = false;
    }
    if (!ok) { firstBad?.focus(); return; }

    const passOk = await auth.verify(email, password);
    if (!passOk) {
      err('passwordLabel','Incorrect email or password (demo):');
      $('password')?.setAttribute('aria-invalid','true');
      $('password')?.focus();
      return;
    }

    alert('Logged in (demo).');
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
