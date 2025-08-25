document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'white'; } };
  const setError  = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'yellow'; } };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', async (e) => {   // <-- async here
    e.preventDefault();

    const email = $('email')?.value.trim() || '';
    const password = $('password')?.value || '';

    resetLabel('emailLabel','Email:');
    resetLabel('passwordLabel','Password:');
    $('email')?.removeAttribute('aria-invalid');
    $('password')?.removeAttribute('aria-invalid');

    let ok = true, firstBad = null;

    if (!email || !emailRe.test(email)) {
      setError('emailLabel','Valid Email (required):');
      $('email')?.setAttribute('aria-invalid','true');
      firstBad = firstBad || $('email');
      ok = false;
    }
    if (!password) {
      setError('passwordLabel','Password (required):');
      $('password')?.setAttribute('aria-invalid','true');
      firstBad = firstBad || $('password');
      ok = false;
    }
    if (!ok) { firstBad?.focus(); return; }

    const passOk = await auth.verify(email, password);  // <-- correct var
    if (!passOk) {
      setError('passwordLabel','Incorrect email or password (demo):');
      $('password')?.setAttribute('aria-invalid','true');
      $('password')?.focus();
      return;
    }

    alert('Logged in (demo).');
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
