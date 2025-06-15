import { useNavigate } from 'react-router-dom';
import { useTomato } from './tomatoContext';
import LastTomatoInfo from './lastTomatoInfo'; 
import './miniTomato.css';

const formatTime = (secs) =>
  `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;

const MiniTomatoPage = () => {
  const navigate = useNavigate();
  const { timeLeft, isRunning, handleStartStop } = useTomato();

  return (
    <div className="tomato" onClick={() => navigate('/selfie/tomato')}>
      <div className="upper">
        <div className="time">
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();  // evita di navigare quando clicchi Start/Pause
            handleStartStop();
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>
 
      <div className="info">
        <LastTomatoInfo />
      </div>
    </div>
  );
};

export default MiniTomatoPage;