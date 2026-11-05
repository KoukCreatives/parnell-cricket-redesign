# Parnell Cricket Club – Redesign Prototype

Static HTML/CSS/JS prototype for the Parnell Cricket Club website rebuild, by Kouk Creatives.
It's platform-neutral on purpose: the same components map to Webflow (Symbols + CMS) or WordPress (block theme + custom post types).

**Visual direction:** inspired by the [Goal Webflow template](https://goal-template.webflow.io/) – dark base, condensed uppercase display type (Anton), Inter Tight body, pill navigation and buttons, rounded light panels. Recoloured to Parnell maroon `#7B1516` and crest gold `#D4AB55`. This is original code, not a copy of the template.

## Pages

| File | Status |
|---|---|
| `index.html` | Home – season bar, hero, 4 quick actions, stats, grades, events, news, coaching, contacts, sponsors |
| `juniors.html` | Parent-friendly junior page – basics, grades by school year, sign-up steps, what to bring, FAQs |

Other nav links point to the live site until those pages are built (see the agreed ~12-page structure).

## Brief points covered

- **One season message + sign-up button** – `SITE.season` in `assets/js/data.js` renders the bar on every page.
- **Parent-friendly junior page** – `juniors.html`.
- **Self-hiding events & news** – events disappear the day after they finish (weekly events roll to the next date); news drops off the homepage after `newsFreshDays` or a post's `hideAfter`. Sections hide entirely when empty.
- **NZ English, macrons, image descriptions** – `lang="en-NZ"`, Tāmaki Makaurau, every content image has alt text.
- **Sponsor logos link out** – `SITE.sponsors`.
- **Accessibility** – skip link, focus styles, AA contrast, reduced-motion support, auto-updating © year.

## Edit content

Everything volunteers change lives in `assets/js/data.js`. Dates are `YYYY-MM-DD`.

## Before launch

- Items tagged **TBC / Confirm** on `juniors.html` (season dates, fee, gear, payment plans) need checking with Zak.
- Images are hot-linked from the current Webflow CDN – move them into the new platform's media library.
- General Capital has no white logo yet (shown as a wordmark).

## Run locally

```
python3 -m http.server
```
then open http://localhost:8000.
