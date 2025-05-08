mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style:"mapbox://styles/mapbox/satellite-streets-v12",
    center: listing.geometry.coordinates,
    zoom: 9,
});

// Create a custom Font Awesome marker
const el = document.createElement('div');
el.className = 'fa-marker';
el.innerHTML = '<i class="fas fa-compass"></i>';

// Add the custom marker to the map
const marker1 = new mapboxgl.Marker(el)
    .setLngLat(listing.geometry.coordinates)
    .setPopup( new mapboxgl.Popup({ closeOnClick: false , offset: 25})
    .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking!</p>`))
    .addTo(map);
