document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'white'; } };
  const setError = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'yellow'; } };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = $('email').value.trim();
    const password = $('password').value.trim();

    // reset
    resetLabel('emailLabel','Email:');
    resetLabel('passwordLabel','Password:');
    $('email').removeAttribute('aria-invalid');
    $('password').removeAttribute('aria-invalid');

    let valid = true, firstBad = null;

    if (!email || !emailRe.test(email)) {
      setError('emailLabel','Valid Email (required):');
      $('email').setAttribute('aria-invalid','true');
      firstBad = firstBad || $('email');
      valid = false;
    }
    if (!password) {
      setError('passwordLabel','Password (required):');
      $('password').setAttribute('aria-invalid','true');
      firstBad = firstBad || $('password');
      valid = false;
    }

    if (!valid) { firstBad?.focus(); return; }

    const user = auth.get();
    if (!user || (user.email || '').toLowerCase() !== email.toLowerCase()) {
      setError('emailLabel','Email not found (demo):');
      $('email').setAttribute('aria-invalid','true');
      $('email').focus();
      return;
    }
    
    const valid = await auth.verify(email, pw);
    if (!valid) {
      setError('passwordLabel','Incorrect email or password (demo):');
      $('password').setAttribute('aria-invalid','true');
      $('password').focus();
      return;
    }
    
    alert('Logged in (demo).');
    
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
