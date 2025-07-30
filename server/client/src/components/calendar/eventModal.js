import { useState, useEffect } from 'react';
import './eventModal.css';

export default function EventModal({ isOpen, onClose, onSave, selectedInfo, onTomatoClick}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const [earlyTime, setEarlyTime] = useState(0);
    const [repeatEvery, setRepeatEvery] = useState(0);
    const [untilSnooze, setUntilSnooze] = useState(false);
    const [earlyTimeUnit, setEarlyTimeUnit] = useState('minuti');
    const [repeatEveryUnit, setRepeatEveryUnit] = useState('minuti');
    const [hasTime, setHasTime] = useState(true);

    // Per gli eventi periodici
    const [isPeriodic, setIsPeriodic] = useState(false);
    const [recurrenceDays, setRecurrenceDays] = useState([]); // array di giorni: ['MO', 'WE', 'FR']
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

    // Per le scadenze 
    const [isScadenza, setIsScadenza] = useState(false);
    const [scadenzaDate, setScadenzaDate] = useState('');
    const [scadenzaTime, setScadenzaTime] = useState('08:00');


    useEffect(() => {
        if (selectedInfo) {
            setTitle('');
            setDescription('');
            setRecurrenceDays([]);
            setRecurrenceEndDate('');
            setIsPeriodic(false);
            setIsScadenza(false);
            setHasTime(true);
            // Selezione inizio e fine manuali con orari specifici
            const startDate = selectedInfo.startStr ? new Date(selectedInfo.startStr) : new Date();
            const start = new Date(startDate);
            start.setHours(9, 0, 0, 0); // 09:00

            const endDate = selectedInfo.endStr ? new Date(selectedInfo.endStr) : new Date();
            const end = new Date(endDate);
            end.setHours(10, 0, 0, 0); // 10:00
            
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

    function handleTomatoEvent() {
        if (onTomatoClick) onTomatoClick();
    }

    function handleSubmit() {
        if (!title || !startDate || !startTime || !endDate || !endTime) {
            return alert('Compila tutti i campi obbligatori');
        }
        
        const startDateTime = `${startDate}T${startTime}`;
        const endDateTime = `${endDate}T${endTime}`;

        let multiplier1 = 60000, multiplier2 = 60000
        if (earlyTimeUnit === 'ore') multiplier1 = 3600000;
        else if (earlyTimeUnit === 'giorni') multiplier1 = 86400000;

        if (repeatEveryUnit === 'ore') multiplier2 = 3600000;
        else if (repeatEveryUnit === 'giorni') multiplier2 = 86400000;
    
        onSave({
            title,
            description,
            start: startDateTime,
            end: endDateTime,
            notifyConfig: {
                earlyTime: earlyTime * multiplier1,
                repeatEvery: repeatEvery * multiplier2,
                untilSnooze
            },
            periodic: isPeriodic,
            recurrenceDays,
            recurrenceEndDate: isPeriodic ? recurrenceEndDate : null
        });
    
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                                <div className="m-upper flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsScadenza(false)}
                        className={`px-4 py-2 border transition w-32
                        ${!isScadenza
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                        Evento
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsScadenza(true)}
                        className={`px-4 py-2 border transition w-32
                        ${isScadenza
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                        Scadenza
                    </button>
                    <button onClick={handleTomatoEvent} className='tomato-event'>🍅</button>
                </div>
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

                    {/* SWITCH "Tutto il giorno" fuori, sempre visibile */}
                    <div className="flex items-center gap-4 mt-1 mb-1">
                        <span className="font-semibold text-lg">Tutto il giorno</span>
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="custom-switch"
                                className="custom-toggle-checkbox"
                                checked={hasTime}
                                onChange={(e) => setHasTime(e.target.checked)}
                            />
                            <label htmlFor="custom-switch" className="custom-toggle-label">Toggle</label>
                        </div>
                    </div>
                </div>

                {!isScadenza && (
                <>
                    <div className="time-info">
                    {!isPeriodic && (
                        <>
                        {!hasTime ? (
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
                                value={scadenzaDate}
                                onChange={(e) => setScadenzaDate(e.target.value)}
                            />
                            </>
                        )}
                        </>
                    )}
                    
                    </div>

                    <div className="recurrence-section">
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
                    value={scadenzaDate}
                    onChange={(e) => setScadenzaDate(e.target.value)}
                    />

                    {/* Input orario, visibile solo se hasTime è true */}
                    {!hasTime && (
                    <input
                        type="time"
                        className="mt-2 border px-3 py-2 rounded shadow text-xl"
                        value={scadenzaTime}
                        onChange={(e) => setScadenzaTime(e.target.value)}
                    />
                    )}
                </div>
                )}

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

                <div className="modal-actions">
                    <button onClick={handleSubmit}>Salva</button>
                    <button onClick={onClose}>Annulla</button>
                </div>
            </div>
        </div>
    );
}