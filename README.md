# Security Firearm Auctions — Demo Website
> **Demo only. Not for use, reuse, or redistribution.**
>
> This repository is a static front-end demonstration for an auction/retail site (firearms domain).
> It showcases layout, navigation, responsive UI, dropdowns, galleries, and client-side form UX.
> It **does not** process payments or create real accounts.

## Usage & License

**All rights reserved.** No license is granted.  
**Copying, modifying, redistributing, or using any part of this code in other projects is not permitted.**  
Viewing the source in your browser is fine.
No support, no warranties, no guarantees.

> If you’re unsure whether your intended use is allowed, it isn’t.

## What’s inside

**Pages**

- index.html – landing/homepage

- about.html – about (stub)

- contact.html – contact form (client-side validation)

- checkout.html – checkout form (prefilled when “logged in”, client-side validation)

- login.html & register.html – demo auth flows using localStorage

- privacy.html – privacy policy (HTML)

- conditions.html – terms & conditions (HTML)

- auctions.html, retail.html, faq.html – placeholders for menu links

**Assets & code**

- CSS/styles.css – site styles (responsive, grid/flex, dropdowns, gallery)

- js/auth.js – tiny helper that stores a “user profile” in localStorage

- js/login.js – saves a demo profile and treats the user as “logged in”

- js/register.js – validates & saves a new demo profile

- js/contact.js – validates contact form

- js/checkout.js – requires demo login, prefills profile, validates, shows success

- Bootstrap Icons via CDN

**Design highlights**

- Top-level nav labels don’t change color on hover, submenus do (CSS specificity)

- Fluid typography (clamp()), responsive gallery, consistent form styling (.contact, .formInput, .messageButton, .button)

- Footer links centered with gap control (flex/grid)

Known limitations (by design)

- No backend → no real auth, no payments, no email sending.

- All data persistence is browser-local (localStorage).

- Validation is client-side only; regexes are intentionally permissive for demo UX.

Accessibility notes

- Top-level menu items function as dropdown labels; they’re non-links. For production, consider <button>s with keyboard handling and ARIA attributes.

- Legal text pages use a readable width (~70ch) and consistent spacing.

- Color changes on validation include text updates, not just color, where possible.

Future upgrades

- Deploy to Netlify/Vercel/Cloudflare Pages with serverless functions.

- Real auth (Auth0, Firebase Auth) + hosted payment forms with a firearms-friendly PSP.

- FFL handling and compliance checks (age/ID, background check workflows).

- Accessible, keyboard-navigable dropdowns and focus management.
