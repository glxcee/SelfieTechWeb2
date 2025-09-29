import { useState, useEffect } from 'react';
import MiniGpsPage from '../gps/miniGps.js';
import './eventModal.css';

export default function EventModal({ isOpen, onClose, onSave, selectedInfo, /*onTomatoClick*/}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const [earlyTime, setEarlyTime] = useState(5);
    const [repeatEvery, setRepeatEvery] = useState(0);
    const [untilSnooze, setUntilSnooze] = useState(false);
    const [earlyTimeUnit, setEarlyTimeUnit] = useState('minuti');
    const [repeatEveryUnit, setRepeatEveryUnit] = useState('minuti');
    const [allDay, setAllDay] = useState(false);

    // Per gli eventi periodici
    const [isPeriodic, setIsPeriodic] = useState(false);
    const [recurrenceDays, setRecurrenceDays] = useState([]); // array di giorni: ['MO', 'WE', 'FR']
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

    // Per le scadenze 
    const [isScadenza, setIsScadenza] = useState(false);

    // Per i tomato
    const [isTomato, setIsTomato] = useState(false);
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState(75); // default Pomodoro 75 min

    // Per la location
    const [location, setLocation] = useState(null); 
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        if (selectedInfo) {
            setTitle('');
            setDescription('');
            setRecurrenceDays([]);
            setRecurrenceEndDate('');
            setIsPeriodic(false);
            setIsScadenza(false);
            setAllDay(false);
            setIsTomato(false);
            setDate('');
            setDuration(75);
            setLocation(null);
            // Selezione inizio e fine manuali con orari specifici
            const startDate = selectedInfo.startStr ? new Date(selectedInfo.startStr) : new Date();
            const start = new Date(startDate);
            start.setHours(9, 0, 0, 0); // 09:00

            const endDate = selectedInfo.endStr ? new Date(selectedInfo.endStr) : new Date();
            const end = new Date(endDate);
            end.setHours(10, 0, 0, 0); // 10:00
            
            setStartDate(start.toISOString().split('T')[0]);
            setDate(start.toISOString().split('T')[0]);
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

    // Gestione delle 4 combinazioni
    let endValue;
    if (isScadenza && !allDay) {
        endValue = `${startDate}T${startTime}`;
    } else if (isScadenza && allDay) {
        endValue = startDate;
    } else if (!isScadenza && !allDay) {
        endValue = `${endDate}T${endTime}`;
    } else if (!isScadenza && allDay) {
        endValue = endDate;
    }

    function handleSubmit() {
        if (!title || !startDate || !startTime || !endDate || !endTime) {
            return alert('Compila tutti i campi obbligatori');
        }
        console.log("Salvataggio evento");

        let multiplier1 = 60000, multiplier2 = 60000
        if (earlyTimeUnit === 'ore') multiplier1 = 3600000;
        else if (earlyTimeUnit === 'giorni') multiplier1 = 86400000;

        if (repeatEveryUnit === 'ore') multiplier2 = 3600000;
        else if (repeatEveryUnit === 'giorni') multiplier2 = 86400000;
    
        onSave({
            title,
            description,
            start: !allDay ? `${startDate}T${startTime}` : `${startDate}T00:00`,
            end: endValue,
            allDay: allDay,
            notifyConfig: {
                earlyTime: earlyTime * multiplier1,
                repeatEvery: repeatEvery * multiplier2,
                untilSnooze
            },
            periodic: isPeriodic,
            recurrenceDays,
            recurrenceEndDate: isPeriodic ? recurrenceEndDate : null,
            scadenza: isScadenza,
            location: location || null,
        });
    
        onClose();
    }

    /*funzioni per il tomato*/

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
    function handleTomatoSubmit() {
        const [hours, minutes] = startTime.split(":").map(Number);
        const start = new Date(date);
        start.setHours(hours, minutes, 0, 0);

        // Controllo se la data e l'ora sono nel futuro
        if (start < new Date()) {
            alert("La data e l'orario devono essere futuri.");
            return;
        }

        const end = new Date(start.getTime() + duration * 60000);

        let multiplier1 = 60000, multiplier2 = 60000
        if (earlyTimeUnit === 'ore') multiplier1 = 3600000;
        else if (earlyTimeUnit === 'giorni') multiplier1 = 86400000;

        if (repeatEveryUnit === 'ore') multiplier2 = 3600000;
        else if (repeatEveryUnit === 'giorni') multiplier2 = 86400000;

        onSave({
            title: 'Pomodoro',
            description: 'Pomodoro di studio',
            start: start.toISOString(),
            end: end.toISOString(),
            allDay: false,
            notifyConfig: {
                earlyTime: earlyTime * multiplier1,
                repeatEvery: repeatEvery * multiplier2,
                untilSnooze
            },
            periodic: false,
            recurrenceDays,
            recurrenceEndDate: isPeriodic ? recurrenceEndDate : null
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
    /*fine funzioni per il tomato*/

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header m-upper flex justify-center gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setIsScadenza(false); 
                            setIsTomato(false);
                        }}
                        className={`px-4 py-2 border transition w-32
                        ${!isScadenza && !isTomato
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                        Evento
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsScadenza(true);
                            setIsTomato(false);
                        }}
                        className={`px-4 py-2 border transition w-32
                        ${isScadenza
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                        Scadenza
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsTomato(true);
                            setIsScadenza(false);
                        }}
                        className={`px-4 py-2 border transition w-32
                        ${isTomato
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                        🍅
                    </button>
                </div>

                <div className="modal-scrollable-content">
                    <div className="write-info">
                        {!isTomato && (
                        <>
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

                        {/* SWITCH "Tutto il giorno" fuori, sempre visibile */}
                        <div className="flex items-center gap-4 mt-1 mb-1">
                            <span className="font-semibold text-lg">Tutto il giorno</span>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="custom-switch"
                                    className="custom-toggle-checkbox"
                                    checked={allDay}
                                    onChange={(e) => setAllDay(e.target.checked)}
                                />
                                <label htmlFor="custom-switch" className="custom-toggle-label">Toggle</label>
                            </div>
                        </div>
                        </>
                        )}  
                    </div>

                    {!isScadenza && !isTomato && (
                    <>
                        <div className="time-info">
                        {!isPeriodic && (
                            <>
                            {!allDay ? (
                                <>
                                <label>Inizio:</label>
                                <div className="date-time">
                                    <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.target.showPicker()}
                                    />
                                    <select
                                    className="time-select"
                                    value={startTime}
                                    onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
                                    >
                                    {generateTimeOptions().map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                    </select>
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
                                    <select
                                    className="time-select"
                                    value={endTime}
                                    onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
                                    >
                                    {generateTimeOptions().map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                    </select>
                                </div>
                                </>
                            ) : (
                                <>
                                <input
                                    type="date"
                                    className="border px-3 py-2 rounded shadow text-lg"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                </>
                            )}
                            </>
                        )}
                        
                        </div>

                        <div className="recurrence-section">
                            <div className="flex items-center justify-center w-full">
                                <button
                                    type="button"
                                    onClick={() => setIsPeriodic(!isPeriodic)}
                                    className={`px-4 py-2 rounded-full border transition mt-3
                                    ${isPeriodic 
                                        ? 'bg-blue-500 text-white border-blue-500' 
                                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                                >
                                    Evento ricorrente
                                </button>
                            </div>

                        {isPeriodic && (
                            <>
                            <div className="weekday-selector flex flex-wrap gap-2 mt-2">
                                {[ 
                                { label: 'Lun', value: 'MO' },
                                { label: 'Mar', value: 'TU' },
                                { label: 'Mer', value: 'WE' },
                                { label: 'Gio', value: 'TH' },
                                { label: 'Ven', value: 'FR' },
                                { label: 'Sab', value: 'SA' },
                                { label: 'Dom', value: 'SU' }    
                                ].map(({ label, value }) => {
                                const isSelected = recurrenceDays.includes(value);
                                return (
                                    <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                        setRecurrenceDays(recurrenceDays.filter(d => d !== value));
                                        } else {
                                        setRecurrenceDays([...recurrenceDays, value]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-full border transition 
                                        ${isSelected 
                                        ? 'bg-blue-500 text-white border-blue-500' 
                                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'}
                                    `}
                                    >
                                    {label}
                                    </button>
                                );
                                })}
                            </div>

                            <div className="recurrence-end mt-4">
                                <label className="block mb-1">Fine ricorrenza:</label>
                                <input
                                type="date"
                                className="border px-2 py-1 rounded w-full"
                                value={recurrenceEndDate}
                                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                />
                            </div>
                            </>
                        )}
                        </div>
                        </>
                    )}

                    {isScadenza && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        {/* Input per la data di scadenza */}
                        <input
                        type="date"
                        className="border px-3 py-2 rounded shadow text-lg"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        />

                        {/* Input orario, visibile solo se allDay è true */}
                        {!allDay && (
                        <input
                            type="time"
                            className="mt-2 border px-3 py-2 rounded shadow text-xl"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        )}
                    </div>
                    )}

                    {isTomato && (
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
                    )}

                    <div className="flex flex-col items-center mt-4">
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
                        >
                            {location ? "Modifica posizione 📍" : "Aggiungi posizione 📍"}
                        </button>
                        {location && (
                            <p className="text-sm mt-2 text-gray-700">
                            Selezionato: {location.address} <br />
                            <span className="text-xs text-gray-500">
                                ({location.lat}, {location.lng})
                            </span>
                            </p>
                        )}
                    </div>

                    { isPeriodic ? "" : 
                    <div className="flex flex-col items-center justify-center pt-4 gap-1">
                        <h1 className='text-lg font-bold'>Config delle notifiche</h1>
                        <span className='text-sm'>Avviso prima dell'evento</span>
                        <div className='flex items-center justify-content-center text-sm gap-2'>
                            <input className='rounded-lg border p-1' type='number' min={0} defaultValue={5} onChange={e => setEarlyTime(e.target.value)} />
                                <select className='rounded-md border' onChange={e => setEarlyTimeUnit(e.target.value)} value={earlyTimeUnit}> 
                                    <option>minuti</option>
                                    <option>ore</option>
                                    <option>giorni</option>
                                </select>
                        </div>

                        <span className='text-sm'>Ripeti ogni</span>
                        <div className='flex items-center justify-content-center text-sm gap-2'>
                            <input className='rounded-lg border p-1' type='number' min={0} defaultValue={0} onChange={e => setRepeatEvery(e.target.value)} />
                                <select className='rounded-md border' onChange={e => setRepeatEveryUnit(e.target.value)} value={repeatEveryUnit}> 
                                    <option>minuti</option>
                                    <option>ore</option>
                                    <option>giorni</option>
                                </select>
                            
                        </div>

                        <div className='flex items-center justify-center text-md gap-2'>
                            <input
                                type="checkbox"
                                className='mt-2 bg-gray-300'
                                checked={untilSnooze}
                                onChange={(e) => setUntilSnooze(e.target.checked)}
                            />
                            <span className='pt-1'>Stop when snooze</span>
                        </div>
                    </div>
                    }
                    <div className="modal-actions">
                        <button onClick={isTomato ? handleTomatoSubmit : handleSubmit}>Salva</button>
                        <button onClick={onClose}>Annulla</button>
                    </div>

                </div>
            </div>
            {isLocationModalOpen && (
            <div className="modal-overlay" style={{ zIndex: 100000}}>
                <div 
                className="modal-content" 
                style={{ height: '470px', width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
                >
                    <div style={{ flex: 1, margin: '10px 0' }}>
                        <MiniGpsPage
                        onSelect={async (loc) => {
                            setLocation({ ...loc});
                            setIsLocationModalOpen(false);
                        }}
                        />
                    </div>

                    <div className="modal-actions flex justify-end gap-2 mt-2" >
                        <button onClick={() => setIsLocationModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mb-5">
                        Chiudi
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}