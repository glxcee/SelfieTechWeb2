import { useState, useEffect } from 'react';
import './eventDeleteModal.css';
import { address } from '../../utils.js';

export default function DeleteModal({ isOpen, onClose, onConfirm, onUpdate, event }) {
    const [completed, setCompleted] = useState(false);
    const [initialCompleted, setInitialCompleted] = useState(false);

    useEffect(() => {
        if (event) {
            const initial = event.completed ?? false;
            setCompleted(initial);
            setInitialCompleted(initial);
        }
    }, [event?.id]);

    if (!isOpen || !event) return null;

    console.log("Evento in DeleteModal:", event);

    const isAllDay = event.allDay === true; // Potrebbe essere undefined se non presente
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
        if (!isConfirmed) {
            // Solo se l'utente preme "Fine"
            if (event.scadenza && completed !== initialCompleted) {
                try {
                    const url = address + `/api/event/${event.id}/completed`;
                    console.log("DEBUG - PATCH to:", url);
                    console.log("DEBUG - event.id:", event.id);
                    console.log("DEBUG - completed:", completed);

                    const response = await fetch(`${address}api/event/${event.id}/completed`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed }),
                    });

                    if (!response.ok) {
                        throw new Error("Errore nell'aggiornamento dello stato completato");
                    }
                    
                    // Aspetto la risposta JSON con l'evento aggiornato completo
                    const updatedEventFromServer = await response.json();

                    onUpdate(updatedEventFromServer);  // Passa evento aggiornato completo 
                } catch (error) {
                    console.error(error);
                }
            }
        }

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
                        backgroundColor: completed ? '#2563EB' : '#FFFFFF', // blu o bianco
                        color: completed ? '#FFFFFF' : '#000000',          // bianco o nero
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

                <div className="modal-actions">
                    <button
                        onClick={() => handleConfirm(true)}
                        className="delete-btn"
                    >
                        Elimina
                    </button>
                    <button
                        onClick={() => handleConfirm(false)}
                        className="cancel-btn"
                    >
                        Fine
                    </button>
                </div>
            </div>
        </div>
    );
}