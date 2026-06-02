// London Motorbike Parking App Logic

// 1. Detailed database of motorcycle parking rules for all 33 London areas
const BOROUGH_POLICIES = {
  "City of London": {
    rules: "Motorcycle parking is free, but you must park only in dedicated solo motorcycle bays or designated public car parks. Parking in general car, loading, or disabled bays is strictly prohibited.",
    pricing: "Free of charge in dedicated motorcycle bays.",
    paymentApp: "None (Free)",
    permitDetails: "Not applicable.",
    highlights: ["Free in Dedicated Bays", "No Car Bays", "Time Limits in Some Bays"]
  },
  "Barking and Dagenham": {
    rules: "Motorcycles park for free in all dedicated motorcycle bays, pay-and-display bays, and shared-use bays. No permit is required to park in resident zones.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Resident Bays Free", "No Permit Needed"]
  },
  "Barnet": {
    rules: "Motorcycles can park for free in dedicated solo motorcycle bays, resident permit bays, pay-and-display bays, and shared-use bays without time limits.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Resident Bays Free", "No Time Limits"]
  },
  "Bexley": {
    rules: "Motorcycles park for free in dedicated motorcycle bays. Standard car tariffs and rules apply if parking in standard pay-and-display or shared-use bays.",
    pricing: "Free in dedicated bays; standard pay-and-display rates apply in general spaces.",
    paymentApp: "RingGo (for paid general bays)",
    permitDetails: "Resident permits are available for resident zones.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Brent": {
    rules: "Motorcycles can park for free in dedicated motorcycle bays, resident permit bays, and shared-use bays.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Resident Bays Free", "No Permit Needed"]
  },
  "Bromley": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply if parking in normal pay-and-display or car park spaces.",
    pricing: "Free in dedicated bays; standard rates in car spaces.",
    paymentApp: "RingGo (for paid general bays)",
    permitDetails: "Resident permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Camden": {
    rules: "Dedicated solo motorcycle bays require a paid parking session for non-residents. Residents can purchase a permit to park for free in resident and shared-use bays in their home CAZ.",
    pricing: "Paid parking based on CO2 emissions (typical rate is £1 to £6 per day for non-residents).",
    paymentApp: "RingGo",
    permitDetails: "Resident permits are emissions-based, starting at £25.55/year.",
    highlights: ["Paid Parking", "RingGo App", "Emissions-based Charging"]
  },
  "Croydon": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Resident permit bays require a valid motorcycle permit.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Resident motorcycle permit: £30/year.",
    highlights: ["Free in Dedicated Bays", "Permit for Resident Bays", "RingGo App"]
  },
  "Ealing": {
    rules: "Motorcycles can park for free in dedicated motorcycle bays, pay-and-display, and shared-use bays with no time limits.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Resident/Shared Bays Free", "No Time Limits"]
  },
  "Enfield": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply in other parking places.",
    pricing: "Free in dedicated bays.",
    paymentApp: "PayByPhone (for paid general bays)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "PayByPhone App"]
  },
  "Greenwich": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays and pay-and-display bays.",
    pricing: "Free of charge in dedicated and pay-and-display bays.",
    paymentApp: "PayByPhone (for other zones)",
    permitDetails: "Resident permits available.",
    highlights: ["Free in Dedicated Bays", "Free in Pay & Display", "PayByPhone App"]
  },
  "Hackney": {
    rules: "All motorcycle parking in permit zones and dedicated bays is subject to charges. Pricing is emissions-based. Non-residents must book a parking session.",
    pricing: "Paid parking based on CO2 emissions/engine size (typical visitor rate starts from £1/day).",
    paymentApp: "RingGo",
    permitDetails: "Resident motorcycle permits are emissions-based.",
    highlights: ["Paid Parking", "RingGo App", "Emissions-based Charging"]
  },
  "Hammersmith and Fulham": {
    rules: "Motorcycles can park for free in dedicated solo motorcycle bays, pay-and-display bays, and shared-use bays (except Caxton Village, where special rules apply).",
    pricing: "Free of charge.",
    paymentApp: "RingGo (for exceptions)",
    permitDetails: "No permit required in resident bays.",
    highlights: ["Free Parking", "Free Resident Bays", "RingGo App"]
  },
  "Haringey": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays, resident permit bays, and shared-use bays without needing a permit.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Free Resident Bays", "No Permit Needed"]
  },
  "Harrow": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply in other spaces.",
    pricing: "Free in dedicated bays.",
    paymentApp: "PayByPhone (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "PayByPhone App"]
  },
  "Havering": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply in pay-and-display bays.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for paid general bays)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Hillingdon": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays and standard pay-and-display bays.",
    pricing: "Free in dedicated and pay-and-display bays.",
    paymentApp: "PayByPhone (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Free in Pay & Display", "PayByPhone App"]
  },
  "Hounslow": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard rules apply elsewhere.",
    pricing: "Free in dedicated bays.",
    paymentApp: "PayByPhone (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "PayByPhone App"]
  },
  "Islington": {
    rules: "All motorcycle parking in solo motorcycle bays is subject to charges. Electric motorcycles receive a 50% discount. Resident bays require a permit.",
    pricing: "Paid parking (ICE rate around £1.07 per day flat visitor fee; electric discounted).",
    paymentApp: "RingGo",
    permitDetails: "Resident permits: ~£35/year for ICE, electric free.",
    highlights: ["Paid Parking", "Electric Discount", "RingGo App"]
  },
  "Kensington and Chelsea": {
    rules: "Dedicated solo motorcycle bays are free of charge. Parking in resident permit bays requires a valid motorcycle resident permit. Standard tariffs apply in pay-by-phone bays.",
    pricing: "Free in dedicated bays; standard car tariffs in pay-by-phone bays.",
    paymentApp: "PayByPhone (for general bays)",
    permitDetails: "Resident permit: £55/year.",
    highlights: ["Free in Dedicated Bays", "Permit for Resident Bays", "PayByPhone App"]
  },
  "Kingston-upon-Thames": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays and pay-and-display bays.",
    pricing: "Free in dedicated and pay-and-display bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Free in Pay & Display", "RingGo App"]
  },
  "Lambeth": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Resident bays require a resident permit. Pay-and-display bays require payment.",
    pricing: "Free in dedicated bays.",
    paymentApp: "PayByPhone (for general parking)",
    permitDetails: "Resident permit: £30/year.",
    highlights: ["Free in Dedicated Bays", "Permit for Resident Bays", "PayByPhone App"]
  },
  "Lewisham": {
    rules: "Non-resident motorcycle parking requires a paid parking pass via PayByPhone. Resident bays require a resident permit.",
    pricing: "Paid parking (rates vary; visitors must pay per session).",
    paymentApp: "PayByPhone",
    permitDetails: "Resident permit: ~£35/year.",
    highlights: ["Paid Parking", "PayByPhone App", "Visitor Passes"]
  },
  "Merton": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays and pay-and-display bays.",
    pricing: "Free in dedicated and pay-and-display bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Free in Pay & Display", "RingGo App"]
  },
  "Newham": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply in resident or pay-and-display bays.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Redbridge": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply elsewhere.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Richmond-upon-Thames": {
    rules: "Motorcycles can park for free in dedicated solo motorcycle bays, resident permit bays (without permit), pay-and-display, and shared-use bays.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required in resident bays.",
    highlights: ["Free Parking", "Free Resident Bays", "No Permit Needed"]
  },
  "Southwark": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Parking in resident permit or shared-use bays requires a motorcycle permit.",
    pricing: "Free in dedicated bays.",
    paymentApp: "PayByPhone (for general parking)",
    permitDetails: "Resident permit: Free for residents (must register).",
    highlights: ["Free in Dedicated Bays", "Free Resident Permit", "PayByPhone App"]
  },
  "Sutton": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Standard charges apply elsewhere.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Permits available.",
    highlights: ["Free in Dedicated Bays", "Paid in Car Bays", "RingGo App"]
  },
  "Tower Hamlets": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays. Parking in resident bays requires a resident permit. Pay-and-display bays require payment.",
    pricing: "Free in dedicated bays.",
    paymentApp: "RingGo (for general parking)",
    permitDetails: "Resident permit: Free for residents (registration required).",
    highlights: ["Free in Dedicated Bays", "Free Resident Permit", "RingGo App"]
  },
  "Waltham Forest": {
    rules: "Motorcycles are treated similarly to cars. Dedicated solo motorcycle bays and resident/visitor parking require payment. Pricing is emissions-based.",
    pricing: "Paid parking (rates vary based on vehicle emissions).",
    paymentApp: "RingGo",
    permitDetails: "Resident permit varies by emissions.",
    highlights: ["Paid Parking", "RingGo App", "Emissions-based Charging"]
  },
  "Wandsworth": {
    rules: "Motorcycles park for free in dedicated solo motorcycle bays, resident bays (no permit required), and shared-use bays without time limits.",
    pricing: "Free of charge.",
    paymentApp: "None",
    permitDetails: "No permit required.",
    highlights: ["Free Parking", "Free Resident Bays", "No Permit Needed"]
  },
  "Westminster": {
    rules: "All dedicated solo motorcycle bays are subject to a flat daily fee for non-residents. Fully electric motorcycles can park for free. Resident permit holders can park in resident bays.",
    pricing: "Paid parking (£1.00 per day flat rate for visitors). Free for electric motorcycles.",
    paymentApp: "RingGo",
    permitDetails: "Resident motorcycle permit: £30/year.",
    highlights: ["Paid Parking", "Electric Free", "RingGo App"]
  }
};

// RingGo app entry — opens the app on mobile when installed, otherwise web locator
const RINGGO_OPEN_URL = 'https://www.myringgo.co.uk/parkinglocator';

function boroughUsesRingGo(boroughName) {
  const policy = BOROUGH_POLICIES[boroughName];
  return policy && /ringgo/i.test(policy.paymentApp);
}

// 2. Application Variables
let map;
let markerCluster;
let allParkingSpots = [];
let filteredParkingSpots = [];
let userLocationMarker = null;
let userAccuracyCircle = null;
let searchResultMarker = null;
let infoPanelScrollTop = 0;
let anchoredDetailSpot = null;

const FEELING_LABELS = {
  love: 'Love it — very useful',
  like: 'Like it — mostly works well',
  okay: "It's okay — needs polish",
  improve: 'Needs improvement',
  frustrated: 'Frustrated — hard to use'
};

const MOBILE_LAYOUT_MQ = window.matchMedia('(max-width: 576px)');
const MOBILE_PANEL_MARKER_GAP_PX = 20;
const MOBILE_MARKER_ICON_RADIUS_PX = 27;
const MOBILE_PANEL_MIN_HEIGHT_PX = 168;

function isMobileLayout() {
  return MOBILE_LAYOUT_MQ.matches;
}

function resetMobileDetailsPanelLayout() {
  const panel = document.getElementById('details-panel');
  if (!panel) return;
  panel.classList.remove('is-anchored', 'is-anchored-pending');
  panel.style.removeProperty('--details-panel-top');
  anchoredDetailSpot = null;
}

function layoutMobileDetailsPanel(spot, done) {
  if (!map || !spot || typeof spot.lat !== 'number' || typeof spot.lng !== 'number') {
    if (done) done();
    return;
  }
  const panel = document.getElementById('details-panel');
  if (!panel) {
    if (done) done();
    return;
  }

  const latlng = L.latLng(spot.lat, spot.lng);

  const applyLayout = () => {
    const mapHeight = map.getSize().y;
    const searchEl = document.querySelector('.search-container');
    const searchBottom = searchEl ? searchEl.getBoundingClientRect().bottom : 0;
    const minPanelTop = searchBottom + 8;
    const maxPanelTop = Math.max(minPanelTop + 40, mapHeight - MOBILE_PANEL_MIN_HEIGHT_PX);

    const point = map.latLngToContainerPoint(latlng);
    const markerBottom = point.y + MOBILE_MARKER_ICON_RADIUS_PX;
    let panelTop = markerBottom + MOBILE_PANEL_MARKER_GAP_PX;
    panelTop = Math.max(panelTop, minPanelTop);

    return { panelTop, maxPanelTop, minPanelTop, markerBottom };
  };

  const commitLayout = () => {
    const { panelTop } = applyLayout();
    panel.classList.add('is-anchored');
    panel.style.setProperty('--details-panel-top', `${Math.round(panelTop)}px`);
    anchoredDetailSpot = spot;
    if (done) done();
  };

  let { panelTop, maxPanelTop, minPanelTop } = applyLayout();
  let panY = 0;

  if (panelTop > maxPanelTop) {
    panY += panelTop - maxPanelTop;
  }
  if (panelTop < minPanelTop) {
    panY -= minPanelTop - panelTop;
  }

  if (panY !== 0) {
    map.once('moveend', commitLayout);
    map.panBy([0, panY]);
    return;
  }

  commitLayout();
}

function focusMapOnSpot(spot, onComplete) {
  if (!map || !spot || typeof spot.lat !== 'number' || typeof spot.lng !== 'number') {
    if (onComplete) onComplete();
    return;
  }
  const targetZoom = Math.max(map.getZoom(), 16);
  const onMoveEnd = () => {
    map.off('moveend', onMoveEnd);
    if (onComplete) onComplete();
  };
  map.on('moveend', onMoveEnd);
  map.setView([spot.lat, spot.lng], targetZoom);
}




// Search result location pointer — triangular pin, smaller than bay markers
function createSearchResultIcon() {
  return L.divIcon({
    html: `
      <div class="search-result-pin-inner" aria-hidden="true">
        <svg viewBox="0 0 32 44" width="26" height="35" aria-hidden="true">
          <path d="M16 1.5C10.2 1.5 5.5 6.2 5.5 12c0 8.8 10.5 28.5 10.5 28.5S26.5 20.8 26.5 12C26.5 6.2 21.8 1.5 16 1.5z"
                fill="#ef4444" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="16" cy="12" r="4.5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    className: 'search-result-pin',
    iconSize: [26, 35],
    iconAnchor: [13, 35]
  });
}

// Custom SVG Motorcycle Marker Function
function createMotorcycleMarkerIcon(feeStatus) {
  const colorClass = feeStatus === 'yes' ? 'pin-paid' : 'pin-free';
  return L.divIcon({
    html: `
      <div class="pin-inner">
        <img src="Bike.png" alt="" draggable="false"
             style="width:20px;height:auto;display:block;pointer-events:none;-webkit-user-drag:none;" />
      </div>
    `,
    className: `custom-pin ${colorClass}`,
    // Tap target is 44x44 (Apple HIG / Material Design minimum) but the
    // visible pin (.pin-inner) is kept at 24x24 via flex-centering. This
    // makes markers reliably tappable on phones — a 24px target leaves
    // too much room to miss with a finger.
    iconSize: [55, 55],
    iconAnchor: [27, 27]
  });
}

// 3. Initialize Map
function initMap() {
  // Center London
  map = L.map('map', {
    zoomControl: true,
    maxZoom: 19,
    minZoom: 6
  }).setView([51.5074, -0.1278], 13);

  // CartoDB Voyager — full-colour road map with clear road names and
  // hierarchy. Much more legible than Dark Matter for finding streets.
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Initialize Marker Clustering
  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 45,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 16
  });
  map.addLayer(markerCluster);

  // Panel dismissal is handled by the .panel-backdrop element's pointerdown
  // listener (set up in setupListeners). No map.click handler here — that
  // route was the source of the iOS "panel flashes closed" bug.
}

// 4. Load Data & Create Markers
// Reads from the global PARKING_DATA variable injected by data/parking_data.js
// This works with both file:// and http:// without any CORS restrictions
function loadParkingData() {
  if (typeof PARKING_DATA !== 'undefined' && Array.isArray(PARKING_DATA) && PARKING_DATA.length > 0) {
    allParkingSpots = PARKING_DATA;
  } else {
    // Fallback demo data if the script somehow failed to load
    console.warn('PARKING_DATA not found — using demo data.');
    allParkingSpots = [
      { id: "node/demo1", lat: 51.5270094, lng: -0.1193573, borough: "Camden", street: "Lincoln's Inn Fields", capacity: 10, fee: "yes" },
      { id: "node/demo2", lat: 51.5166209, lng: -0.1350032, borough: "Westminster", street: "Soho Square", capacity: 15, fee: "yes" },
      { id: "node/demo3", lat: 51.5152572, lng: -0.0765117, borough: "City of London", street: "Middlesex Street", capacity: 8, fee: "no" }
    ];
  }
  filteredParkingSpots = [...allParkingSpots];
  populateBoroughFilter();
  renderParkingMarkers();
}

// Populate Borough Dropdown Filter (London boroughs only — map shows UK-wide OSM data)
function populateBoroughFilter() {
  const select = document.getElementById('borough-filter');
  const londonBoroughs = Object.keys(BOROUGH_POLICIES).sort();

  londonBoroughs.forEach(boroughName => {
    const option = document.createElement('option');
    option.value = boroughName;
    option.textContent = boroughName;
    select.appendChild(option);
  });
}

// Render Markers onto the Map
function renderParkingMarkers() {
  markerCluster.clearLayers();

  filteredParkingSpots.forEach(spot => {
    if (!spot.lat || !spot.lng) return;

    const marker = L.marker([spot.lat, spot.lng], {
      icon: createMotorcycleMarkerIcon(spot.fee),
      // Hard-stop the click from bubbling to the underlying map handler,
      // which would otherwise close the details panel right after we opened it.
      bubblingMouseEvents: false
    });

    marker.on('click', (e) => {
      // Stop propagation so the document-level click listener (which
      // handles outside-tap dismiss) does not also fire and try to close
      // the panel we are about to open/update.
      L.DomEvent.stopPropagation(e);
      if (e.originalEvent && typeof e.originalEvent.stopPropagation === 'function') {
        e.originalEvent.stopPropagation();
      }
      showSpotDetails(spot);
      if (typeof trackEvent === 'function') {
        trackEvent('bay_clicked', {
          borough: spot.borough || 'unknown',
          fee: spot.fee === 'yes' ? 'yes' : spot.fee === 'no' ? 'no' : 'unknown',
        });
      }
    });

    markerCluster.addLayer(marker);
  });
}

// 5. Filter Handler Logic
//
// `fitView` controls whether the map re-zooms to fit the filtered set:
//   - true  : used when the borough filter changes (the user clearly wants
//             the map to navigate to the new borough).
//   - false : used for the "Free Only" toggle. Re-fitting on every toggle
//             zooms the user out of the area they were inspecting, which is
//             the opposite of what they want — they're trying to scan the
//             *current* view for free spots.
function applyFilters({ fitView = false } = {}) {
  const boroughValue = document.getElementById('borough-filter').value;
  const freeOnlyValue = document.getElementById('free-toggle-btn').getAttribute('aria-pressed') === 'true';

  filteredParkingSpots = allParkingSpots.filter(spot => {
    if (boroughValue && spot.borough !== boroughValue) {
      return false;
    }
    if (freeOnlyValue && spot.fee !== 'no') {
      return false;
    }
    return true;
  });

  renderParkingMarkers();

  if (fitView && filteredParkingSpots.length > 0) {
    const group = new L.featureGroup(
      filteredParkingSpots.map(spot => L.marker([spot.lat, spot.lng]))
    );
    map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
  }
}

// 6. Geolocation Logic
function handleGeolocation() {
  const btn = document.getElementById('geolocate-btn');
  
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  
  btn.classList.add('active');
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const latlng = [latitude, longitude];
      
      // Remove existing geolocate indicators
      if (userLocationMarker) map.removeLayer(userLocationMarker);
      if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
      
      // Add accuracy circle
      userAccuracyCircle = L.circle(latlng, {
        radius: accuracy,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
      
      // Add user position pulsing marker
      const userIcon = L.divIcon({
        html: '<div class="user-location-inner"></div>',
        className: 'user-location-pin',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      userLocationMarker = L.marker(latlng, { icon: userIcon }).addTo(map);
      
      // Center and Zoom
      map.setView(latlng, 16);
      btn.classList.remove('active');
      if (typeof trackEvent === 'function') trackEvent('geolocate', { result: 'success' });
    },
    (error) => {
      btn.classList.remove('active');
      if (typeof trackEvent === 'function') {
        trackEvent('geolocate', { result: error.code === error.PERMISSION_DENIED ? 'denied' : 'error' });
      }
      let msg = 'Failed to retrieve your location.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Location permission denied by user.';
      }
      alert(msg);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// 7. Postcode, Place and Location Search via Nominatim API
const NOMINATIM_HEADERS = {
  'User-Agent': 'BikeParkLondonApp/1.0 (contact: harshavardhanr@google.com)'
};

function formatNominatimResult(result) {
  const addr = result.address || {};
  const label = result.name || result.display_name.split(',')[0].trim();

  const subParts = [
    addr.house_number,
    addr.road,
    addr.suburb || addr.neighbourhood || addr.city_district,
    addr.city || addr.town || addr.village,
    addr.county,
    addr.postcode
  ].filter(Boolean);

  const sublabel = subParts.length
    ? subParts.join(', ')
    : result.display_name.split(',').slice(1, 4).join(',').trim();

  return {
    label,
    sublabel,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon)
  };
}

async function nominatimSearch(query, limit = 5) {
  const params = new URLSearchParams({
    format: 'json',
    q: query,
    limit: String(limit),
    addressdetails: '1',
    countrycodes: 'gb'
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: NOMINATIM_HEADERS
  });

  if (!response.ok) throw new Error('Search failed');

  const results = await response.json();
  return results.map(formatNominatimResult);
}

async function fetchLocationSuggestions(query, limit = 5) {
  return nominatimSearch(query, limit);
}

function showSearchLocation(lat, lon) {
  if (searchResultMarker) map.removeLayer(searchResultMarker);

  searchResultMarker = L.marker([lat, lon], {
    icon: createSearchResultIcon(),
    zIndexOffset: 500
  }).addTo(map);

  map.setView([lat, lon], 16);
}

function syncSearchClearButton() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!input || !clearBtn) return;
  const hasValue = input.value.trim().length > 0;
  clearBtn.hidden = !hasValue;
  input.classList.toggle('has-value', hasValue);
}

// Autocomplete: fetch up to 5 Nominatim suggestions for the typed query.
// Returns an array of { label, sublabel, lat, lon }.
let _autocompleteTimer = null;
let _lastQuery = '';

function setupSearchAutocomplete() {
  const input = document.getElementById('search-input');
  const list  = document.getElementById('search-suggestions');
  if (!input || !list) return;

  let activeIndex = -1;

  function closeSuggestions() {
    list.classList.remove('is-open');
    list.innerHTML = '';
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
  }

  function selectSuggestion(item) {
    input.value = item.label;
    syncSearchClearButton();
    closeSuggestions();
    showSearchLocation(item.lat, item.lon);
  }

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearTimeout(_autocompleteTimer);
    if (query.length < 2) { closeSuggestions(); return; }
    if (query === _lastQuery) return;
    _lastQuery = query;

    _autocompleteTimer = setTimeout(async () => {
      let suggestions = [];
      try {
        suggestions = await fetchLocationSuggestions(query);
      } catch (error) {
        console.error('Autocomplete search failed:', error);
      }
      if (input.value.trim() !== query) return; // stale result
      closeSuggestions();
      if (!suggestions.length) return;

      suggestions.forEach((item, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.innerHTML = `<span class="suggestion-main">${item.label}</span><span class="suggestion-sub">${item.sublabel}</span>`;
        li.addEventListener('mousedown', (e) => { e.preventDefault(); selectSuggestion(item); });
        list.appendChild(li);
      });
      list.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      activeIndex = -1;
    }, 280);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('li');
    if (!list.classList.contains('is-open') || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
    } else if (e.key === 'Escape') {
      closeSuggestions();
      return;
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
      return;
    } else {
      return;
    }
    items.forEach((li, i) => li.setAttribute('aria-selected', i === activeIndex));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) closeSuggestions();
  });

  // Clear button: show when input has content, hide when empty
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) {
    input.addEventListener('input', syncSearchClearButton);
    syncSearchClearButton();
    clearBtn.addEventListener('click', () => {
      input.value = '';
      closeSuggestions();
      syncSearchClearButton();
      input.focus();
      // Remove the search pin if one was placed
      if (searchResultMarker) {
        map.removeLayer(searchResultMarker);
        searchResultMarker = null;
      }
    });
  }
}

async function handleSearch(e) {
  e.preventDefault();
  const input = document.getElementById('search-input');
  const query = input.value.trim();

  if (!query) return;

  const submitBtn = document.querySelector('.search-submit-btn');
  submitBtn.style.opacity = 0.5;

  try {
    const results = await fetchLocationSuggestions(query, 1);

    if (results.length > 0) {
      const place = results[0];
      input.value = place.label;
      syncSearchClearButton();
      showSearchLocation(place.lat, place.lon);
      if (typeof trackEvent === 'function') trackEvent('search', { result: 'success' });
    } else {
      if (typeof trackEvent === 'function') trackEvent('search', { result: 'no_results' });
      alert(`No results found for "${query}". Try a UK postcode, street name, or place.`);
    }
  } catch (error) {
    console.error('Error during search geocoding:', error);
    alert('Search service is currently unavailable. Please try again.');
  } finally {
    submitBtn.style.opacity = 1;
  }
}

// Reverse-geocode lat/lng using Nominatim and return a formatted
// "Road, Postcode" string, or null if unavailable.
function formatAddressFromNominatim(data) {
  const addr = data.address || {};
  const line1Parts = [
    addr.house_number,
    addr.road || addr.pedestrian || addr.footway || addr.path || addr.street || addr.square
  ].filter(Boolean);
  const line1 = line1Parts.join(' ');
  const postcode = addr.postcode || '';

  if (line1 && postcode) return `${line1}, ${postcode}`;
  if (line1) return line1;
  if (postcode) return postcode;

  // Fall back to a shortened display_name (street + postcode area)
  if (data.display_name) {
    const parts = data.display_name.split(',').map(p => p.trim());
    return parts.slice(0, 3).join(', ');
  }
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    return formatAddressFromNominatim(data);
  } catch {
    return null;
  }
}

// 8. Details Panel Drawer Control
function showSpotDetails(spot) {
  // Defensive: bail out if spot is missing or malformed. Better to keep the
  // previously-shown content than to clear the panel to empty strings.
  if (!spot || typeof spot !== 'object') {
    console.warn('showSpotDetails called with invalid spot:', spot);
    return;
  }

  const panel = document.getElementById('details-panel');
  const badge = document.getElementById('details-badge');
  const streetName = document.getElementById('details-street');
  const boroughName = document.getElementById('details-borough');
  const capacity = document.getElementById('details-capacity');
  const price = document.getElementById('details-price');
  const policyDesc = document.getElementById('details-policy-desc');
  const policyHighlights = document.getElementById('details-policy-highlights');
  const directionsBtn = document.getElementById('directions-btn');

  if (!panel || !badge || !streetName || !boroughName || !capacity ||
      !price || !policyDesc || !policyHighlights || !directionsBtn) {
    console.warn('showSpotDetails: one or more panel elements not found');
    return;
  }

  // Populate standard details. Always use explicit string fallbacks so a
  // missing field never renders as "" (which would look like the panel is
  // broken). Empty string from `textContent = null/undefined` was the root
  // cause of the "panel shows up with no data" bug on iOS.
  const street  = (typeof spot.street  === 'string' && spot.street)  ? spot.street  : 'Solo Motorcycle Parking Bay';
  const borough = (typeof spot.borough === 'string' && spot.borough) ? spot.borough : 'Unknown borough';
  const capStr  = (spot.capacity != null && spot.capacity !== '') ? `${spot.capacity} spaces` : 'Unknown';

  streetName.textContent = street;
  boroughName.textContent = borough;
  capacity.textContent = capStr;

  if (spot.fee === 'yes') {
    badge.textContent = 'Paid';
    badge.className = 'badge paid';
    price.textContent = 'Paid Session';
  } else {
    badge.textContent = 'Free';
    badge.className = 'badge free';
    price.textContent = 'Free Bay';
  }
  
  // Populate borough regulations. Use the safe `borough` variable.
  const policy = BOROUGH_POLICIES[borough];
  if (policy) {
    policyDesc.innerHTML = `<strong>Dedicated bays:</strong> ${policy.rules}<br><br><strong>Visitor Pricing:</strong> ${policy.pricing}`;
    
    // Clear & render highlights pills
    policyHighlights.innerHTML = '';
    policy.highlights.forEach(h => {
      const pill = document.createElement('span');
      pill.className = 'policy-pill';
      pill.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${h}
      `;
      policyHighlights.appendChild(pill);
    });
  } else {
    policyDesc.textContent = 'General parking guidelines: Check local street signage next to the bay for restriction hours and pricing.';
    policyHighlights.innerHTML = '';
  }
  
  // Google Maps Directions link. Use defensive coords so we never produce
  // a malformed URL even if lat/lng are missing.
  const lat = (typeof spot.lat === 'number') ? spot.lat : '';
  const lng = (typeof spot.lng === 'number') ? spot.lng : '';
  directionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const ringgoBtn = document.getElementById('ringgo-btn');
  const panelActions = document.getElementById('details-panel-actions');
  if (ringgoBtn) {
    const showRingGo = spot.fee === 'yes' && boroughUsesRingGo(borough);
    ringgoBtn.hidden = !showRingGo;
    if (showRingGo) {
      ringgoBtn.href = RINGGO_OPEN_URL;
    }
  }
  if (panelActions) {
    panelActions.classList.toggle(
      'panel-actions--dual',
      spot.fee === 'yes' && ringgoBtn && !ringgoBtn.hidden
    );
  }
  
  // Show the panel via .is-open class. Make sure other panels are hidden.
  closeDirectoryPanel();
  closeInfoPanel();
  panel.setAttribute('aria-hidden', 'false');
  resetMobileDetailsPanelLayout();

  if (isMobileLayout()) {
    // Anchor the sheet below the selected bay once the map finishes centering.
    panel.classList.add('is-anchored-pending');
    focusMapOnSpot(spot, () => {
      layoutMobileDetailsPanel(spot, () => {
        panel.classList.remove('is-anchored-pending');
        panel.classList.add('is-open');
        updatePanelBackdrop();
      });
    });
  } else {
    panel.classList.add('is-open');
    updatePanelBackdrop();
    setTimeout(() => focusMapOnSpot(spot), 50);
  }

  // Populate the address subheading via reverse geocoding.
  // Show coordinates immediately so there's always something to copy.
  const addressEl = document.getElementById('details-address');
  const copyBtn   = document.getElementById('details-address-copy');
  if (addressEl && copyBtn && typeof lat === 'number' && typeof lng === 'number') {
    const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    addressEl.textContent = 'Locating address…';
    copyBtn.classList.remove('copied');

    // Copy-to-clipboard handler
    copyBtn.onclick = () => {
      const text = addressEl.textContent;
      if (!text || text === 'Locating address…') return;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 2000);
      }).catch(() => {
        // Fallback for browsers without clipboard API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 2000);
      });
    };

    const spotId = spot.id;
    const streetHint = (street !== 'Solo Motorcycle Parking Bay') ? street : '';

    reverseGeocode(lat, lng).then(result => {
      // Ignore stale responses if the user tapped another marker
      if (panel.dataset.activeSpotId !== spotId) return;
      addressEl.textContent = result || streetHint || coordStr;
    });
    panel.dataset.activeSpotId = spotId;
  }
}


function updatePanelBackdrop() {
  const backdrop = document.getElementById('panel-backdrop');
  if (!backdrop) return;
  const anyOpen = ['details-panel', 'directory-panel', 'info-panel', 'feedback-panel'].some(id => {
    const el = document.getElementById(id);
    return el && el.classList.contains('is-open');
  });
  backdrop.classList.toggle('is-open', anyOpen);
  backdrop.setAttribute('aria-hidden', anyOpen ? 'false' : 'true');
}

function getFeedbackConfig() {
  return window.BIKEPARK_FEEDBACK || {};
}

function openFeedbackPanel() {
  const infoPanel = document.getElementById('info-panel');
  const infoContent = document.getElementById('info-content');
  const feedbackPanel = document.getElementById('feedback-panel');
  if (!infoPanel || !feedbackPanel) return;

  if (!infoPanel.classList.contains('is-open')) {
    closeDetailsPanel();
    closeDirectoryPanel();
    infoPanel.classList.add('is-open');
    infoPanel.setAttribute('aria-hidden', 'false');
  }

  if (infoContent) {
    infoPanelScrollTop = infoContent.scrollTop;
  }

  setFeedbackStatus('');
  feedbackPanel.classList.add('is-open');
  feedbackPanel.setAttribute('aria-hidden', 'false');
  updatePanelBackdrop();

  const firstField = document.getElementById('feedback-name');
  if (firstField) {
    window.setTimeout(() => firstField.focus(), 300);
  }

  if (typeof trackEvent === 'function') trackEvent('feedback_open');
}

function closeFeedbackPanel(restoreScroll = true) {
  const feedbackPanel = document.getElementById('feedback-panel');
  const infoContent = document.getElementById('info-content');
  if (!feedbackPanel || !feedbackPanel.classList.contains('is-open')) return;

  feedbackPanel.classList.remove('is-open');
  feedbackPanel.setAttribute('aria-hidden', 'true');
  updatePanelBackdrop();

  if (restoreScroll && infoContent) {
    requestAnimationFrame(() => {
      infoContent.scrollTop = infoPanelScrollTop;
    });
  }
}

function setFeedbackStatus(message, isError = false) {
  const status = document.getElementById('feedback-status');
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
  status.classList.toggle('is-error', isError);
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const feeling = form.feeling.value;
  const feelingLabel = FEELING_LABELS[feeling] || feeling;
  const config = getFeedbackConfig();
  const endpoint = (config.formEndpoint || '').trim();

  if (!endpoint) {
    setFeedbackStatus('Feedback is not set up yet. Please try again later.', true);
    return;
  }

  setFeedbackStatus('Sending…');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: name || '(not provided)',
        email,
        _replyto: email,
        message,
        feeling,
        feelingLabel,
        _subject: 'BikeParkLondon feedback'
      })
    });
    if (!response.ok) throw new Error('Submit failed');

    if (typeof trackEvent === 'function') {
      trackEvent('feedback_submit', { result: 'success', source: feeling });
    }

    form.reset();
    setFeedbackStatus('');
    closeFeedbackPanel(true);
  } catch (err) {
    console.error('Feedback submit failed:', err);
    setFeedbackStatus('Could not send feedback. Please try again.', true);
    if (typeof trackEvent === 'function') {
      trackEvent('feedback_submit', { result: 'error' });
    }
  }
}

function closeInfoPanel() {
  closeFeedbackPanel(false);
  const panel = document.getElementById('info-panel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  updatePanelBackdrop();
}

function toggleInfoPanel(e) {
  if (e) L.DomEvent.stopPropagation(e);
  const panel = document.getElementById('info-panel');
  if (!panel) return;
  if (panel.classList.contains('is-open')) {
    closeInfoPanel();
  } else {
    closeDetailsPanel();
    closeDirectoryPanel();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    updatePanelBackdrop();
    if (typeof trackEvent === 'function') trackEvent('info_open');
  }
}

function closeDetailsPanel() {
  const panel = document.getElementById('details-panel');
  if (!panel || !panel.classList.contains('is-open')) return;

  const keepAnchorUntilClosed = panel.classList.contains('is-anchored') && isMobileLayout();
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  updatePanelBackdrop();

  if (keepAnchorUntilClosed) {
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      panel.removeEventListener('transitionend', onTransitionEnd);
      resetMobileDetailsPanelLayout();
    };
    const onTransitionEnd = (e) => {
      if (e.target !== panel || e.propertyName !== 'transform') return;
      cleanup();
    };
    panel.addEventListener('transitionend', onTransitionEnd);
    setTimeout(cleanup, 400);
  } else {
    resetMobileDetailsPanelLayout();
  }
}

// 9. Directory Panel (Borough List) Logic
function populateDirectory() {
  const container = document.getElementById('directory-accordions');
  container.innerHTML = '';
  
  // Sort policies alphabetically
  const sortedBoroughs = Object.keys(BOROUGH_POLICIES).sort();
  
  sortedBoroughs.forEach(bName => {
    const policy = BOROUGH_POLICIES[bName];
    
    const details = document.createElement('details');
    details.name = 'borough-rules'; // Enable exclusive accordion grouping
    
    const summary = document.createElement('summary');
    summary.textContent = bName;
    
    const body = document.createElement('div');
    body.className = 'accordion-body';
    
    body.innerHTML = `
      <p><strong>Dedicated Bays:</strong> ${policy.rules}</p>
      <p style="margin-top: 6px;"><strong>Visitor Pricing:</strong> ${policy.pricing}</p>
      <p style="margin-top: 6px;"><strong>Payment App:</strong> ${policy.paymentApp}</p>
      <p style="margin-top: 6px;"><strong>Resident Permit:</strong> ${policy.permitDetails}</p>
    `;
    
    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);
  });
}

function toggleDirectoryPanel(e) {
  if (e) L.DomEvent.stopPropagation(e);
  const panel = document.getElementById('directory-panel');
  if (!panel) return;
  if (panel.classList.contains('is-open')) {
    closeDirectoryPanel();
  } else {
    closeDetailsPanel();
    closeInfoPanel();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    updatePanelBackdrop();
    if (typeof trackEvent === 'function') trackEvent('directory_open');
  }
}

function closeDirectoryPanel() {
  const panel = document.getElementById('directory-panel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  updatePanelBackdrop();
}

// 10. Wire Up DOM Listeners
function setupListeners() {
  // Search Form
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  
  // Filters
  // Borough dropdown: navigate the map to the chosen borough (re-fit bounds).
  document.getElementById('borough-filter').addEventListener('change', (e) => {
    if (typeof trackEvent === 'function') {
      trackEvent('borough_filter', { borough: e.target.value || 'all' });
    }
    applyFilters({ fitView: true });
  });

  // Free Only toggle: just filter visible markers, keep the current view.
  const freeToggle = document.getElementById('free-toggle-btn');
  freeToggle.addEventListener('click', () => {
    const pressed = freeToggle.getAttribute('aria-pressed') === 'true';
    freeToggle.setAttribute('aria-pressed', !pressed);
    if (typeof trackEvent === 'function') trackEvent('free_toggle', { enabled: !pressed });
    applyFilters({ fitView: false });
  });
  
  // Geolocation Button
  document.getElementById('geolocate-btn').addEventListener('click', handleGeolocation);
  
  // Directory Toggle Button
  document.getElementById('directory-toggle-btn').addEventListener('click', toggleDirectoryPanel);
  document.getElementById('info-toggle-btn').addEventListener('click', toggleInfoPanel);
  
  // Panel Close Buttons
  document.getElementById('details-close-btn').addEventListener('click', closeDetailsPanel);
  document.getElementById('directory-close-btn').addEventListener('click', closeDirectoryPanel);
  document.getElementById('info-close-btn').addEventListener('click', closeInfoPanel);

  const feedbackOpenBtn = document.getElementById('feedback-open-btn');
  if (feedbackOpenBtn) {
    feedbackOpenBtn.addEventListener('click', openFeedbackPanel);
  }

  const feedbackCloseBtn = document.getElementById('feedback-close-btn');
  if (feedbackCloseBtn) {
    feedbackCloseBtn.addEventListener('click', () => closeFeedbackPanel(true));
  }

  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
  }

  const directionsBtn = document.getElementById('directions-btn');
  if (directionsBtn) {
    directionsBtn.addEventListener('click', () => {
      if (typeof trackEvent !== 'function') return;
      const boroughEl = document.getElementById('details-borough');
      const badgeEl = document.getElementById('details-badge');
      trackEvent('directions', {
        borough: boroughEl ? boroughEl.textContent : 'unknown',
        fee: badgeEl && badgeEl.classList.contains('paid') ? 'yes' : 'no',
      });
    });
  }

  const ringgoBtn = document.getElementById('ringgo-btn');
  if (ringgoBtn) {
    ringgoBtn.addEventListener('click', () => {
      if (typeof trackEvent !== 'function') return;
      const boroughEl = document.getElementById('details-borough');
      trackEvent('ringgo', { borough: boroughEl ? boroughEl.textContent : 'unknown' });
    });
  }
  
  // Catch escape key for panels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const feedbackPanel = document.getElementById('feedback-panel');
      if (feedbackPanel && feedbackPanel.classList.contains('is-open')) {
        closeFeedbackPanel(true);
        return;
      }
      closeDetailsPanel();
      closeDirectoryPanel();
      closeInfoPanel();
    }
  });

  window.addEventListener('resize', () => {
    if (!anchoredDetailSpot || !isMobileLayout()) return;
    const panel = document.getElementById('details-panel');
    if (panel && panel.classList.contains('is-open')) {
      layoutMobileDetailsPanel(anchoredDetailSpot);
    }
  });

  // Outside-tap dismissal via a document-level click listener with a
  // deterministic target check. The backdrop element is purely visual
  // (pointer-events: none), so clicks always reach the underlying map,
  // markers, or panel content directly. We only close when the click
  // landed on a plain "background" area.
  //
  // This handles iOS Safari's synthesised delayed click correctly: that
  // click has target = the original touch element (e.g. the marker icon),
  // which is excluded below, so the panel stays open.
  document.addEventListener('click', (ev) => {
    const detailsOpen = document.querySelector('.details-panel.is-open');
    const directoryOpen = document.querySelector('.directory-panel.is-open');
    const infoOpen = document.querySelector('.info-panel.is-open');
    const feedbackOpen = document.querySelector('.feedback-panel.is-open');
    if (!detailsOpen && !directoryOpen && !infoOpen && !feedbackOpen) return;

    const target = ev.target;
    if (!target || typeof target.closest !== 'function') return;

    // Don't close if the click landed on any of these:
    //   - inside an open panel (so users can interact with panel content)
    //   - on a marker or cluster (so tapping switches to that marker)
    //   - on the search bar or floating controls
    //   - on any Leaflet UI element (zoom buttons, popups, etc.)
    if (target.closest(
      '.details-panel, .directory-panel, .info-panel, .feedback-panel, ' +
      '.custom-pin, .marker-cluster, .leaflet-marker-icon, .leaflet-popup, ' +
      '.leaflet-control, .search-container, .floating-controls'
    )) {
      return;
    }

    if (feedbackOpen) {
      closeFeedbackPanel(true);
      return;
    }

    closeDetailsPanel();
    closeDirectoryPanel();
    closeInfoPanel();
  });
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupListeners();
  setupSearchAutocomplete();
  syncSearchClearButton();
  populateDirectory();
  loadParkingData();
  centreOnUserLocation();
  if (typeof trackEvent === 'function') trackEvent('app_loaded');
});

// On startup, silently request the user's location and pan the map there.
// If geolocation is unavailable or the user denies permission the map
// simply stays on the default London view — no alert, no error shown.
function centreOnUserLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const latlng = [latitude, longitude];

      // Show the pulsing user-location dot
      if (userLocationMarker) map.removeLayer(userLocationMarker);
      if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);

      userAccuracyCircle = L.circle(latlng, {
        radius: accuracy,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);

      const userIcon = L.divIcon({
        html: '<div class="user-location-inner"></div>',
        className: 'user-location-pin',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      userLocationMarker = L.marker(latlng, { icon: userIcon }).addTo(map);

      // Zoom in on the user. Cap at 15 so they still see nearby markers.
      map.setView(latlng, 15);
    },
    () => { /* permission denied or unavailable — stay on default view */ },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}
