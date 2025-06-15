import { useEffect } from 'react';
import { useTomato } from './tomatoContext';
import './tomato.css';

const PomodoroPage = () => {
  const {
    isRunning,
    timeLeft,
    handleStartStop, 
    handleRestart, 
    calculateCustomCycles,
    totalMinutes, 
    setTotalMinutes,
    studyDuration, 
    pauseDuration, 
    cycles,
    currentCycle,
    next,
    setTimeLeft,
    handleEndCycle
  } = useTomato();

  return (
    <div className="all">
      <div className="timer-box">
        <div className="up">
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
        </div>
        
        <div className='bot'>
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
    </div>
  );
};

export default PomodoroPage;


