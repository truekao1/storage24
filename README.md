# Storage24

A small, fast, static directory of **self-storage facilities** that publishes **access hours separately from office hours**, and flags **climate control** and **month-to-month** terms only when the operator’s own page says so.

Brand name: **Storage24**. The public URL in `src/_data/site.js` is `https://truekao1.github.io/storage24`. The Eleventy path prefix is derived from that URL. Do not put a personal name on the site.

This is an independent directory, not a storage operator, landlord, or booking marketplace.

## Where it lives

Project path: `/workspace/sites/storage24`

Built files go to `dist/` and are published to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## How to build

```bash
npm install
npm run build        # writes dist/
npm start            # local preview
npm run check        # validates city JSON, builds, checks internal links and JSON-LD
```

The public base URL, contact mailbox, and affiliate links are all in one file: `src/_data/site.js`. Affiliate `url` values stay empty until a program issues a tracked link. Templates then fall back to each company’s public website and must not present that fallback as an affiliate URL. Individual facility pages are always plain public links.

## Data schema

Add a city by adding one file: `data/cities/<st>-<city>.json` (for example `data/cities/ny-new-york.json`). The nightly research checklist is in `scripts/new-city.md`. A starter file is in `scripts/city.template.json`.

Rules:

- Never invent a facility, hour, amenity, fee, phone, or flag.
- Every fact needs a public source URL and a `lastChecked` date.
- Record `accessHours` and `officeHours` separately. Use `Not published` for a missing day; do not invent “Closed.” Use `Closed` only when the operator publishes it.
- `open24Hours` is true only when published access hours are 24 hours, 24/7, or all day every day. A “24/7” badge or “upon request” note is not enough if the hours table is shorter.
- `climateControl` is true only when that facility’s page says climate-controlled storage is offered.
- `monthToMonth` is true only when the facility page or a clearly applicable operator page says leases are month to month.
- Do not cache live vacancy or current unit prices. If a price is quoted, label it “as listed on &lt;date&gt;.” Deep-link the operator’s page.
- If a site is down or a detail is unclear, leave the listing or the detail out.

## Launch content

- Home page
- Guide: “Need storage access at night? How 24-hour storage really works” (access vs office hours, 24-hour claims, climate control, and month-to-month terms)
- New York, NY — 13 verified facilities (Manhattan Mini Storage, CubeSmart, and Public Storage), last checked November 18, 2026, with a Manhattan, Long Island City, Brooklyn, and Staten Island focus
- Los Angeles, CA — 12 verified facilities (Public Storage, CubeSmart, and StorQuest), last checked November 18, 2026, with a West Los Angeles, Hollywood, Mid-City, Palms, Eagle Rock, University Park, Playa Vista, and South Los Angeles focus

None of the launch facilities published around-the-clock access hours. A few pages say 24-hour access is available upon request, or display a 24/7 badge beside a shorter hours table; those are noted on the listing, not flagged as 24-hour access.

## Affiliate programs

Application drafts (not sent) live in `AFFILIATES.md`. Program pages with first-party or carefully labeled network terms:

- Neighbor (primary): https://host.neighbor.com/affiliate/
- SpareFoot via FlexOffers (secondary, confirm in-network): https://about.sparefoot.com/partners and https://www.flexoffers.com/affiliate-programs/sparefoot-affiliate-program/

Public Storage, Extra Space, CubeSmart, Manhattan Mini Storage, and StorQuest facility links are plain public links, not affiliate offers. No official Public Storage or Extra Space publisher program with published terms was found in the November 18, 2026 research pass.

## Stack

Eleventy 3 builds plain HTML, CSS, and a small vanilla JS filter into `dist/`. Pages are mobile-first, with unique titles and meta descriptions, canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt`, breadcrumbs, an affiliate disclosure, and JSON-LD (`WebSite` / `ItemList` on the home page; `CollectionPage` + `ItemList` + `LocalBusiness`, `FAQPage`, and `BreadcrumbList` on city pages; `Article` and `FAQPage` on the guide).
