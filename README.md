# Security Firearm Auctions — Demo Website
> **Demo only. Not for use, reuse, or redistribution.**
>
> This repository is a static front-end demonstration for an auction/retail site (firearms domain).
> It showcases layout, navigation, responsive UI, dropdowns, galleries, and client-side form UX.
> It **does not** process payments or create real accounts.
> **No backend. No real sales.**

## Usage & License

**All rights reserved.** No license is granted.  
**Copying, modifying, redistributing, or using any part of this code in other projects is not permitted.**  
Viewing the source in your browser is fine.
No support, no warranties, no guarantees.

> If you’re unsure whether your intended use is allowed, it isn’t.

## What’s inside

**Pages**

- index.html – homepage with search bar (filters retail items; redirects to auctions on “auction” queries).

- about.html – about (stub)

- contact.html – contact form (client-side validation)

- checkout.html – checkout form (prefilled when “logged in”, client-side validation)

- login.html & register.html – demo auth flows using localStorage

- privacy.html - privacy policy (HTML)

- conditions.html - terms & conditions (HTML)

- auctions.html - current & past auctions + search (filters or shows “not found” message).
  
- sell.html - selling overview, seller contact form + download/open PDF + Fill Out Online CTA.

- consignment-form.html - full online consignment intake (multi-item, image previews, validation).
  
- bid.html = how to bid + mini FAQ.
  
- faqs.html - FAQs & user agreement style notes.
  
**Assets & code**

- CSS/styles.css - site styles (fluid typography via clamp(), grid/flex, dropdowns, gallery, forms).

- js/auth.js - tiny localStorage “auth” helper (auth.get(), auth.loggedIn(), auth.clear()).

- js/login.js, js/register.js - set/validate demo profile in localStorage.

- js/contact.js - contact form validation.

- js/checkout.js - requires demo login, prefills profile, validates.

- js/cart.js - demo cart API exposed as window.demoCart used by “Add to cart” buttons.

- js/index-search.js - homepage search: filters items inline; redirects to auctions.html?q=... when applicable.

- js/consignment.js - online consignment form: multi-item rows, image preview (no upload), validation.

- js/sell.js - seller contact form validation.

- docs/Security_Firearm_Auctions_Consignment_Agreement.pdf - printable consignment PDF.

- Bootstrap Icons via CDN.

**Design highlights**

- Top-level nav labels don’t change color on hover, submenus do (CSS specificity)

- Fluid typography (clamp()), responsive gallery, consistent form styling (.contact, .formInput, .messageButton, .button)

- Footer links centered with gap control (flex/grid)

**How it works (demo logic)**

- Auth: localStorage only. A simple profile (name/email/etc.) is saved on register/login.
- Checkout & consignment can prefill from this profile.

- Cart: demo add-to-cart via window.demoCart.add({ id, name, price, qty }); no persistence guaranteed.

- Search:

  - index.html: filters visible gallery items by text; if it looks like an auction query, redirects to auctions.html?q=....

  - auctions.html: filters current/past lists; shows a “no results” message when nothing matches.

- Consignment form:

  - Multi-item rows (add/remove) with basic fields and client-side image previews (up to 5 images/item, size/type checks).

  - No file uploads (GitHub Pages). Images never leave the browser in this demo.

- Links: Same-site legal pages open in the same tab (you can add target="_blank" rel="noopener" if you prefer new tabs).

**Known limitations (by design)**

- No backend → no real auth, no payments, no email sending.

- All data persistence is browser-local (localStorage).

- Validation is client-side only; regexes are intentionally permissive for demo UX.
  
- Image inputs only preview; nothing is transmitted or stored.

Accessibility notes

- Top-level menu items function as dropdown labels; they’re non-links. For production, consider <button>s with keyboard handling and ARIA attributes.

- Legal text pages use a readable width (~70ch) and consistent spacing.

- Color changes on validation include text updates, not just color, where possible.

Future upgrades

- Deploy to Netlify/Vercel/Cloudflare Pages with serverless functions.

- Real auth (Auth0, Firebase Auth) + hosted payment forms with a firearms-friendly PSP.

- FFL handling and compliance checks (age/ID, background check workflows).

- Accessible, keyboard-navigable dropdowns and focus management.
