/**
 * BikeParkLondon analytics — Cloudflare Web Analytics + optional custom events.
 *
 * Configure in index.html via window.BIKEPARK_ANALYTICS:
 *   webAnalyticsToken — from Cloudflare Dashboard → Web Analytics → Manage site
 *   eventsWorkerUrl   — URL of the deployed workers/analytics Worker (optional)
 *
 * Custom events also forward to Cloudflare Zaraz when zaraz.track() is available
 * on a Cloudflare-proxied custom domain.
 */
(function () {
  'use strict';

  const CONFIG = window.BIKEPARK_ANALYTICS || {};
  const WEB_TOKEN = (CONFIG.webAnalyticsToken || '').trim();
  const EVENTS_URL = (CONFIG.eventsWorkerUrl || '').trim();

  const ALLOWED_PROP_KEYS = new Set(['borough', 'fee', 'enabled', 'result', 'source']);

  function sanitizeProps(props) {
    const out = {};
    if (!props || typeof props !== 'object') return out;
    for (const [key, value] of Object.entries(props)) {
      if (!ALLOWED_PROP_KEYS.has(key)) continue;
      if (key === 'borough' && typeof value === 'string') {
        out.borough = value.slice(0, 80);
      } else if (key === 'fee' && (value === 'yes' || value === 'no' || value === 'unknown')) {
        out.fee = value;
      } else if (key === 'enabled' && typeof value === 'boolean') {
        out.enabled = value;
      } else if (key === 'result' && typeof value === 'string') {
        out.result = value.slice(0, 32);
      } else if (key === 'source' && typeof value === 'string') {
        out.source = value.slice(0, 40);
      }
    }
    return out;
  }

  function initWebAnalytics() {
    if (!WEB_TOKEN || document.querySelector('script[data-cf-beacon]')) return;
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: WEB_TOKEN, spa: false }));
    document.body.appendChild(script);
  }

  function trackEvent(eventName, props) {
    if (typeof eventName !== 'string' || !eventName) return;
    const safeProps = sanitizeProps(props);

    if (typeof window.zaraz !== 'undefined' && typeof window.zaraz.track === 'function') {
      window.zaraz.track(eventName, safeProps);
    }

    if (!EVENTS_URL) return;

    fetch(EVENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, props: safeProps }),
      keepalive: true,
    }).catch(function () {
      /* analytics must never break the app */
    });
  }

  window.trackEvent = trackEvent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebAnalytics);
  } else {
    initWebAnalytics();
  }
})();
