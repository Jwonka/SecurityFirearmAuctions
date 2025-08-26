document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'white'; } };
  const setError  = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'yellow'; } };
  const setRO = (id, v) => { const el = $(id); if (el) { el.value = v || ""; el.readOnly = true; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  if (!auth.loggedIn()) {
    alert('Demo: please log in to continue.');
    location.href = 'account.html?next=' + encodeURIComponent('checkout.html');
    return;
  }

  // prefill (read-only)
  const u = auth.get() || {};
  setRO('fName', u.firstName);
  setRO('lName', u.lastName);
  setRO('email', u.email);
  if ($('cEmail')) { $('cEmail').value = u.email || ''; $('cEmail').readOnly = true; }
  setRO('phone', u.phone);
  setRO('address1', u.address1);
  setRO('address2', u.address2);
  setRO('city', u.city);
  if ($('state')) { $('state').value = u.state || ''; $('state').disabled = true; }
  setRO('zip', u.zip);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fName    = $('fName')?.value.trim() || '';
    const lName    = $('lName')?.value.trim() || '';
    const email    = $('email')?.value.trim() || '';
    const cEmailV  = $('cEmail')?.value.trim() || '';
    const phone    = $('phone')?.value.trim() || '';
    const address1 = $('address1')?.value.trim() || '';
    const city     = $('city')?.value.trim() || '';
    const state    = $('state')?.value || '';
    const zip      = $('zip')?.value.trim() || '';
    const termsEl  = $('terms');
    const terms    = !!termsEl?.checked;

    ['fName','lName','email','cEmail','phone','address1','city','state','zip'].forEach(k => {
      const map = {
        fName:'First Name:', lName:'Last Name:', email:'Email:', cEmail:'Confirm Email:',
        phone:'Phone (optional):', address1:'Address Line 1:', city:'City:', state:'State:', zip:'ZIP Code:'
      };
      resetLabel(k + 'Label', map[k]);
    });
    const termsLabel = $('termsLabel'); if (termsLabel) termsLabel.style.color = 'white';

    let ok = true, firstBad = null;
    const bad = (id, msg, inputId) => { setError(id, msg); const el = $(inputId); if (!firstBad && el && !el.disabled) firstBad = el; ok = false; };

    if (!fName) bad('fNameLabel','First Name (required):','fName');
    if (!lName) bad('lNameLabel','Last Name (required):','lName');

    if (!email || !emailRe.test(email)) bad('emailLabel','Valid Email (required):','email');
    if (!cEmailV || !emailRe.test(cEmailV)) bad('cEmailLabel','Valid Confirm Email (required):','cEmail');
    if (email && cEmailV && email !== cEmailV) {
      bad('emailLabel',"Emails don't match:",'email');
      bad('cEmailLabel',"Emails don't match:",'cEmail');
    }

    if (phone && !phoneRe.test(phone)) bad('phoneLabel','Phone looks invalid:','phone');
    if (!address1) bad('address1Label','Address Line 1 (required):','address1');
    if (!city) bad('cityLabel','City (required):','city');
    if (!state) bad('stateLabel','State (required):','state');
    if (!zip || !zipRe.test(zip)) bad('zipLabel','ZIP Code (5 or 9 digits):','zip');

    if (!terms) { if (termsLabel) termsLabel.style.color = 'yellow'; ok = false; }

    if (!ok) { firstBad?.focus(); alert('Please fix the highlighted fields and try again.'); return; }

    if (window.demoCart?.get().length === 0) {
      alert('Your cart is empty. Add items before checkout.');
      return;
    }

    alert('Your order request has been sent successfully!');
    $('notes') && ($('notes').value = '');
    if (termsEl) termsEl.checked = false;

    // clear demo cart
    localStorage.removeItem('demo_cart');
  });
});
