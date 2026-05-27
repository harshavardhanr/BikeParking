# BikeParkLondon — development log

Summary of work on the **BikeParkLondon** map app (`harshavardhanr/BikeParking`), covering **26–27 May 2026**.

Live site: [https://bikeparklondon.uk](https://bikeparklondon.uk) (custom domain) · GitHub Pages source: [https://github.com/harshavardhanr/BikeParking](https://github.com/harshavardhanr/BikeParking)

---

## Overview

BikeParkLondon is a static web app that maps **1,608** solo motorcycle parking bays across London (from OpenStreetMap via `data/parking_data.js`). Users can search by postcode or place, filter by borough and free/paid bays, view borough rules, and open bay details with directions.

---

## 26 May 2026 — Core features & fixes

### Map & markers

- Switched base tiles from **CartoDB Dark Matter** to **CartoDB Voyager** (clearer street names).
- Markers use **`Bike.png`** as the pin image; tap target enlarged to **55×55px** for reliable mobile taps.
- **Marker cluster** behaviour retained; clustering disables at zoom 16+.
- Map **centres on the user’s location at startup** (silent — no alert if permission denied).

### Search & filters

- **Autocomplete search** via Nominatim (postcode, street, place) with a suggestion dropdown.
- Placeholder: *“Search postcode, street or place…”*
- **Custom clear (×) button** with 44px touch target; hidden until the input has text.
- Search input uses `type="text"` and proper headers so reverse geocoding / Nominatim requests succeed.
- **Borough filter** and **Free Only** toggle; Free Only no longer re-zooms the map (only filters visible markers).
- Borough filter change re-fits the map to the selected borough.

### Details panel

- **Address subheading** under the bay title via reverse geocoding (Nominatim), with **copy-to-clipboard**; shows coordinates while loading.
- **Navigate with Google Maps** and **Pay with RingGo** buttons placed **above** the borough rules card.
- RingGo button shown when `fee === 'yes'` and the borough uses RingGo (`boroughUsesRingGo()` in `app.js`).
- Panel uses **`.is-open` class + backdrop** (not Popover API) for reliable behaviour on iOS.
- Desktop details panel: **left side, vertically centred**.

### Branding & top bar

- Renamed to **BikeParkLondon** (removed old MotoPark branding and logo icon from header).
- Added tagline: **“Find motorcycle parking bays”**
- Widened search bar (`94%` / max `1080px`) so **Free Only** stays on one line on desktop.
- **Mobile:** compact brand row — title left, tagline right; brand block visible at top of search bar.

### About / info

- **Info (ⓘ) floating button** opens an About panel with:
  - Experimental-site disclaimer
  - Data sources (OpenStreetMap, Nominatim, Carto, Google Maps)
  - Notes on borough rules accuracy
  - Analytics privacy note

### Floating controls

- Three FABs (bottom-right): **geolocate**, **borough rules directory**, **info**.
- FAB size reduced ~20% (40px desktop / 38px mobile).

### Deployment

- **GitHub Actions** workflow (`.github/workflows/deploy-pages.yml`) deploys **`main`** to GitHub Pages on push.

### Regressions fixed (same day)

- **`index.html` regression:** RingGo work had accidentally restored an old HTML snapshot (MotoPark, missing clear button). Restored correct BikeParkLondon markup.
- **`styles.css` truncation:** Full stylesheet restored when partial edits dropped hundreds of lines; RingGo button styles re-applied.
- Search clear button and placeholder fixes redeployed.

---

## 26 May 2026 — UI polish (later commits)

### Map zoom controls

- Increased vertical gap between **search bar** and **Leaflet zoom controls** by ~50% at each breakpoint (measured in browser):
  - Desktop: gap ~2px → ~3px
  - Tablet (≤992px): fixed overlap with stacked search bar
  - Mobile (≤576px): tuned offsets; extra rule at ≤430px when layout wraps taller

### Mobile details panel

- When a bay is tapped, map centres on the marker and the details sheet **anchors 20px below the pin**, extending to the bottom of the screen so **both bay and panel are visible**.
- Map pans automatically on short viewports to preserve the 20px gap.
- **Dismiss fix:** panel slides straight down from its anchored position (layout reset deferred until after close animation).
- Removed **drag-handle affordance** (grey bar) on bottom sheets — no pull-down behaviour implemented.

### Tagline typography

- Final sizing: **desktop** `0.72rem` (unchanged); **mobile** `calc(0.62rem + 1pt)` (+1pt only on mobile).

---

## 26–27 May 2026 — Analytics (Cloudflare)

### Implemented in code

- **`analytics.js`** — loads Cloudflare Web Analytics beacon when `webAnalyticsToken` is set; optional custom events via Worker URL or Zaraz.
- **`app.js`** — `trackEvent()` hooks for: `app_loaded`, `bay_clicked`, `search`, `borough_filter`, `free_toggle`, `geolocate`, `directions`, `ringgo`, `directory_open`, `info_open`. No postcodes or coordinates sent in events.
- **`workers/analytics/`** — optional Cloudflare Worker writing to **Workers Analytics Engine** dataset `bikepark_events`.
- **`docs/ANALYTICS.md`** — setup guide for Web Analytics + Worker.

### Configured

- **`webAnalyticsToken`:** `autumn-boat-a7bb` (in `index.html` → `window.BIKEPARK_ANALYTICS`).

### Deferred (not set up yet)

- **`eventsWorkerUrl`** — Worker deploy (`npx wrangler deploy` in `workers/analytics/`) held off for now. Page-view analytics works without it; interaction events are not stored until the Worker is deployed and the URL is added.

---

## 27 May 2026 — Custom domain & fixes

### Custom domain

- **`CNAME`** file in repo: `bikeparklondon.uk`
- GitHub Pages custom domain configured for **bikeparklondon.uk**
- DNS at GoDaddy: apex **A records** (four GitHub IPs) and **www** CNAME → `harshavardhanr.github.io`

### HTTPS note

- GitHub **Enforce HTTPS** requires all four apex A records and DNS check success; certificate can take up to 24 hours after DNS is correct.
- **Geolocation** requires a valid HTTPS context — blocked on plain HTTP or before cert is issued.

### Info panel desktop fix

- Info panel had **mobile/tablet CSS only**; on desktop it opened invisibly (no position/size rules).
- Added desktop layout: right-side card at `top: 100px`, `right: 30px`, 420px wide, slide-in from right (same slot as directory panel).

---

## Key files

| File | Role |
|------|------|
| `index.html` | Structure, search bar, panels, analytics config |
| `app.js` | Map, markers, search, panels, geolocation, analytics events |
| `styles.css` | Layout, responsive breakpoints, panel animations |
| `data/parking_data.js` | 1,608 parking bay records |
| `analytics.js` | Cloudflare Web Analytics + event forwarding |
| `workers/analytics/` | Optional custom-events Worker |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deploy |
| `CNAME` | Custom domain `bikeparklondon.uk` |
| `docs/ANALYTICS.md` | Cloudflare setup instructions |
| `docs/CHANGELOG.md` | This log |

---

## Architecture notes

- **Panels:** `#details-panel`, `#directory-panel`, `#info-panel` use `.is-open` on `#panel-backdrop`; outside-tap dismiss via document click listener (not map click).
- **Mobile details:** `.is-anchored` + `--details-panel-top` CSS variable set after map centres on selected bay.
- **Search geocoding:** Nominatim with `User-Agent: BikeParkLondonApp/1.0 (contact: …)` for both search and reverse geocode.
- **Borough policies:** `BOROUGH_POLICIES` in `app.js` (33 London areas).

---

## Pending / follow-up

- [ ] Deploy Cloudflare Worker and set `eventsWorkerUrl` (see `docs/ANALYTICS.md`)
- [ ] Confirm **Enforce HTTPS** on GitHub Pages once DNS/certificate is stable
- [ ] Optional: redirect apex ↔ www at GoDaddy or Cloudflare
- [ ] Optional: move DNS to Cloudflare for simpler analytics + HTTPS management

---

## Related PR

Initial batch merged via **`cursor/increase-zoom-gap-f0de`** → [PR #3](https://github.com/harshavardhanr/BikeParking/pull/3) (zoom gap, tagline, mobile panel anchoring, drag handle removal, dismiss fix).
