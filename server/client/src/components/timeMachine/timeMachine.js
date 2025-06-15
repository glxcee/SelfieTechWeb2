import { useTimeMachine } from './timeMachineContext';

export default function TimeMachine() {
  const { virtualDate, setVirtualDate } = useTimeMachine();

  function handleChange(e) {
    const newDate = new Date(e.target.value);
    setVirtualDate(newDate);
  }

  return (
    <div>
      <input
        type="datetime-local"
        value={virtualDate.toISOString().slice(0, 16)}
        onChange={handleChange}
      />
    </div>
  );
}
