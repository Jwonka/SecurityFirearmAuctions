document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'white'; };
  const setError = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'yellow'; };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/; // loose US
  const zipRe = /^\d{5}(?:[-\s]\d{4})?$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fName = $('fName').value.trim();
    const lName = $('lName').value.trim();
    const email = $('email').value.trim();
    const cEmail = $('cEmail').value.trim();
    const phone = $('phone').value.trim();
    const address1 = $('address1').value.trim();
    const city = $('city').value.trim();
    const state = $('state').value.trim();
    const zip = $('zip').value.trim();
    const terms = $('terms').checked;

    resetLabel('fNameLabel', 'First Name:');
    resetLabel('lNameLabel', 'Last Name:');
    resetLabel('emailLabel', 'Email:');
    resetLabel('cEmailLabel', 'Confirm Email:');
    resetLabel('phoneLabel', 'Phone (optional):');
    resetLabel('address1Label', 'Address Line 1:');
    resetLabel('cityLabel', 'City:');
    resetLabel('stateLabel', 'State:');
    resetLabel('zipLabel', 'ZIP Code:');
    resetLabel('termsLabel', 'I agree to the Terms & Conditions and Privacy Policy.');

    let valid = true;
    let firstInvalid = null;

    const invalidate = (id, msg, inputId) => {
      setError(id, msg);
      if (!firstInvalid && $(inputId)) firstInvalid = $(inputId);
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
    if (!city) invalidate('cityLabel', 'City (required):', 'city');
    if (!state) invalidate('stateLabel', 'State (required):', 'state');

    if (!zip || !zipRe.test(zip)) invalidate('zipLabel', 'ZIP Code (5 or 9 digits):', 'zip');

    if (!terms) setError('termsLabel', 'You must agree to the Terms & Privacy to continue.');

    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    alert('Your order request has been sent successfully!');
    form.reset();
  });
});
