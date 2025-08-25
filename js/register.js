document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'white'; } };
  const setError    = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'yellow'; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fName    = $('fName').value.trim();
    const lName    = $('lName').value.trim();
    const email    = $('email').value.trim();
    const cEmail   = $('cEmail').value.trim();
    const phone    = $('phone').value.trim();
    const address1 = $('address1').value.trim();
    const address2 = $('address2').value.trim();
    const city     = $('city').value.trim();
    const state    = $('state').value.trim();
    const zip      = $('zip').value.trim();
    const terms    = $('terms').checked;
    const notes    = $('notes').value.trim();

    resetLabel('fNameLabel', 'First Name:');
    resetLabel('lNameLabel', 'Last Name:');
    resetLabel('emailLabel', 'Email:');
    resetLabel('cEmailLabel', 'Confirm Email:');
    resetLabel('phoneLabel', 'Phone (optional):');
    resetLabel('address1Label', 'Address Line 1:');
    resetLabel('cityLabel', 'City:');
    resetLabel('stateLabel', 'State:');
    resetLabel('zipLabel', 'ZIP Code:');
    $('termsLabel').style.color = 'white';
    $('termsText').textContent = 'I agree to the Terms & Conditions and Privacy Policy.';

    let valid = true;
    let firstInvalid = null;
    const invalidate = (id, msg, inputId) => {
      setError(id, msg);
      const input = $(inputId);
      if (!firstInvalid && input) firstInvalid = input;
      valid = false;
    };

    if (!fName) invalidate('fNameLabel', 'First Name (required):', 'fName');
    if (!lName) invalidate('lNameLabel', 'Last Name (required):', 'lName');

    if (!email || !emailRe.test(email)) invalidate('emailLabel', 'Valid Email (required):', 'email');
    if (!cEmail || !emailRe.test(cEmail)) invalidate('cEmailLabel', 'Valid Confirm Email (required):', 'cEmail');
    if (email && cEmail && email !== cEmail) {
      invalidate('emailLabel', "Emails don't match:", 'email');
      invalidate('cEmailLabel', "Emails don't match:", 'cEmail');
    }

    if (phone && !phoneRe.test(phone)) invalidate('phoneLabel', 'Phone looks invalid:', 'phone');

    if (!address1) invalidate('address1Label', 'Address Line 1 (required):', 'address1');
    if (!city)     invalidate('cityLabel', 'City (required):', 'city');
    if (!state)    invalidate('stateLabel', 'State (required):', 'state');
    if (!zip || !zipRe.test(zip)) invalidate('zipLabel', 'ZIP Code (5 or 9 digits):', 'zip');

    if (!terms) { $('termsLabel').style.color = 'yellow'; $('termsText').textContent = 'You must agree to continue.'; valid = false; }

    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    auth.set({
      firstName: fName, lastName: lName, email, phone,
      address1, address2, city, state, zip, notes
    });

    alert('Demo account created locally. You are now “logged in”.');

    const next = new URLSearchParams(location.search).get('next') || 'checkout.html';
    location.href = next;
  });
});
