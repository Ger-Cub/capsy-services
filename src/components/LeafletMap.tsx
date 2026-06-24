import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LeafletMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  address?: string;
}

export default function LeafletMap({ lat, lng, zoom = 15, title = "Capsy Services", address = "Goma, RDC" }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize leaflet map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        zoomControl: false, // will add customized or rely on default
      }).setView([lat, lng], zoom);

      // Add elegant map controls in a neat corner
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapRef.current);

      // Add a clean tile layer (CartoDB Positron Light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      // Custom CSS Pin to display the location beautifully
      const customIcon = L.divIcon({
        className: 'custom-tile-marker',
        html: `
          <div class="flex flex-col items-center shadow-md justify-center" style="transform: translate(-50%, -100%);">
            <div class="h-9 w-9 bg-[var(--color-brand-wellbeing)] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-wellbeing)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="bg-white px-2 py-0.5 rounded-md text-[8px] font-bold font-poppins text-brand-dark mt-1 border border-[var(--color-brand-wellbeing)] shadow-xs whitespace-nowrap">
              ${title}
            </div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 30]
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family: 'Poppins', sans-serif; font-size: 12px; color: #0c1d2d; padding: 4px;">
            <b style="color: var(--color-brand-wellbeing); font-weight: 700;">${title}</b><br/>
            <span style="font-size: 11px; color: #4B5563;">${address}</span>
          </div>
        `)
        .openPopup();
    } else {
      mapRef.current.setView([lat, lng], zoom);
    }

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, title, address]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '224px' }}>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl" style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
    </div>
  );
}
