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

// 2. Application Variables
let map;
let markerCluster;
let allParkingSpots = [];
let filteredParkingSpots = [];
let userLocationMarker = null;
let userAccuracyCircle = null;
let searchResultMarker = null;



// Icons Definitions
const locationIconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.82 2.82c-.41-.41-1.07-.41-1.48 0L9.5 10.66 4.66 5.82c-.41-.41-1.07-.41-1.48 0-.41.41-.41 1.07 0 1.48l5.59 5.59c.41.41 1.07.41 1.48 0l8.59-8.59c.41-.41.41-1.07 0-1.48z"/></svg>`;

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
    minZoom: 10
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

// Populate Borough Dropdown Filter
function populateBoroughFilter() {
  const select = document.getElementById('borough-filter');
  
  // Extract unique boroughs from data
  const uniqueBoroughs = [...new Set(allParkingSpots.map(spot => spot.borough))];
  uniqueBoroughs.sort();
  
  uniqueBoroughs.forEach(boroughName => {
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
      // Defer the zoom/pan so the panel transition starts cleanly first.
      // Clamp the zoom to max(current, 16) so tapping a marker doesn't
      // yank a zoomed-out user too aggressively.
      setTimeout(() => {
        const targetZoom = Math.max(map.getZoom(), 16);
        map.setView([spot.lat, spot.lng], targetZoom);
      }, 50);
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
    },
    (error) => {
      btn.classList.remove('active');
      let msg = 'Failed to retrieve your location.';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Location permission denied by user.';
      }
      alert(msg);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// 7. Postcode and Location Search via Nominatim API

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
    closeSuggestions();
    // Place a temporary search pin and pan the map
    if (searchResultMarker) map.removeLayer(searchResultMarker);
    searchResultMarker = L.marker([item.lat, item.lon], {
      icon: L.divIcon({
        html: `<div style="color:#ef4444;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))">${locationIconSvg}</div>`,
        className: 'search-result-pin',
        iconSize: [24, 24],
        iconAnchor: [7, 14]
      })
    }).addTo(map);
    map.setView([item.lat, item.lon], 16);
  }

  async function fetchSuggestions(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', London, UK')}&limit=5&addressdetails=1`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BikeParkLondonApp/1.0' } });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map(r => {
        const addr = r.address || {};
        // Build a short human-readable main label
        const main = addr.road || addr.pedestrian || addr.suburb || r.display_name.split(',')[0];
        // Build a contextual sublabel (postcode + district)
        const parts = [addr.postcode, addr.suburb || addr.city_district, addr.city || 'London'].filter(Boolean);
        return { label: main, sublabel: parts.join(', '), lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
      });
    } catch {
      return [];
    }
  }

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearTimeout(_autocompleteTimer);
    if (query.length < 2) { closeSuggestions(); return; }
    if (query === _lastQuery) return;
    _lastQuery = query;

    _autocompleteTimer = setTimeout(async () => {
      const suggestions = await fetchSuggestions(query);
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
}

async function handleSearch(e) {
  e.preventDefault();
  const input = document.getElementById('search-input');
  const query = input.value.trim();
  
  if (!query) return;
  
  const submitBtn = document.querySelector('.search-submit-btn');
  submitBtn.style.opacity = 0.5;
  
  // Search Nominatim, restricting results to London UK
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, London, UK&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BikeParkLondonApp/1.0 (contact: harshavardhanr@google.com)'
      }
    });
    
    if (!response.ok) throw new Error('Search failed');
    
    const results = await response.json();
    
    if (results && results.length > 0) {
      const place = results[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      
      // Add/update temporary search pin
      if (searchResultMarker) map.removeLayer(searchResultMarker);
      
      searchResultMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          html: `<div style="color: #ef4444; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${locationIconSvg}</div>`,
          className: 'search-result-pin',
          iconSize: [24, 24],
          iconAnchor: [7, 14]
        })
      }).addTo(map);
      
      map.setView([lat, lon], 16);
    } else {
      alert(`No results found for "${query}" in London. Try checking the postcode format.`);
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
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'BikeParkLondonApp/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const road = addr.road || addr.pedestrian || addr.path || addr.footway || '';
    const postcode = addr.postcode || '';
    if (!road && !postcode) return null;
    return [road, postcode].filter(Boolean).join(', ');
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
  
  // Show the panel via .is-open class. Make sure other panels are hidden.
  closeDirectoryPanel();
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  const backdrop = document.getElementById('panel-backdrop');
  if (backdrop) {
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
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

    reverseGeocode(lat, lng).then(result => {
      addressEl.textContent = result || coordStr;
    });
  }
}

function closeDetailsPanel() {
  const panel = document.getElementById('details-panel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  // Hide the backdrop only if the directory panel is also closed.
  const directory = document.getElementById('directory-panel');
  const backdrop = document.getElementById('panel-backdrop');
  if (backdrop && (!directory || !directory.classList.contains('is-open'))) {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
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
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    const backdrop = document.getElementById('panel-backdrop');
    if (backdrop) {
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }
}

function closeDirectoryPanel() {
  const panel = document.getElementById('directory-panel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  const details = document.getElementById('details-panel');
  const backdrop = document.getElementById('panel-backdrop');
  if (backdrop && (!details || !details.classList.contains('is-open'))) {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
}

// 10. Wire Up DOM Listeners
function setupListeners() {
  // Search Form
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  
  // Filters
  // Borough dropdown: navigate the map to the chosen borough (re-fit bounds).
  document.getElementById('borough-filter').addEventListener('change', () => applyFilters({ fitView: true }));

  // Free Only toggle: just filter visible markers, keep the current view.
  const freeToggle = document.getElementById('free-toggle-btn');
  freeToggle.addEventListener('click', () => {
    const pressed = freeToggle.getAttribute('aria-pressed') === 'true';
    freeToggle.setAttribute('aria-pressed', !pressed);
    applyFilters({ fitView: false });
  });
  
  // Geolocation Button
  document.getElementById('geolocate-btn').addEventListener('click', handleGeolocation);
  
  // Directory Toggle Button
  document.getElementById('directory-toggle-btn').addEventListener('click', toggleDirectoryPanel);
  
  // Panel Close Buttons
  document.getElementById('details-close-btn').addEventListener('click', closeDetailsPanel);
  document.getElementById('directory-close-btn').addEventListener('click', closeDirectoryPanel);
  
  // Catch escape key for panels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailsPanel();
      closeDirectoryPanel();
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
    if (!detailsOpen && !directoryOpen) return;

    const target = ev.target;
    if (!target || typeof target.closest !== 'function') return;

    // Don't close if the click landed on any of these:
    //   - inside an open panel (so users can interact with panel content)
    //   - on a marker or cluster (so tapping switches to that marker)
    //   - on the search bar or floating controls
    //   - on any Leaflet UI element (zoom buttons, popups, etc.)
    if (target.closest(
      '.details-panel, .directory-panel, ' +
      '.custom-pin, .marker-cluster, .leaflet-marker-icon, .leaflet-popup, ' +
      '.leaflet-control, .search-container, .floating-controls'
    )) {
      return;
    }

    closeDetailsPanel();
    closeDirectoryPanel();
  });
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupListeners();
  setupSearchAutocomplete();
  populateDirectory();
  loadParkingData();
  centreOnUserLocation();
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
