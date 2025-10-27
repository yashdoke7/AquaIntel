import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LeafletMapProps {
  onStartPointSet?: (lat: number, lon: number) => void;
  onEndPointSet?: (lat: number, lon: number) => void;
  routePath?: [number, number][];
  clearTrigger?: number;
}

const LeafletMap = ({ 
  onStartPointSet, 
  onEndPointSet, 
  routePath = [],
  clearTrigger = 0
}: LeafletMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const clickCountRef = useRef(0);
  
  // Store callbacks in refs so they don't cause re-renders
  const onStartPointSetRef = useRef(onStartPointSet);
  const onEndPointSetRef = useRef(onEndPointSet);

  // Update refs when props change
  useEffect(() => {
    onStartPointSetRef.current = onStartPointSet;
    onEndPointSetRef.current = onEndPointSet;
  }, [onStartPointSet, onEndPointSet]);

  // Initialize map - ONLY ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const centerLat = parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || '18.525514');
    const centerLon = parseFloat(import.meta.env.VITE_MAP_CENTER_LON || '73.846069');
    const zoom = parseInt(import.meta.env.VITE_MAP_ZOOM || '5');

    const map = L.map(mapContainerRef.current).setView([centerLat, centerLon], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icons
    const createStartIcon = () => L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const createEndIcon = () => L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Handle map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      console.log(`Map clicked at: Latitude ${lat}, Longitude ${lng}`);

      if (clickCountRef.current === 0) {
        // Set start point
        if (startMarkerRef.current) {
          map.removeLayer(startMarkerRef.current);
        }
        
        startMarkerRef.current = L.marker([lat, lng], { icon: createStartIcon() })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <b style="color: green; font-size: 14px;">🚢 Start Point</b><br/>
              <span style="font-size: 11px;">Lat: ${lat.toFixed(4)}<br/>Lon: ${lng.toFixed(4)}</span>
            </div>
          `)
          .openPopup();
        
        // Use the ref to call the callback
        if (onStartPointSetRef.current) {
          onStartPointSetRef.current(lat, lng);
        }
        clickCountRef.current = 1;
        console.log(`Start Point Set: Latitude ${lat}, Longitude ${lng}`);
        
      } else if (clickCountRef.current === 1) {
        // Set end point
        if (endMarkerRef.current) {
          map.removeLayer(endMarkerRef.current);
        }
        
        endMarkerRef.current = L.marker([lat, lng], { icon: createEndIcon() })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <b style="color: red; font-size: 14px;">🎯 End Point</b><br/>
              <span style="font-size: 11px;">Lat: ${lat.toFixed(4)}<br/>Lon: ${lng.toFixed(4)}</span>
            </div>
          `)
          .openPopup();
        
        // Use the ref to call the callback
        if (onEndPointSetRef.current) {
          onEndPointSetRef.current(lat, lng);
        }
        clickCountRef.current = 0;
        console.log(`End Point Set: Latitude ${lat}, Longitude ${lng}`);
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty array - only initialize once!

  // Handle route drawing
  useEffect(() => {
    if (!mapRef.current || !routePath || routePath.length === 0) return;

    // Remove existing route
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Add new route with better styling
    routeLayerRef.current = L.polyline(routePath, { 
      color: '#3b82f6',      // Blue color
      weight: 4,              // Line thickness
      opacity: 0.8,           // Slight transparency
      smoothFactor: 1
    }).addTo(mapRef.current);

    // Fit bounds to show entire route with padding
    if (routePath.length > 2) {
      try {
        const bounds = routeLayerRef.current.getBounds();
        mapRef.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 10
        });
      } catch (error) {
        console.error("Error fitting bounds for polyline:", error);
      }
    }
  }, [routePath]);

  // Handle clear trigger
  useEffect(() => {
    if (clearTrigger === 0 || !mapRef.current) return;

    // Clear markers
    if (startMarkerRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    clickCountRef.current = 0;
  }, [clearTrigger]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[600px] rounded-lg"
      style={{ height: '100%' }}
    />
  );
};

export default LeafletMap;
