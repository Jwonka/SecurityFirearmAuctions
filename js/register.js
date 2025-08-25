document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const resetLabel = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'white'; } };
  const setError  = (id, text) => { const el = $(id); if (el) { el.textContent = text; el.style.color = 'yellow'; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  form.addEventListener('submit', async (e) => {   // <-- async
    e.preventDefault();

    const fName    = $('fName')?.value.trim() || '';
    const lName    = $('lName')?.value.trim() || '';
    const email    = $('email')?.value.trim() || '';
    const cEmail   = $('cEmail')?.value.trim() || '';
    const phone    = $('phone')?.value.trim() || '';
    const address1 = $('address1')?.value.trim() || '';
    const city     = $('city')?.value.trim() || '';
    const state    = $('state')?.value || '';
    const zip      = $('zip')?.value.trim() || '';
    const terms    = $('terms')?.checked || false;
    const password = $('password')?.value || '';
    const password2= $('password2')?.value || '';

    // reset labels (plus password labels)
    ['fName','lName','email','cEmail','phone','address1','city','state','zip','password','password2'].forEach(k => {
      const map = {
        fName:'First Name:', lName:'Last Name:', email:'Email:', cEmail:'Confirm Email:',
        phone:'Phone (optional):', address1:'Address Line 1:', city:'City:', state:'State:', zip:'ZIP Code:',
        password:'Password:', password2:'Confirm Password:'
      };
      resetLabel(k + 'Label', map[k]);
    });
    const termsLabel = $('termsLabel'); if (termsLabel) termsLabel.style.color = 'white';

    let ok = true, firstBad = null;
    const bad = (id, msg, inputId) => { setError(id, msg); firstBad = firstBad || $(inputId); ok = false; };

    if (!fName) bad('fNameLabel','First Name (required):','fName');
    if (!lName) bad('lNameLabel','Last Name (required):','lName');
    if (!email || !emailRe.test(email)) bad('emailLabel','Valid Email (required):','email');
    if (!cEmail || !emailRe.test(cEmail)) bad('cEmailLabel','Valid Confirm Email (required):','cEmail');
    if (email && cEmail && email !== cEmail) {
      bad('emailLabel',"Emails don't match:",'email');
      bad('cEmailLabel',"Emails don't match:",'cEmail');
    }
    if (phone && !phoneRe.test(phone)) bad('phoneLabel','Phone looks invalid:','phone');
    if (!address1) bad('address1Label','Address Line 1 (required):','address1');
    if (!city) bad('cityLabel','City (required):','city');
    if (!state) bad('stateLabel','State (required):','state');
    if (!zip || !zipRe.test(zip)) bad('zipLabel','ZIP Code (5 or 9 digits):','zip');

    // password policy (demo)
    const pwErrors = [];
    if (password.length < 8) pwErrors.push('8+ chars');
    if (!/[A-Z]/.test(password)) pwErrors.push('1 uppercase');
    if (!/[a-z]/.test(password)) pwErrors.push('1 lowercase');
    if (!/\d/.test(password))     pwErrors.push('1 number');
    if (!/[^\w\s]/.test(password)) pwErrors.push('1 symbol');
    if (pwErrors.length) bad('passwordLabel',`Password needs: ${pwErrors.join(', ')}`,'password');
    if (password !== password2) bad('password2Label','Passwords must match:','password2');

    if (!terms) { if (termsLabel) termsLabel.style.color = 'yellow'; ok = false; }

    if (!ok) { firstBad?.focus(); alert('Please fix the highlighted fields and try again.'); return; }

    const profile = { firstName:fName, lastName:lName, email, phone, address1,
                      address2:$('address2')?.value.trim() || '', city, state, zip };
    auth.set(profile);
    await auth.setPassword(password);

    alert('Demo account created locally. You are now “logged in”.');
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
