// Importazione dei moduli React e altri hook personalizzati
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { address } from '../../utils.js'; // URL del backend
import { useTimeMachine } from '../timeMachine/timeMachineContext'; // hook che fornisce virtualDate (orologio "finto")

// Creazione del contesto
const TomatoContext = createContext();
export const useTomato = () => useContext(TomatoContext);

// Provider del contesto
export const TomatoProvider = ({ children }) => {
  // Stato per controllare se il timer è attivo
  const [isRunning, setIsRunning] = useState(false);

  // Stato per la fase attuale del ciclo Pomodoro (study | pause | '')
  const [currentPhase, setCurrentPhase] = useState('');

  // Secondi rimanenti nella fase attuale
  const [timeLeft, setTimeLeft] = useState(0);

  // Durate configurabili del timer in minuti
  const [studyDuration, setStudyDuration] = useState(30);
  const [pauseDuration, setPauseDuration] = useState(5);
  const [overDuration, setOverDuration] = useState(0); // extra tempo nell'ultimo ciclo

  // Numero di cicli e ciclo corrente
  const [cycles, setCycles] = useState(2);
  const [currentCycle, setCurrentCycle] = useState(1);

  // Durata totale dell'intero Pomodoro (es. 70 minuti)
  const [totalMinutes, setTotalMinutes] = useState(70);

  // ID della sessione salvata nel backend
  const [tomatoId, setTomatoId] = useState(null);

  // Data/ora di inizio del Pomodoro
  const [startTime, setStartTime] = useState(null);

  // Backup dei parametri iniziali (per coerenza anche se l'utente modifica dopo l'avvio)
  const [initialStudyDuration, setInitialStudyDuration] = useState(null);
  const [initialPauseDuration, setInitialPauseDuration] = useState(null);
  const [initialOverDuration, setInitialOverDuration] = useState(null);
  const [initialCycles, setInitialCycles] = useState(null);

  // Tempo accumulato prima della pausa
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [lastResumeTime, setLastResumeTime] = useState(null); // ultima ripresa del timer

  const [newTomatoStartable, setNewTomatoStartable] = useState(true); // se un nuovo Pomodoro può essere avviato
  const [manualPause, setManualPause] = useState(false); // se l'utente ha messo in pausa manualmente

  // Orologio simulato
  const { virtualDate } = useTimeMachine();

  // Flag per evitare restore multipli
  const restoredRef = useRef(false);

  // Funzione di supporto per convertire minuti in secondi
  const secToMin = (minutes) => minutes * 60;

  // Salva una nuova sessione Pomodoro nel backend
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
          startTime: virtualDate.toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Errore sconosciuto');
      return data.tomato;
    } catch (err) {
      console.error('Errore nel salvataggio tomato:', err);
      throw err;
    }
  }

  // Aggiorna la sessione corrente con il tempo studiato finora
  async function updateTomatoSession(tomatoId) {
    const sDur = initialStudyDuration ?? studyDuration;

    // Calcola quanto è stato studiato
    let over = 0;
    let completedCycles = currentCycle;
    if (currentPhase === 'study') {
      over = secToMin(sDur) - timeLeft;
      completedCycles -= 1;
    }
    const studied = secToMin(sDur) * completedCycles + over;

    try {
      const response = await fetch(address + 'api/tomato', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: tomatoId, 
          timeStudied: studied, 
          live: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      console.log('Tomato aggiornato:', data);
    } catch (error) {
      console.error('Errore nella richiesta:', error);
    }
  }

  // Calcola il miglior mix di studio/pausa/cicli per una durata totale
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

  // Avvio o pausa del Pomodoro
  async function handleStartStop() {
    const now = new Date(virtualDate);
    if (!isRunning || (isRunning && newTomatoStartable)) {
      // Primo avvio
      if (newTomatoStartable) {
        setStartTime(now.toISOString());
        setLastResumeTime(now);
        setCurrentPhase('study');
        setTimeLeft(studyDuration * 60);
        setManualPause(false); // reset flag
        // Salvataggio parametri iniziali
        setInitialStudyDuration(studyDuration);
        setInitialPauseDuration(pauseDuration);
        setInitialOverDuration(overDuration);
        setInitialCycles(cycles);
        try {
          const saved = await saveTomatoSession();
          setTomatoId(saved._id);
          notifyUser('New Tomato Started!');
          setIsRunning(true);
        } catch {
          setCurrentPhase('');
        }
      } else {
        // Ripresa dopo pausa
        setLastResumeTime(now);
        setIsRunning(true);
        setManualPause(false); // reset flag
      }
    } else {
      // Messa in pausa
      const elapsedSinceLastResume = Math.floor((now - new Date(lastResumeTime)) / 1000);
      setElapsedBeforePause((prev) => prev + elapsedSinceLastResume);
      setIsRunning(false);
      setManualPause(true); // reset flag
    }
  }

  // Reset del timer (soft reset)
  function handleRestart() {
    setIsRunning(false);
    setCurrentPhase('');
    setCurrentCycle(1);
    setTimeLeft(0);
    setStartTime(null);
    setInitialStudyDuration(null);
    setInitialPauseDuration(null);
    setInitialOverDuration(null);
    setInitialCycles(null);
  }

  // Quando il Pomodoro è terminato
  async function handleEndTomato() {
    if (tomatoId) {
      try {
        await updateTomatoSession(tomatoId);
      } catch (err) {
        console.error("Errore nell'aggiornamento tomato:", err);
      }
    }
    setIsRunning(false);
    handleRestart();
  }

  // Mostra una notifica se il browser ha il permesso
  function notifyUser(message) {
    if (Notification.permission === 'granted') new Notification(message);
  }

  // Calcola dove si trova il timer dato il tempo trascorso
  const recalcPosition = (elapsed) => {
    const sDur = initialStudyDuration ?? studyDuration;
    const pDur = initialPauseDuration ?? pauseDuration;
    const oDur = initialOverDuration ?? overDuration;
    const reps = initialCycles ?? cycles;

    const segments = [];
    for (let c = 1; c <= reps; c++) {
      const studySec = sDur * 60 + (c === reps ? oDur * 60 : 0);
      segments.push({ phase: 'study', cycle: c, length: studySec });

      // Aggiunge la pausa dopo lo studio
      segments.push({ phase: 'pause', cycle: c, length: pDur * 60 });
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
    handleEndTomato();
  };

  // Effetto: ogni cambio della virtualDate o pausa/resume ricalcola il timer
  useEffect(() => {
    if (!startTime) return;

    const now = new Date(virtualDate);
    const start = new Date(startTime);
    const totalDuration = totalMinutes * 60;

    // Se siamo prima dell'inizio → timer non partito
    if (now < start) {
      setIsRunning(false);
      setCurrentPhase('');
      setTimeLeft(0);
      return;
    }

    // Se siamo in pausa, non fare nulla
    if (manualPause) return;

    // Tempo trascorso effettivo (tolto il tempo in pausa)
    const elapsed = elapsedBeforePause + Math.floor((now - lastResumeTime) / 1000);

    // Se superato, ferma tutto
    if (elapsed >= totalDuration) {
      setIsRunning(false);
      setCurrentPhase('');
      setTimeLeft(0);
      return;
    }

    recalcPosition(elapsed);
    setIsRunning(true);
  }, [virtualDate, startTime, totalMinutes, lastResumeTime, elapsedBeforePause, manualPause]);

  // Effetto: ripristina un Pomodoro live se esiste
  // Questo viene fatto una sola volta all'avvio del componente
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    async function restoreLiveTomato() {
      try {
        const res = await fetch(`${address}api/tomato/last-live?virtualDate=${virtualDate.toISOString()}`);
        if (!res.ok) return;

        const tomato = await res.json();
        if (!tomato.live) return;

        const {
          studyTime,
          pauseTime,
          overTime,
          repetition,
          startTime,
          totalTime,
          _id
        } = tomato;

        const start = new Date(startTime);
        const now = new Date(virtualDate);
        const elapsedSeconds = Math.floor((now - start) / 1000);
        const totalSeconds = totalTime * 60;

        if (elapsedSeconds < 0 || elapsedSeconds >= totalSeconds) return;

        // Ripristina i parametri base
        setStudyDuration(studyTime);
        setPauseDuration(pauseTime);
        setOverDuration(overTime);
        setCycles(repetition);
        setTotalMinutes(totalTime);
        setStartTime(startTime);
        setTomatoId(_id);
        setInitialStudyDuration(studyTime);
        setInitialPauseDuration(pauseTime);
        setInitialOverDuration(overTime);
        setInitialCycles(repetition);

        // Costruisce i segmenti temporali: studio e pausa per ogni ciclo
        const segments = [];
        for (let c = 1; c <= repetition; c++) {
          let studySec = studyTime * 60;
          if (c === repetition) {
            studySec += overTime * 60;
          }
          segments.push({ phase: 'study', cycle: c, length: studySec });

          // Aggiunge una pausa dopo ogni studio, compreso l'ultimo
          segments.push({ phase: 'pause', cycle: c, length: pauseTime * 60 });
        }

        // Determina la fase corrente in base al tempo trascorso
        let rem = elapsedSeconds;
        for (const seg of segments) {
          if (rem < seg.length) {
            setCurrentCycle(seg.cycle);
            setCurrentPhase(seg.phase);
            setTimeLeft(seg.length - rem);
            setIsRunning(true);
            setLastResumeTime(now);
            setElapsedBeforePause(elapsedSeconds);
            return;
          }
          rem -= seg.length;
        }

      } catch (err) {
        console.error("Errore durante il restoreLiveTomato:", err);
      }
    }

    restoreLiveTomato();
  }, [virtualDate]);


  // Effetto: abilita o disabilita la possibilità di avviare un nuovo tomato
  useEffect(() => {
    if (!startTime) {
      // Se il timer non è mai partito, posso iniziarne uno nuovo
      setNewTomatoStartable(true);
      return;
    }

    const now = new Date(virtualDate);
    const start = new Date(startTime);
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

    // Se siamo prima dell'inizio o dopo la fine → nuovo tomato avviabile
    if (now < start || now >= end) {
      setNewTomatoStartable(true);
    } else {
      // Se siamo dentro l'intervallo e c'è un timer in corso → non si può
      setNewTomatoStartable(false);
    }
  }, [virtualDate, startTime, totalMinutes, isRunning]);

  // Espone i valori del contesto
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
        handleEndTomato,
        calculateCustomCycles,
        newTomatoStartable,
      }}
    >
      {children}
    </TomatoContext.Provider>
  );
};