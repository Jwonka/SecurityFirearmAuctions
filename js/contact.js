document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const labelFor = (id) => document.querySelector(`label[for="${id}"]`);

  const reset = (id, base) => {
    const lab = labelFor(id);
    if (lab) { lab.textContent = base; lab.style.color = 'white'; }
  };
  const error = (id, text) => {
    const lab = labelFor(id);
    if (lab) { lab.textContent = text; lab.style.color = 'yellow'; }
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Prefill from auth (doesn't overwrite user input) ---
  const setIfEmpty = (id, val) => { const el = $(id); if (el && !el.value) el.value = val || ''; };
  try {
    if (window.auth?.loggedIn?.()) {
      const u = window.auth?.get?.();
      if (u) {
        if (!u.firstName && u.name) {
          const [first, ...rest] = String(u.name).trim().split(/\s+/);
          u.firstName = first; u.lastName = rest.join(' ');
        }
        setIfEmpty('fName', u.firstName);
        setIfEmpty('lName', u.lastName);
        setIfEmpty('email', u.email);
        setIfEmpty('cEmail', u.email);
      }
    }
  } catch { /* no-op */ }

  // Mirror email to confirm if confirm is empty
  $('email')?.addEventListener('blur', () => {
    const ce = $('cEmail');
    if (ce && !ce.value) ce.value = $('email').value.trim();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fName  = $('fName').value.trim();
    const lName  = $('lName').value.trim();
    const email  = $('email').value.trim();
    const cEmail = $('cEmail').value.trim();
    const msg    = $('message').value.trim();

    // Reset all labels to base text + white
    reset('fName',  'First Name:');
    reset('lName',  'Last Name:');
    reset('email',  'Email:');
    reset('cEmail', 'Confirm Email:');
    reset('message','Message:');

    let valid = true, firstBad = null;
    const invalidate = (id, text, focusId=id) => {
      error(id, text);
      if (!firstBad) firstBad = $(focusId);
      valid = false;
    };

    // Requireds
    if (!fName)  invalidate('fName',  'First Name (required):');
    if (!lName)  invalidate('lName',  'Last Name (required):');
    if (!emailRe.test(email))   invalidate('email',  'Valid Email (required):', 'email');
    if (!emailRe.test(cEmail))  invalidate('cEmail', 'Valid Confirm Email (required):', 'cEmail');
    if (email && cEmail && email !== cEmail) {
      invalidate('email',  "Emails don't match:", 'email');
      invalidate('cEmail', "Emails don't match:", 'cEmail');
    }
    if (!msg)    invalidate('message','Message (required):', 'message');

    if (!valid) {
      firstBad?.focus();
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    alert('Your message has been sent successfully!');
    form.reset();
  });
});
