import { useState, useEffect } from 'react';
import './eventDeleteModal.css';
import { address } from '../../utils.js';

export default function UncompletedListModal({ isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadUncompleted() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(address + 'api/events/uncompleted');
      if (!res.ok) throw new Error('Errore nel caricamento delle scadenze');
      const data = await res.json();

      // Ordina per data crescente
      data.sort((a, b) => new Date(a.start) - new Date(b.start));

      setEvents(data.map(e => ({ ...e, checked: false })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleClose = async () => {
    const selected = events.filter(e => e.checked);
    for (const e of selected) {
      try {
        await fetch(address + `api/event/${e._id}/completed`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        });
      } catch (err) {
        console.error('Errore aggiornamento evento', e._id, err);
      }
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      loadUncompleted();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dmodal-overlay" onClick={onClose}>
      <div className="pmodal" onClick={e => e.stopPropagation()}>
        <h1 className="event-t">Prossime scadenze</h1>

        {loading && <p>Caricamento...</p>}
        {error && <p className="error-msg">{error}</p>}

        {!loading && !error && (
          <>
            {events.length === 0 && <p>Nessuna scadenza non completata</p>}
            <div className="uncompleted-scroll">
              <ul className="uncompleted-list">
                {events.map(event => {
                  const dateFormat = event.allDay
                    ? { year: 'numeric', month: '2-digit', day: '2-digit' }
                    : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

                  const startText = event.start
                    ? new Date(event.start).toLocaleString([], dateFormat)
                    : 'Tutto il giorno';

                  return (
                    <li key={event._id} className="uncompleted-item">
                      <div className="event-content">
                        <div>
                          <strong>{event.title}</strong>
                          <div className="event-desc">{event.description}</div>
                          <div className="event-date">{startText}</div>
                        </div>
                        <input 
                          type="checkbox"
                          className="event-checkbox"
                          checked={event.checked}
                          onChange={() => {
                            setEvents(prev =>
                              prev.map(ev =>
                                ev._id === event._id ? { ...ev, checked: !ev.checked } : ev
                              )
                            );
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button onClick={handleClose} className="cancel-btn">Chiudi</button>
        </div>
      </div>
    </div>
  );
}
