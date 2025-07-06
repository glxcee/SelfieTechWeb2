// LastTomatoInfo.js
import React, { useState, useEffect } from 'react';
import { address } from '../../utils';
import './lastTomatoInfo.css';

export default function LastTomatoInfo() {
    const [lastTomato, setLastTomato] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLastTomato() {
            try {
                const res = await fetch(address + 'api/tomato/last');
                const data = await res.json();
                if (res.ok) {
                    setLastTomato(data);
                } else {
                    setError('Errore nel recuperare i dati.');
                }
            } catch (error) {
                setError('Errore nella connessione.');
                console.error('Errore nella fetch:', error);
            }
        }

        fetchLastTomato();
    }, []);

    function percent(stud, tot){
        if (tot === 0) return 0; // Evita la divisione per zero
        return (stud * 100) / tot;
    }

    function tot(s, p, r, o){
        return ((s + p) * r) + o;
    }

    function studyTime(t, r, o) {
        return (t * r) + o;
    }

    function pauseTime(t, r) {
        return t * r
    }

    function minToSec(minutes) {
        return minutes * 60;
    }

    function secToMin(seconds) {
        return seconds / 60;
    }

    function formatSecondsToMinSec(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
}

    return (
        <div className="last-tomato-info">
            {error && <div className="error">{error}</div>}
            {lastTomato ? (
                <>
                    <div className="tomato-title"><strong>Last Tomato</strong></div>
                    <div><strong>Session:</strong> {tot(lastTomato.studyTime, lastTomato.pauseTime, lastTomato.repetition, lastTomato.overTime)} min</div>
                    <div><strong>Study Time:</strong> {studyTime(lastTomato.studyTime, lastTomato.repetition, lastTomato.overTime)} min</div>
                    <div><strong>Pause Time:</strong> {pauseTime(lastTomato.pauseTime, lastTomato.repetition)} min</div>
                    <div><strong>Studied:</strong> {formatSecondsToMinSec(lastTomato.timeStudied)}</div>
                    <div><strong>Percent:</strong> {percent(lastTomato.timeStudied, minToSec(lastTomato.totalTime)).toFixed(2)} %</div>
                </>
            ) : (
                !error && <div>Caricamento...</div>
            )}
        </div>
    );
}
