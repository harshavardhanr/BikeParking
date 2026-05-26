/**
 * Cloudflare Worker — receives custom BikeParkLondon analytics events and
 * writes them to Workers Analytics Engine.
 *
 * Deploy: cd workers/analytics && npx wrangler deploy
 * Then set eventsWorkerUrl in index.html to the Worker URL.
 */

const ALLOWED_EVENTS = new Set([
  'app_loaded',
  'bay_clicked',
  'search',
  'borough_filter',
  'free_toggle',
  'geolocate',
  'directions',
  'ringgo',
  'directory_open',
  'info_open',
]);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: CORS_HEADERS });
    }

    const event = typeof body.event === 'string' ? body.event : '';
    if (!ALLOWED_EVENTS.has(event)) {
      return new Response('Unknown event', { status: 400, headers: CORS_HEADERS });
    }

    const props = body.props && typeof body.props === 'object' ? body.props : {};
    const borough = typeof props.borough === 'string' ? props.borough.slice(0, 80) : '';
    const fee = props.fee === 'yes' || props.fee === 'no' || props.fee === 'unknown' ? props.fee : '';
    const result = typeof props.result === 'string' ? props.result.slice(0, 32) : '';
    const enabled = props.enabled === true ? 'true' : props.enabled === false ? 'false' : '';

    env.BIKEPARK_EVENTS.writeDataPoint({
      blobs: [event, borough, fee, result, enabled],
      doubles: [1],
      indexes: ['bikepark'],
    });

    return new Response('ok', { headers: CORS_HEADERS });
  },
};
