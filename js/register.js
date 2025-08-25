document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const reset = (id, text) => { const el=$(id); if (el) { el.textContent=text; el.style.color='white'; } };
  const err   = (id, text) => { const el=$(id); if (el) { el.textContent=text; el.style.color='yellow'; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fName     = $('fName')?.value.trim() || '';
    const lName     = $('lName')?.value.trim() || '';
    const emailReg  = $('emailReg')?.value.trim() || '';
    const cEmail    = $('cEmail')?.value.trim() || '';
    const phone     = $('phone')?.value.trim() || '';
    const address1  = $('address1')?.value.trim() || '';
    const address2  = $('address2')?.value.trim() || '';
    const city      = $('city')?.value.trim() || '';
    const state     = $('state')?.value || '';
    const zip       = $('zip')?.value.trim() || '';
    const terms     = $('terms')?.checked || false;
    const password  = $('passwordReg')?.value || '';
    const password2 = $('password2')?.value || '';

    // reset labels
    reset('fNameLabel','First Name:');
    reset('lNameLabel','Last Name:');
    reset('emailRegLabel','Email:');
    reset('cEmailLabel','Confirm Email:');
    reset('phoneLabel','Phone (optional):');
    reset('address1Label','Address Line 1:');
    reset('address2Label','Address Line 2 (optional):');
    reset('cityLabel','City:');
    reset('stateLabel','State:');
    reset('zipLabel','ZIP Code:');
    reset('passwordRegLabel','Password:');
    reset('password2Label','Confirm Password:');
    const termsLabel = $('termsLabel'); if (termsLabel) termsLabel.style.color = 'white';

    let ok = true, firstBad = null;
    const bad = (id, msg, inputId) => { err(id, msg); firstBad ??= $(inputId); ok = false; };

    if (!fName) bad('fNameLabel','First Name (required):','fName');
    if (!lName) bad('lNameLabel','Last Name (required):','lName');

    if (!emailReg || !emailRe.test(emailReg)) bad('emailRegLabel','Valid Email (required):','emailReg');
    if (!cEmail   || !emailRe.test(cEmail))   bad('cEmailLabel','Valid Confirm Email (required):','cEmail');
    if (emailReg && cEmail && emailReg !== cEmail) {
      bad('emailRegLabel',"Emails don't match:",'emailReg');
      bad('cEmailLabel',"Emails don't match:",'cEmail');
    }

    if (phone && !phoneRe.test(phone)) bad('phoneLabel','Phone looks invalid:','phone');

    if (!address1) bad('address1Label','Address Line 1 (required):','address1');
    if (!city)     bad('cityLabel','City (required):','city');
    if (!state)    bad('stateLabel','State (required):','state');
    if (!zip || !zipRe.test(zip)) bad('zipLabel','ZIP Code (5 or 9 digits):','zip');

    // password policy (demo)
    const pwErrors = [];
    if (password.length < 8) pwErrors.push('8+ chars');
    if (!/[A-Z]/.test(password)) pwErrors.push('1 uppercase');
    if (!/[a-z]/.test(password)) pwErrors.push('1 lowercase');
    if (!/\d/.test(password))    pwErrors.push('1 number');
    if (!/[^\w\s]/.test(password)) pwErrors.push('1 symbol');
    if (pwErrors.length) bad('passwordRegLabel',`Password needs: ${pwErrors.join(', ')}`,'passwordReg');
    if (password !== password2) bad('password2Label','Passwords must match:','password2');

    if (!terms) { if (termsLabel) termsLabel.style.color = 'yellow'; ok = false; }

    if (!ok) { firstBad?.focus(); alert('Please fix the highlighted fields and try again.'); return; }

    // Save full demo profile
    auth.set({
      firstName: fName,
      lastName:  lName,
      email:     emailReg,
      phone,
      address1,
      address2,
      city,
      state,
      zip
    });
    await auth.setPassword(password);

    alert('Demo account created locally. You are now “logged in”.');
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
