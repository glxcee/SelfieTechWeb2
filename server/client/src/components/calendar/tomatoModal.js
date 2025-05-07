import { useState, useEffect } from 'react';
import './eventModal.css';

export default function TomatoModal({ isOpen, onClose, onConfirm, selectedDate }) {
    const [date, setDate] = useState(selectedDate || "");  // Imposta la data passata tramite props

    useEffect(() => {
        if (selectedDate) {
        setDate(selectedDate);  // Aggiorna la data se viene passato un valore
        }
    }, [selectedDate]);

    const [startTime, setStartTime] = useState(getRoundedStartTime()); // Imposta l'orario di inizio al quarto d'ora più vicino
    const [duration, setDuration] = useState(75); // default Pomodoro 75 min

    // Funzione per ottenere l'orario arrotondato al quarto d'ora più vicino
    function roundToNextQuarterHour(date) {
        const ms = 1000 * 60 * 15; // 15 minuti in millisecondi
        return new Date(Math.ceil(date.getTime() / ms) * ms);
    }

    // Funzione per generare l'orario di inizio arrotondato al quarto d'ora più vicino
    function getRoundedStartTime() {
        const now = new Date();
        const roundedDate = roundToNextQuarterHour(now);
        const hours = roundedDate.getHours().toString().padStart(2, '0');
        const minutes = roundedDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Funzione per generare le opzioni dell'orario
    function generateTimeOptions() {
        const times = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                times.push(`${hour}:${minute}`);
            }
        }
        return times;
    }

    // Funzione per gestire il submit del modulo
    function handleSubmit() {
        if (!date || !startTime || !duration) {
            alert("Compila tutti i campi");
            return;
        }

        const [hours, minutes] = startTime.split(":").map(Number);
        const start = new Date(date);
        start.setHours(hours, minutes, 0, 0);

        // Controllo se la data e l'ora sono nel futuro
        if (start < new Date()) {
            alert("La data e l'orario devono essere futuri.");
            return;
        }

        const end = new Date(start.getTime() + duration * 60000);

        onConfirm({
            title: 'Pomodoro',
            description: 'Pomodoro di studio',
            start: start.toISOString(),
            end: end.toISOString()
        });
        onClose();
    }

    // Funzione per gestire il cambio della durata (assicurarsi che sia minimo 75)
    function handleDurationChange(e) {
        const newDuration = parseInt(e.target.value);
        if (newDuration < 75) {
            setDuration(75); // Imposta il valore minimo a 75
        } else {
            setDuration(newDuration);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="up-font">🍅</h2>
                <div className="time-info">
                    <label>Data:</label>
                    <input
                        type="date"
                        className="date-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => e.target.showPicker()}
                        min={new Date().toISOString().split('T')[0]} // Impedisce di selezionare una data passata
                    />

                    <label>Ora di inizio:</label>
                    <select
                        className="time-select"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    >
                        {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>

                    <label>Durata (minuti):</label>
                    <input
                        type="number"
                        className="duration-input"
                        value={duration}
                        onChange={handleDurationChange}
                        min={75} // Impedisce che la durata scenda sotto 75
                        step={15}
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={handleSubmit}>Conferma</button>
                    <button onClick={onClose}>Annulla</button>
                </div>
            </div>
        </div>
    );
}
