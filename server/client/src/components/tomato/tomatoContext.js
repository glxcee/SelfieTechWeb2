import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { address } from '../../utils.js';
import { useTimeMachine } from '../timeMachine/timeMachineContext';

const TomatoContext = createContext();
export const useTomato = () => useContext(TomatoContext);

export const TomatoProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [studyDuration, setStudyDuration] = useState(25);
  const [pauseDuration, setPauseDuration] = useState(5);
  const [overDuration, setOverDuration] = useState(0);
  const [cycles, setCycles] = useState(2);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalMinutes, setTotalMinutes] = useState(70);
  const [tomatoId, setTomatoId] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const [elapsedBeforePause, setElapsedBeforePause] = useState(0); // tempo accumulato fino alla pausa
  const [lastResumeTime, setLastResumeTime] = useState(null); // timestamp dell'ultima ripresa

  const { virtualDate } = useTimeMachine();

  // Ref per tracciare la data virtuale all'ultimo aggiornamento in pausa
  const lastPausedVirtualDate = useRef(null);

  const secToMin = (minutes) => minutes * 60;

  // Salvataggio Tomato nel DB
  async function saveTomatoSession() {
    try {
      const response = await fetch(address + 'api/tomato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTime: totalMinutes,
          studyTime: studyDuration,
          pauseTime: pauseDuration,
          overTime: overDuration,
          repetition: cycles,
          startTime: virtualDate.toISOString(),   // includiamo virtualDate
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Errore sconosciuto');
      }
      return data.tomato;  // ritorniamo il tomato intero
    } catch (err) {
      console.error('Errore nel salvataggio tomato:', err);
      throw err;
    }
  }

  // Aggiornamento Tomato nel DB
  async function updateTomatoSession(tomatoId) {
    let over = 0;
    let completedCycles = currentCycle;
    if (currentPhase === 'study') {
      over = secToMin(studyDuration) - timeLeft;
      completedCycles -= 1;
    }
    const studied = secToMin(studyDuration) * completedCycles + over;

    try {
      const response = await fetch(address + 'api/tomato', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tomatoId,
          timeStudied: studied, // aggiorna il tempo studiato
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

  function calculateCustomCycles(total) {
    if (total < 70) {
      setTotalMinutes(70);
      setStudyDuration(30);
      setPauseDuration(5);
      setOverDuration(0);
      setCycles(2);
      return;
    }

    let bestCycles = 0, bestStudy = 0, bestPause = 0, minDiff = Infinity;
    for (let c = Math.floor(total / 35); c <= Math.floor(total / 30); c++) {
      for (let s = 35; s >= 25; s--) {
        const p = Math.floor((total - (s * c)) / c);
        if (p >= 5 && p <= 10) {
          const diff = Math.abs(total - ((s + p) * c));
          if (diff < minDiff) {
            minDiff = diff;
            bestCycles = c;
            bestStudy = s;
            bestPause = p;
          }
        }
      }
    }

    setStudyDuration(bestStudy);
    setPauseDuration(bestPause);
    setCycles(bestCycles);
    setOverDuration(total - ((bestStudy + bestPause) * bestCycles));
  }

 // Start / Stop handler
  async function handleStartStop() {
    const now = new Date(virtualDate);

    if (!isRunning) {
      // Avvio iniziale
      if (!startTime) {
        setStartTime(now.toISOString());
        setLastResumeTime(now);
        setCurrentPhase('study');
        const firstSec = studyDuration * 60;
        setTimeLeft(firstSec);
        try {
          const saved = await saveTomatoSession();
          setTomatoId(saved._id);
          notifyUser('New Tomato Started!');
          setIsRunning(true);
        } catch {
          setCurrentPhase('');
        }
      } else {
        // Ripresa dalla pausa
        setLastResumeTime(now);
        setIsRunning(true);
      }
    } else {
      // Messa in pausa → aggiungi il tempo trascorso da lastResumeTime a ora
      const elapsedSinceLastResume = Math.floor((now - new Date(lastResumeTime)) / 1000);
      setElapsedBeforePause((prev) => prev + elapsedSinceLastResume);
      setIsRunning(false);
    }
  }

  function handleRestart() {
    setIsRunning(false);
    setCurrentPhase('');
    setCurrentCycle(1);
    setTimeLeft(0);
    setStartTime(null);
  }

  async function handleEndCycle() {
    if (tomatoId) {
      console.log('updating tomato!');
      try {
        await updateTomatoSession(tomatoId);
      } catch (err) {
        console.error('Errore nell\'aggiornamento tomato:', err);
      }
    } else {
      console.warn('tomatoId non disponibile, salto l\'update');
    }
    setIsRunning(false);
    handleRestart();
  }

  function addOvertimeLastCycle() {
    setStudyDuration((prev) => prev + overDuration);
  }

  function next() {
    if (!isRunning && timeLeft <= 0) {
      if (currentPhase === 'study') {
        setCurrentPhase('pause');
        let seconds = secToMin(pauseDuration);
        setTimeLeft(seconds);
        setStartTime(virtualDate.toISOString());
        notifyUser('Pause Time');
      } else if (currentPhase === 'pause' && currentCycle < cycles) {
        if (currentCycle === (cycles - 1)) addOvertimeLastCycle();
        setCurrentCycle((prev) => prev + 1);
        setCurrentPhase('study');
        let seconds = secToMin(studyDuration);
        if (currentCycle === cycles) {
          seconds += overDuration;
        }       
        setTimeLeft(seconds);
        setStartTime(virtualDate.toISOString());
        notifyUser('Study Time');
      } else {
        handleEndCycle();
      }
    }
  }

  function notifyUser(message) {
    if (Notification.permission === 'granted') new Notification(message);
  }

  // Recompute phase/cycle based on elapsed seconds
  const recalcPosition = (elapsed) => {
    const segments = [];
    for (let c = 1; c <= cycles; c++) {
      const studySec = studyDuration * 60 + (c === cycles ? overDuration * 60 : 0);
      segments.push({ phase: 'study', cycle: c, length: studySec });
      if (c < cycles) segments.push({ phase: 'pause', cycle: c, length: pauseDuration * 60 });
    }
    let rem = elapsed;
    for (const seg of segments) {
      if (rem <= seg.length) {
        setCurrentCycle(seg.cycle);
        setCurrentPhase(seg.phase);
        setTimeLeft(seg.length - rem);
        return;
      }
      rem -= seg.length;
    }
    handleEndCycle();
  };

  // Sync on virtualDate change (forward or backward)
  useEffect(() => {
    if (!startTime) return;

    const now = new Date(virtualDate);

    let totalElapsed = elapsedBeforePause;
    if (isRunning && lastResumeTime) {
      const extra = Math.floor((now - new Date(lastResumeTime)) / 1000);
      totalElapsed += extra;
    }

    if (totalElapsed < 0) {
      handleRestart();
      return;
    }

    recalcPosition(totalElapsed);
  }, [virtualDate, isRunning, startTime, elapsedBeforePause, lastResumeTime]);

  return (
    <TomatoContext.Provider
      value={{
        isRunning,
        setIsRunning,
        currentPhase,
        timeLeft,
        setTimeLeft,
        studyDuration,
        pauseDuration,
        overDuration,
        cycles,
        currentCycle,
        totalMinutes,
        setTotalMinutes,
        handleStartStop,
        handleRestart,
        handleEndCycle,
        calculateCustomCycles,
        next,
      }}
    >
      {children}
    </TomatoContext.Provider>
  );
};
