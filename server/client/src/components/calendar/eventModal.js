import { useState, useEffect } from 'react';
import './eventModal.css';

export default function EventModal({ isOpen, onClose, onSave, selectedInfo }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        if (selectedInfo) {
            setTitle('');
            setDescription('');
            const start = selectedInfo.startStr ? new Date(selectedInfo.startStr) : new Date();
            const end = selectedInfo.endStr ? new Date(selectedInfo.endStr) : new Date(start.getTime() + 60 * 60 * 1000);
            
            /*
            let endDateObj = new Date(selectedInfo.endStr);
            endDateObj.setDate(endDateObj.getDate() - 1); // Aggiusto la data
            selectedInfo.endStr = endDateObj.toISOString();
            const end = selectedInfo.endStr ? new Date(selectedInfo.endStr) : new Date();
            */

            setStartDate(start.toISOString().split('T')[0]);
            setStartTime(start.toTimeString().slice(0, 5));
            setEndDate(end.toISOString().split('T')[0]);
            setEndTime(end.toTimeString().slice(0, 5));
        }
    }, [selectedInfo]);

// Mi assicuro che l'inizio non sia mai dopo la fine dell'evento
    function handleDateTimeChange(type, value) {
        let newStartDate = startDate;
        let newStartTime = startTime;
        let newEndDate = endDate;
        let newEndTime = endTime;
        
        if (type === 'startDate') {
            newStartDate = value;
            if (newStartDate > newEndDate) {
                newEndDate = newStartDate;
            }
            if (newStartTime > newEndTime) {
                newEndTime = newStartTime;
            }
        }
        if (type === 'startTime') {
            newStartTime = value;
            if (newStartTime > newEndTime && newStartDate === newEndDate) {
                newEndTime = newStartTime;
            }
        }
        if (type === 'endDate') {
            newEndDate = value;
            if (newStartDate > newEndDate) {
                newStartDate = newEndDate;
            }
            if (newStartTime > newEndTime) {
                newStartTime = newEndTime;
            }
        }
        if (type === 'endTime') {
            newEndTime = value;
            if (newStartTime > newEndTime && newStartDate === newEndDate) {
                newStartTime = newEndTime;
            }
        }

        setStartDate(newStartDate);
        setStartTime(newStartTime);
        setEndDate(newEndDate);
        setEndTime(newEndTime);
    }

    function handleSubmit() {
        if (!title || !startDate || !startTime || !endDate || !endTime) {
            return alert('Compila tutti i campi obbligatori');
        }
        onSave({
            title,
            description,
            start: new Date(`${startDate}T${startTime}`).toISOString(),
            end: new Date(`${endDate}T${endTime}`).toISOString()
        });
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="up-font">Crea un nuovo evento</h2>
                <div className="write-info">
                    <div className="title">
                        <label>Titolo:</label>
                        <input
                            type="text"
                            placeholder="Titolo"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="description">
                        <label>Descrizione:</label>
                        <textarea
                            placeholder="Descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="time-info">
                    <label>Inizio:</label>
                    <div className="date-time">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={(e) => e.target.showPicker()}
                        />
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={(e) => e.target.showPicker()}
                        />
                    </div>
                    <label>Fine:</label>
                    <div className="date-time">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={(e) => e.target.showPicker()}
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={(e) => e.target.showPicker()}
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={handleSubmit}>Salva</button>
                    <button onClick={onClose}>Annulla</button>
                </div>
            </div>
        </div>
    );
}