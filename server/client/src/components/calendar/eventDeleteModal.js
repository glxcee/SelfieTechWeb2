import './eventDeleteModal.css';

export default function DeleteModal({ isOpen, onClose, onConfirm, event }) {
    if (!isOpen || !event) return null;

    async function handleConfirm(isConfirmed) {
        onConfirm(isConfirmed); // Confermo il delete
        onClose(); // Chiude il modale
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h1 className="event-t">{event.title}</h1>
                <h2 className="event-d">{event.description}</h2>
                <div className="event-dt"> 
                    <p className="event-start"> Da: {event.start.toLocaleString([], { 
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                     })}</p>
                    <p className="event-end"> A: {event.end.toLocaleString([], { 
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                     })}</p>
                </div>
                <div className="modal-actions">
                    <button 
                        onClick={() => handleConfirm(true)} 
                        className="delete-btn" >
                        Elimina
                    </button>
                    <button 
                        onClick={() => handleConfirm(false)} 
                        className="cancel-btn" >
                        Annulla
                    </button>
                </div>
            </div>
        </div>
    );
}
