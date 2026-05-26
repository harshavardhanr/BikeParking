# Analytics setup (Cloudflare)

BikeParkLondon uses **Cloudflare Web Analytics** for privacy-friendly page-view stats, and an optional **Cloudflare Worker** for custom interaction events (bay clicks, searches, filters, etc.).

No postcodes, coordinates, or search queries are sent — only coarse labels like borough name and fee type.

## 1. Page views — Cloudflare Web Analytics

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Web Analytics** → **Add a site**.
2. Enter your hostname (e.g. `harshavardhanr.github.io` or your custom domain).
3. Copy the **token** from **Manage site**.
4. In `index.html`, set `webAnalyticsToken` inside `window.BIKEPARK_ANALYTICS`:

```html
<script>
  window.BIKEPARK_ANALYTICS = {
    webAnalyticsToken: 'YOUR_TOKEN_HERE',
    eventsWorkerUrl: ''
  };
</script>
```

5. Deploy. Page views appear in **Web Analytics** within a few minutes.

## 2. Custom events — Workers Analytics Engine (optional)

Cloudflare Web Analytics does not support custom events yet. Deploy the included Worker to track app interactions.

```bash
cd workers/analytics
npx wrangler login
npx wrangler deploy
```

Copy the deployed Worker URL into `index.html`:

```html
eventsWorkerUrl: 'https://bikepark-analytics.YOUR_SUBDOMAIN.workers.dev'
```

### Query custom events

In Cloudflare dashboard → **Workers Analytics Engine** → SQL API, example:

```sql
SELECT
  blob1 AS event,
  blob2 AS borough,
  SUM(_sample_interval) AS count
FROM bikepark_events
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY event, borough
ORDER BY count DESC
```

### Events tracked

| Event | When | Properties |
|-------|------|--------------|
| `app_loaded` | Page ready | — |
| `bay_clicked` | Parking bay tapped | `borough`, `fee` |
| `search` | Search submitted | `result`: `success` / `no_results` |
| `borough_filter` | Borough dropdown changed | `borough` |
| `free_toggle` | Free Only toggled | `enabled` |
| `geolocate` | Locate-me used | `result`: `success` / `denied` |
| `directions` | Google Maps link clicked | `borough`, `fee` |
| `ringgo` | RingGo link clicked | `borough` |
| `directory_open` | Rules directory opened | — |
| `info_open` | About panel opened | — |

## 3. Custom domain on Cloudflare (optional)

If your site uses a Cloudflare-proxied custom domain with **Zaraz** enabled, `trackEvent()` also calls `zaraz.track()`. Create Zaraz triggers matching the event names above to forward data to your preferred tools.
