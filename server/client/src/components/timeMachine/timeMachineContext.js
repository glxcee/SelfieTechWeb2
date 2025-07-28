import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimeMachineContext = createContext();
export const useTimeMachine = () => useContext(TimeMachineContext);

export const TimeMachineProvider = ({ children }) => {
  const [virtualDate, setVirtualDate] = useState(() => {
    const saved = localStorage.getItem('virtualDate');
    return saved ? new Date(saved) : new Date();
  });

  const intervalRef = useRef(null);

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
  }, []);

  const resetVirtualDate = () => {
    const now = new Date();
    setVirtualDate(now);
    localStorage.setItem('virtualDate', now.toISOString());
    window.location.reload(); // ricarica pagina
  };

  const changeVirtualDate = (newDateWithoutSeconds) => {
    const current = new Date(virtualDate); // copia per sicurezza
    newDateWithoutSeconds.setSeconds(current.getSeconds(), current.getMilliseconds());
    setVirtualDate(newDateWithoutSeconds);
    localStorage.setItem('virtualDate', newDateWithoutSeconds.toISOString());
    window.location.reload(); // ricarica pagina
  };

  return (
    <TimeMachineContext.Provider
      value={{ virtualDate, setVirtualDate, resetVirtualDate, changeVirtualDate }}
    >
      {children}
    </TimeMachineContext.Provider>
  );
};