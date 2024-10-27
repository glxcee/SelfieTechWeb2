import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function MiniGpsPage() {
  const [position, setPosition] = useState(null); // State for the marker position
  const [status, setStatus] = useState(''); // State to hold the status message

  const geoFindMe = () => {
    setStatus('Locating…'); // Set initial status

    const success = (location) => {
      const { latitude, longitude } = location.coords;
      setPosition([latitude, longitude]); // Set position for the marker
      setStatus(''); // Clear status
    };

    const error = () => {
      setStatus('Unable to retrieve your location'); // Update status on error
    };

    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser'); 
    } else {
      navigator.geolocation.getCurrentPosition(success, error); 
    }
  };

  // Apertura automatica della mappa
  useEffect(() => {
    geoFindMe();
  }, []);

  return (
    <div>
      <p id="status">{status}</p>

      {position && (
        <MapContainer 
          center={position} 
          zoom={13} 
          className="relative p-4 overflow-hidden text-gray-700 bg-white shadow-lg rounded-xl w-60 md:w-72 dark:bg-gray-800 dark:text-gray-100"
          style={{ height: "300px"}}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              Your current location!
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}
