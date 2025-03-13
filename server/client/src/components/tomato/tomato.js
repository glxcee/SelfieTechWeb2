
import React, { useState, useEffect, useRef } from 'react';
import './tomato.css';

export default function PomodoroPage() {
  const [totalMinutes, setTotalMinutes] = useState(175); 
  const [studyDuration, setStudyDuration] = useState(30); 
  const [pauseDuration, setPauseDuration] = useState(5); 
  const [cycles, setCycles] = useState(5); 
  const [overDuration, setOverDuration] = useState(0); // tempo in eccesso da aggiungere/togliere nell'ultimo ciclo

  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(''); // 'study' or 'pause'

  const [isRunning, setIsRunning] = useState(false);

  const [tomatoId, setTomatoId] = useState(null);

  // passaggio secondi => minuti e viceversa
  function secToMin(seconds) {
    return seconds /* * 60 */;
  }

  function minToSec(minutes) {
    return minutes / 60;
  }

  function notifyUser(message) {
    alert(message);
  }

  // richieste salvataggio/ update del tomato su database
  async function saveTomatoSession() {
    try {
      const response = await fetch('http://localhost:3001/api/tomato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTime: totalMinutes,
          studyTime: studyDuration,
          pauseTime: pauseDuration,
          overTime: overDuration,
          repetition: cycles,
          author: 'User123', // Da sostituire
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTomatoId(data.tomato._id);
      } else {
        console.error('Errore nel salvataggio:', data.message);
      }
    } catch (error) {
      console.error('Errore nella richiesta:', error);
    }
  }

  async function updateTomatoSession(tomatoId) {
    let over = 0;
    let cycles = currentCycle;
    if (currentPhase === 'study') {     // se interrompo durante lo studio 
      over = secToMin(studyDuration) - timeLeft;  // aggiungo il tempo a cui sono arrivato
      cycles -= 1;                      // rimuovo un ciclo (non l'ho completato)
    }

    const studied = (secToMin(studyDuration) * (cycles)) + (over);

    try {
        const response = await fetch('http://localhost:3001/api/tomato', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: tomatoId, 
                timeStudied: studied,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Tomato aggiornato:', data);
        } else {
            console.error('Errore nell\'aggiornamento:', data.message);
        }
    } catch (error) {
        console.error('Errore nella richiesta:', error);
    }
  }

  // calcolo cicli ottimali 
  function calculateCustomCycles(totalMinutes) { 
    if (totalMinutes < 70) {
      setTotalMinutes(70);
      setStudyDuration(30);
      setPauseDuration(5);
      setOverDuration(0);
      setCycles(2);
      return;
    }
  
    let bestCycles = 0;
    let bestStudyTime = 0;
    let bestPauseTime = 0;
    let difference = 0;
    let minDifference = Infinity;
  
    for (let cycles = Math.floor(totalMinutes / 35); cycles <= Math.floor(totalMinutes / 30); cycles++) {
      for (let studyTime = 35; studyTime >= 25; studyTime--) { // studio tra 25 e 35 minuti
        let pauseTime = Math.floor((totalMinutes - (studyTime * cycles)) / cycles);
  
        if (pauseTime >= 5 && pauseTime <= 10) { // Pause tra 5 e 10 minuti
          let totalUsed = (studyTime + pauseTime) * cycles;
          difference = totalMinutes - totalUsed;
  
          if (Math.abs(difference) < minDifference) { // mi salvo il match migliore possibile (con differenza minima)
            minDifference = Math.abs(difference);
            bestCycles = cycles;
            bestStudyTime = studyTime;
            bestPauseTime = pauseTime;
          } else if (difference === 0) {  // Se troviamo un match perfetto, interrompiamo il ciclo
            setStudyDuration(bestStudyTime);
            setPauseDuration(bestPauseTime);
            setCycles(bestCycles);
            return;
          }
        }
      }
    }
  
    // Impostiamo i valori migliori trovati
    setStudyDuration(bestStudyTime);
    setPauseDuration(bestPauseTime);
    setCycles(bestCycles);
    setOverDuration(difference);
  }

  // funzione per far partire o mettere in pausa
  function handleStartStop() {
    if (!isRunning) {
      if (currentPhase === '') {
        setCurrentPhase('study');
        setTimeLeft(secToMin(studyDuration));
        saveTomatoSession();
        notifyUser('New Tomato Started!');
      } else if (timeLeft <= 0){
        next();
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }

  // Reset del tomato
  function handleRestart() {
    setIsRunning(false);
    setCurrentPhase('');
    setCurrentCycle(1);
    setTimeLeft(0);
  }

  // fine di un ciclo (studio + pausa)
  async function handleEndCycle() {
    if (tomatoId) {  // Controlla che il tomatoId sia stato settato
      console.log('updating tomato!');
      await updateTomatoSession(tomatoId);
    }
    setIsRunning(false);
    handleRestart();
  }

  // aggiungo all'ultimo ciclo di studio il tempo avanzato nella ricerca dei valori ottimi 
  function addOvertimeLastCycle(){
    setStudyDuration((prevStudyDuration) => prevStudyDuration + overDuration);
  }

  // passaggio da study a pause
  function next() {  
    if (!isRunning && timeLeft <= 0) {
      if (currentPhase === 'study') {
        setCurrentPhase('pause');
        setTimeLeft(secToMin(pauseDuration));
        notifyUser('Pause Time');
      } else if (currentPhase === 'pause' && currentCycle < cycles) {
        if (currentCycle === (cycles - 1)) {
          addOvertimeLastCycle();
        }
        setCurrentPhase('study');
        setTimeLeft(secToMin(studyDuration));
        setCurrentCycle((prevCycle) => prevCycle + 1);
        notifyUser('Study Time');
      } else {
        handleEndCycle();
      }
    } else {
      return;
    }
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
  
      return () => clearInterval(timer); // Pulizia dell'intervallo quando il componente si smonta o `isRunning` cambia
    } else if (isRunning && timeLeft <= 0) {
      setIsRunning(false);
    }
  }, [isRunning, timeLeft]);

  return (
    <div className="container">
      <div className="timer-box">
        <div className="controls">
          <button 
            className='button-up'
            onClick={() => { setTotalMinutes((prev) => Number(prev) - 15); 
            calculateCustomCycles(Number(totalMinutes) - 15); }}> -
          </button>
          <span className="time-display">{totalMinutes} min</span>
          <button 
            className='button-up'
            onClick={() => { setTotalMinutes((prev) => Number(prev) + 15); 
            calculateCustomCycles(Number(totalMinutes) + 15); }}> +
          </button>
        </div>

        <form className="time-info">
          <div className="time-grid">
            <div className="info-box">
              <label> Study </label>
              <span> {studyDuration} min </span>
            </div>
            <div className="info-box">
              <label> Pause </label>
              <span> {pauseDuration} min </span>
            </div>
            <div className="info-box">
              <label> Cycles </label>
              <span> {cycles} </span>
            </div>
          </div>
        </form>

        <div className="buttons bottom">
          <button 
            className='start'          
            onClick={handleStartStop}> {isRunning ? 'Stop' : 'Start'} 
          </button>
          <div className='hidden-buttons'>
            <button 
              className='cycle-button'
              onClick={handleRestart}> Restart
            </button>
            <button 
              className='cycle-button'
              onClick={handleEndCycle}> End Tomato
            </button>
          </div>
        </div>

        <div className="cycle-info"> Cycle {currentCycle}/{cycles} </div>
        <div className="timer-display">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}