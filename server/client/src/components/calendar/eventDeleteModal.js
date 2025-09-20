import { useState, useEffect } from 'react';
import './eventDeleteModal.css';
import { address } from '../../utils.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function DeleteModal({ isOpen, onClose, onConfirm, onUpdate, event }) {
    const [completed, setCompleted] = useState(false);
    const [initialCompleted, setInitialCompleted] = useState(false);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (event) {
            const initial = event.completed ?? false;
            setCompleted(initial);
            setInitialCompleted(initial);
            
        }
    }, [event?.id]);

    if (!isOpen || !event) return null;

    const isAllDay = event.allDay === true;
    const dateFormat = isAllDay
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

    const startText = event.start
        ? new Date(event.start).toLocaleString([], dateFormat)
        : 'Tutto il giorno';
    const endText = event.end
        ? new Date(event.end).toLocaleString([], dateFormat)
        : 'Tutto il giorno';

    async function handleConfirm(isConfirmed) {
        if (!isConfirmed && event.scadenza && completed !== initialCompleted) {
            try {
                const response = await fetch(`${address}api/event/${event.id}/completed`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed }),
                });

                if (!response.ok) throw new Error("Errore nell'aggiornamento dello stato completato");

                const updatedEventFromServer = await response.json();
                onUpdate(updatedEventFromServer);
            } catch (error) {
                console.error(error);
            }
        }
        setShowMap(false);
        onConfirm(isConfirmed);
        onClose();
    }

    return (
        <div className="dmodal-overlay">
            <div className="dmodal">
                <h1 className="event-t">{event.title}</h1>
                <h2 className="event-d">{event.description}</h2>
                <div className="event-dt">
                    <p className="event-start">Da: {startText}</p>
                    <p className="event-end">A: {endText}</p>
                </div>

                {event.scadenza && (
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <button
                            type="button"
                            onClick={() => setCompleted(!completed)}
                            style={{
                                backgroundColor: completed ? '#2563EB' : '#FFFFFF',
                                color: completed ? '#FFFFFF' : '#000000',
                                border: '1px solid #2563EB',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                userSelect: 'none',
                            }}
                        >
                            Completa
                        </button>
                    </div>
                )}

                {event.location?.lat && event.location?.lng && (
                    <div className="mt-3 w-full flex flex-col">
                        <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="view-location-btn"
                        >
                            {showMap ? 'Chiudi mappa' : 'Visualizza luogo 📍'}
                        </button>

                        {showMap && (
                            <div style={{ height: '300px', width: '100%', marginTop: '10px' }}>
                                <MapContainer
                                    center={[event.location.lat, event.location.lng]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />
                                    <Marker position={[event.location.lat, event.location.lng]}>
                                        <Popup>{event.location.address || 'Luogo selezionato'}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={() => handleConfirm(true)} className="delete-btn">
                        Elimina
                    </button>
                    <button onClick={() => handleConfirm(false)} className="cancel-btn">
                        Fine
                    </button>
                </div>
            </div>
        </div>
    );
}
