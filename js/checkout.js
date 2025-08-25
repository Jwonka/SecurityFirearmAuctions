document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'white'; };
  const setError = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'yellow'; };
  const setRO = (id, v) => { const el = $(id); if (el) { el.value = v || ""; el.readOnly = true; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  if (!auth.loggedIn()) {
    alert('Demo: please log in to continue.');
    location.href = 'login.html?next=' + encodeURIComponent('checkout.html');
    return;
  }

  const prefill = () => {
    const u = auth.get();
    setRO('fName', u.firstName);
    setRO('lName', u.lastName);
    setRO('email', u.email);
    const cEmailEl = $('cEmail'); if (cEmailEl) { cEmailEl.value = u.email; cEmailEl.readOnly = true; }
    setRO('phone', u.phone);
    setRO('address1', u.address1);
    setRO('address2', u.address2);
    setRO('city', u.city);
    if ($('state')) { $('state').value = u.state || ''; $('state').disabled = true; }
    setRO('zip', u.zip);
  };
  prefill();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fName    = $('fName').value.trim();
    const lName    = $('lName').value.trim();
    const email    = $('email').value.trim();
    const cEmailV  = $('cEmail').value.trim();
    const phone    = $('phone').value.trim();
    const address1 = $('address1').value.trim();
    const city     = $('city').value.trim();
    const state    = $('state').value.trim();
    const zip      = $('zip').value.trim();
    const terms    = $('terms').checked;

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

    let valid = true;
    let firstInvalid = null;
    const invalidate = (id, msg, inputId) => {
      setError(id, msg);
      const input = $(inputId);
      if (!firstInvalid && input && !input.disabled) firstInvalid = input;
      valid = false;
    };

    if (!fName) invalidate('fNameLabel', 'First Name (required):', 'fName');
    if (!lName) invalidate('lNameLabel', 'Last Name (required):', 'lName');

    if (!email || !emailRe.test(email)) invalidate('emailLabel', 'Valid Email (required):', 'email');
    if (!cEmailV || !emailRe.test(cEmailV)) invalidate('cEmailLabel', 'Valid Confirm Email (required):', 'cEmail');
    if (email && cEmailV && email !== cEmailV) {
      invalidate('emailLabel', "Emails don't match:", 'email');
      invalidate('cEmailLabel', "Emails don't match:", 'cEmail');
    }

    if (phone && !phoneRe.test(phone)) invalidate('phoneLabel', 'Phone looks invalid:', 'phone');

    if (!address1) invalidate('address1Label', 'Address Line 1 (required):', 'address1');
    if (!city) invalidate('cityLabel', 'City (required):', 'city');
    if (!state) invalidate('stateLabel', 'State (required):', 'state');

    if (!zip || !zipRe.test(zip)) invalidate('zipLabel', 'ZIP Code (5 or 9 digits):', 'zip');

    if (!terms) { $('termsLabel').style.color = 'yellow'; valid = false; }

    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    if (window.demoCart?.get().length === 0) {
      alert('Your cart is empty. Add items before checkout.');
      return;
    }

    alert('Your order request has been sent successfully!');
    $('notes')?.value = '';
    $('terms').checked = false;
    localStorage.removeItem('demo_cart');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });
});
