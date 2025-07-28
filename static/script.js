// Mobile menu toggle function
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
}

// Close menu when clicking on map (mobile)
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('map').addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('menu').classList.remove('active');
        }
    });
});

// Initialize the Leaflet map
const map = L.map('map').setView([18.525514, 73.846069], 5);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Global Variables for Markers and Click Tracking
let startMarker = null;
let endMarker = null;
let clickCount = 0; // 0: Start point, 1: End point

// Function to handle map clicks
function onMapClick(e) {
    const { lat, lng } = e.latlng;
    console.log(`Map clicked at: Latitude ${lat}, Longitude ${lng}`);

    if (clickCount === 0) {
        setStartPoint(lat, lng);
    } else if (clickCount === 1) {
        setEndPoint(lat, lng);
    }
}

// Function to set the start point
function setStartPoint(lat, lng) {
    if (startMarker) map.removeLayer(startMarker); // Remove existing start marker
    startMarker = L.marker([lat, lng]).addTo(map).bindPopup("Start Point").openPopup();

    document.getElementById('startPointLatitude').value = lat;
    document.getElementById('startPointLongitude').value = lng;

    clickCount++; // Move to setting end point
    console.log(`Start Point Set: Latitude ${lat}, Longitude ${lng}`);
}

// Function to set the end point
function setEndPoint(lat, lng) {
    if (endMarker) map.removeLayer(endMarker); // Remove existing end marker
    endMarker = L.marker([lat, lng]).addTo(map).bindPopup("End Point").openPopup();

    document.getElementById('endPointLatitude').value = lat;
    document.getElementById('endPointLongitude').value = lng;

    clickCount = 0; // Reset for the next interaction
    console.log(`End Point Set: Latitude ${lat}, Longitude ${lng}`);
}

// Function to add a polyline (route) between multiple points
function addPolyline(coordinates, color = 'blue') {
    const polyline = L.polyline(coordinates, { color }).addTo(map);

    try {
        const bounds = polyline.getBounds();
        map.fitBounds(bounds);
    } catch (error) {
        console.error("Error fitting bounds for polyline:", error);
    }
}

// Enhanced event listener for the "Calculate Route" button with loading animation
document.getElementById('calculateRouteButton').addEventListener('click', function () {
    const button = this;
    const startLat = parseFloat(document.getElementById('startPointLatitude').value);
    const startLng = parseFloat(document.getElementById('startPointLongitude').value);
    const endLat = parseFloat(document.getElementById('endPointLatitude').value);
    const endLng = parseFloat(document.getElementById('endPointLongitude').value);

    console.log(`Calculate Route Button Clicked: Start (${startLat}, ${startLng}) -> End (${endLat}, ${endLng})`);

    if (isValidCoordinates(startLat, startLng, endLat, endLng)) {
        // Add loading animation
        button.classList.add('loading');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        
        calculateRoute(startLat, startLng, endLat, endLng, button);
    } else {
        alert("Please enter valid coordinates for both start and end points.");
    }
});

// Function to validate coordinates
function isValidCoordinates(startLat, startLng, endLat, endLng) {
    return (
        !isNaN(startLat) && !isNaN(startLng) &&
        !isNaN(endLat) && !isNaN(endLng) &&
        startLat >= -90 && startLat <= 90 &&
        startLng >= -180 && startLng <= 180 &&
        endLat >= -90 && endLat <= 90 &&
        endLng >= -180 && endLng <= 180
    );
}

// Function to send route data to the FastAPI backend
function calculateRoute(startLat, startLng, endLat, endLng, button) {
    console.log("Sending route calculation request to backend...");

    fetch("http://127.0.0.1:8000/calculate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            start_latitude: startLat,
            start_longitude: startLng,
            end_latitude: endLat,
            end_longitude: endLng,
        }),
    })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            console.log("Route data received from backend:", data);

            if (data.path?.error) {
                console.error("Backend Error:", data.path.error);
                alert(`Error calculating route: ${data.path.error}`);
                return;
            }

            const pathCoordinates = Array.isArray(data.path?.path) ? data.path.path : [];
            const startPoint = [startLat, startLng];
            const endPoint = [endLat, endLng];

            if (!pathCoordinates.length || !arraysEqual(pathCoordinates[0], startPoint)) {
                pathCoordinates.unshift(startPoint);
            }
            if (!pathCoordinates.length || !arraysEqual(pathCoordinates[pathCoordinates.length - 1], endPoint)) {
                pathCoordinates.push(endPoint);
            }

            if (pathCoordinates.length > 0) {
                addPolyline(pathCoordinates, 'blue');
                console.log("Route drawn successfully.");
            } else {
                console.error("Invalid path data received:", pathCoordinates);
                alert("No valid route found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error calculating route:", error);
            alert("Error calculating route. Please check your connection and try again.");
        })
        .finally(() => {
            // Remove loading animation
            button.classList.remove('loading');
            button.innerHTML = '<i class="fas fa-route"></i> Calculate Route';
        });
}

// Helper function to compare two coordinate arrays
function arraysEqual(arr1, arr2) {
    return (
        Array.isArray(arr1) &&
        Array.isArray(arr2) &&
        arr1.length === arr2.length &&
        arr1.every((val, index) => val === arr2[index])
    );
}

// Attach click listener to the map
map.on('click', onMapClick);

// Auto-resize map on window resize
window.addEventListener('resize', function() {
    map.invalidateSize();
});