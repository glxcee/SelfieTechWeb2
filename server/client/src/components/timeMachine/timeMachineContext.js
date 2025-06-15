import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimeMachineContext = createContext();
export const useTimeMachine = () => useContext(TimeMachineContext);

export const TimeMachineProvider = ({ children }) => {
  const [virtualDate, setVirtualDate] = useState(new Date());
  const intervalRef = useRef(null);

  // Fa partire il timer che incrementa virtualDate ogni secondo
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setVirtualDate(prevDate => new Date(prevDate.getTime() + 1000)); // +1 secondo
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const resetVirtualDate = () => {
    setVirtualDate(new Date());
  };

  return (
    <TimeMachineContext.Provider
      value={{ virtualDate, setVirtualDate, resetVirtualDate }}
    >
      {children}
    </TimeMachineContext.Provider>
  );
};
