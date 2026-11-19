# Nightly city research checklist

The goal of a nightly run is to ship **one useful city page**, not a long list of unverified names. Adding a city means adding one file under `data/cities/` and rebuilding.

## 1. Pick the city

Choose a place people actually search when they need storage they can reach after hours, climate-controlled units, or a month-to-month lease. Prefer metros with recurring complaints and operator-owned facility pages.

Filename: `data/cities/<st>-<city>.json`  
Examples: `ny-new-york.json`, `ca-los-angeles.json`, `il-chicago.json`  
Use the two-letter state, lowercase, then a hyphen, then the city slug.

Copy `scripts/city.template.json` and fill it in.

## 2. Find candidates

Search for public pages, not hearsay:

- Official facility pages for Public Storage, Extra Space Storage, CubeSmart, Manhattan Mini Storage, StorQuest, and independents
- Operator locators, then the individual property page
- Neighbor or SpareFoot only as marketplace links in the affiliate box, unless the marketplace publishes a verifiable local street address you are treating as a listing

Skip a facility if you cannot find its own page with an address. Do not cache live vacancy; deep-link the operator’s page instead.

## 3. Verify every fact on a public page

For each listing, record only what the source says:

- Name, area, street address, phone, website, facility or reservation URL
- `accessHours` (gate / unit access) and `officeHours`, each day of the week
- Flags: `open24Hours`, `climateControl`, `monthToMonth`, `deliveriesAccepted`, `extendedAccessOnRequest`
- Fee notes, only if published, labeled “as listed on &lt;date&gt;”
- `sources[]` with a label and the exact URL
- `lastChecked` as today’s date (`YYYY-MM-DD`)

**Access hours vs office hours.** Copy both when the operator publishes both. If the source only publishes one clock, fill that clock and use `Not published` for the missing day’s hours on the other clock — do not invent “Closed.” Use `Closed` only when the operator publishes it.

**24-hour access** is true only when the published access hours are 24 hours, 24/7, or all day every day. A “24/7 Access Available” badge, “extended access,” or “24-hour access available upon request” is not enough if the hours table is a shorter window. Record the badge or request rule in `accessHours.notes`.

**Climate control** is true only when that facility’s public page says climate-controlled storage is offered.

**Month-to-month** is true only when the facility page or a clearly applicable operator page says leases are month to month. Do not assume a brand-wide policy applies to a location that does not say it.

**Deliveries accepted** is true only when the facility page says deliveries are accepted.

**Extended access on request** is true when the page says 24-hour or extended access is available upon request or by asking a manager, and the published access table is not already 24 hours.

If two sources disagree, prefer the official facility page and say so in the hours notes. If you cannot verify a detail, omit it. If you cannot verify the facility at all, do not list it.

Do not call facilities just to fill a spreadsheet unless a later playbook says otherwise. This checklist is written so a pass can be done from public pages.

## 4. Aim for quality, not a quota

Ten to twenty solid listings is enough for a first city page. Fewer is fine if that is all that can be verified. Zero invented rows is the hard rule.

Write a short, honest `intro` for the city. Mention any focus (a borough, a side of town, a nearby city you included) instead of implying citywide coverage you did not research.

## 5. Build and check

```bash
npm run check
```

That command validates the JSON, builds the site, and fails if a required field is missing or an internal link is broken. If it passes, commit the new city file (and the built site stays out of git).

## 6. After publish

Update `lastUpdated` on the city file when listings change. On later nights, recrawl the oldest `lastChecked` dates before adding a second city, so pages do not rot. Recheck access hours, 24-hour claims, and month-to-month statements especially; those are the details that drift. Never snapshot live vacancy or current unit prices into the JSON as if they were current. If you quote a price, label it “as listed on &lt;date&gt;.”
