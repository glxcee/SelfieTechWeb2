import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { address } from '../../utils.js'; // URL del backend

const TimeMachineContext = createContext();
export const useTimeMachine = () => useContext(TimeMachineContext);

export const TimeMachineProvider = ({ children }) => {
  const [virtualDate, setVirtualDate] = useState(() => {
    const stored = localStorage.getItem('virtualDate');
    return stored ? new Date(stored) : null;
  });
  const intervalRef = useRef(null);

  // Inizializzazione asincrona di virtualDate da backend
  useEffect(() => {
    const initializeVirtualDate = async () => {
      try {
        const res = await fetch(address + 'api/virtualDate', {
          credentials: 'include' // se usi cookie/sessione
        });

        if (!res.ok) {
          console.error("Errore nel recupero virtual date:", await res.text());
          setVirtualDate(new Date()); // fallback
          return;
        }

        const data = await res.json();
        const vDate = new Date(data.vDate);
        const rDate = new Date(data.rDate);
        const now = new Date();

        const delta = now.getTime() - rDate.getTime();
        const computedVirtualDate = new Date(vDate.getTime() + delta);

        localStorage.setItem('virtualDate', computedVirtualDate.toISOString());
        setVirtualDate(computedVirtualDate);
      } catch (err) {
        console.error("Errore fetch virtual date iniziale:", err);
        setVirtualDate(new Date()); // fallback
      }
    };

    initializeVirtualDate();
  }, []);

  // Avanza il tempo ogni secondo
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setVirtualDate(prevDate => {
        const newDate = new Date(prevDate.getTime() + 1000);
        localStorage.setItem('virtualDate', newDate.toISOString());
        return newDate;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [virtualDate]);

  const resetVirtualDate = async () => {
    const now = new Date();
    setVirtualDate(now);
    localStorage.setItem('virtualDate', now.toISOString());

    try {
      const res = await fetch(address + 'api/virtualDate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ virtualDate: new Date()}),
      });

      if (!res.ok) {
        console.error("Errore salvataggio virtual date:", await res.text());
      }
    } catch (err) {
      console.error("Errore fetch virtual date:", err);
    }

    window.location.reload(); // ricarica pagina
  };

  const changeVirtualDate = async (newDateWithoutSeconds) => {
    const current = new Date(virtualDate); // copia per sicurezza
    newDateWithoutSeconds.setSeconds(current.getSeconds(), current.getMilliseconds());
    setVirtualDate(newDateWithoutSeconds);

    localStorage.setItem('virtualDate', newDateWithoutSeconds.toISOString());

    try {
      const res = await fetch(address + 'api/virtualDate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ virtualDate: newDateWithoutSeconds.toISOString()}),
      });

      if (!res.ok) {
        console.error("Errore salvataggio virtual date:", await res.text());
      }
    } catch (err) {
      console.error("Errore fetch virtual date:", err);
    }

    window.location.reload(); // ricarica pagina
  };

  return (
    <TimeMachineContext.Provider
      value={{ virtualDate, resetVirtualDate, changeVirtualDate }}
    >
      {children}
    </TimeMachineContext.Provider>
  );
};