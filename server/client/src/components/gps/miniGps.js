import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icone default di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Funzione per ottenere l'indirizzo tramite OpenStreetMap
async function getAddress(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Hook per click sulla mappa
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click: async (e) => {
      const address = await getAddress(e.latlng.lat, e.latlng.lng);
      if (onSelect) {
        onSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address: address || 'Posizione sconosciuta' });
      }
    },
  });
  return null;
}

export default function MiniGpsPage({ onSelect }) {
  const [position, setPosition] = useState(null);

  // Pulsante opzionale per geolocalizzazione
  const geoFindMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation non supportata dal browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (location) => {
      const { latitude, longitude } = location.coords;
      const address = await getAddress(latitude, longitude);
      const loc = { lat: latitude, lng: longitude, address: address || 'Posizione sconosciuta' };
      setPosition([latitude, longitude]);
      if (onSelect) onSelect(loc);
    }, () => {
      alert('Impossibile ottenere la posizione');
    });
  };

  return (
    <div className="flex flex-col" style={{padding: '10px'}}>
      <button onClick={geoFindMe} className="mb-2 px-2 py-1 bg-blue-500 text-white rounded w-auto">
        Usa la mia posizione
      </button>

      <MapContainer
        center={position || [41.9028, 12.4964]} // Roma di default
        zoom={13}
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {position && <Marker position={position} />}
        <MapClickHandler onSelect={(loc) => {
          setPosition([loc.lat, loc.lng]);
          if (onSelect) onSelect(loc);
        }} />
      </MapContainer>
    </div>
  );
}
