import React, { useState, useEffect, useRef } from 'react';

const TomatoPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [studying, setStudying] = useState(true);
  const [live, setLive] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [sTimeLeft, setSTimeLeft] = useState(0);

  const [studyInput, setStudyInput] = useState(0);
  const [pauseInput, setPauseInput] = useState(0);
  const [repetitionInput, setRepetitionInput] = useState(0);
  const [ogRepInput, setOgRepInput] = useState(0);
  const [cicli, setCicli] = useState(0);

  const [currentText, setCurrentText] = useState('');
  const [timerId, setTimerId] = useState(null);

  const [countdown, setCountdown] = useState(null);
  const pauseTimer = useRef(null);

  const serverUrl = 'http://localhost:3000'; // Backend URL

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!live) {
      const studyTimeValue = Number(studyInput);
      const pauseTimeValue = Number(pauseInput);
      const repTimeValue = Number(repetitionInput) - cicli;

      if (isNaN(studyTimeValue) || isNaN(pauseTimeValue) || isNaN(repTimeValue)) return;
      if (studyTimeValue === 0 || pauseTimeValue === 0 || repTimeValue === 0) return;

      setStudyInput(studyTimeValue);
      setPauseInput(pauseTimeValue);
      setRepetitionInput(repTimeValue);
      setOgRepInput(repTimeValue);
    }

    setIsRunning(!isRunning);
    setLive(true);

    if (!isRunning) {
      startTomatoTimer();
    } else {
      pauseTomato();
    }
  };

  const startTomatoTimer = () => {
    if (studying) {
      if (firstTime) {
        fetch(`${serverUrl}/saveTomato`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studyTime: studyInput,
            pauseTime: pauseInput,
            repeat: repetitionInput,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setTimerId(data.timerId);
          })
          .catch((error) => console.error('Error saving timer:', error));

        setFirstTime(false);
        startStudy(studyInput, pauseInput);
      } else {
        startStudy(timeLeft, pauseInput);
      }
    } else {
      if (firstTime) {
        setFirstTime(false);
        startPause(pauseInput, studyInput);
      } else {
        startPause(timeLeft, studyInput);
      }
    }
  };

  const startStudy = (time, pauseTime) => {
    if (repetitionInput <= 0) {
      // Reset state if repetitions are done
      resetTomato();
      return;
    }

    setStudying(true);
    setCurrentText('STUDYING...');
    let timer = time * 60;

    setCountdown(
      setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        document.getElementById('timerDisplay').textContent = `${formattedMinutes}:${formattedSeconds}`;

        const timerPercentage = ((studyInput * 60 - timer) / (studyInput * 60)) * 100;
        document.getElementById('circle2').style.height = `${timerPercentage}%`;

        timer--;
        if (timer < 0) {
          clearInterval(countdown);
          setTimeout(() => {
            setRepetitionInput((prev) => prev - 1);
            setCicli((prev) => prev + 1);
            setSTimeLeft(0);
            startPause(pauseTime, studyInput);
          }, 1000);
        }
        setTimeLeft(timer / 60);
      }, 1000)
    );
  };

  const startPause = (time, studyTime) => {
    setStudying(false);
    setCurrentText('BREAK!');
    let timer = time * 60;

    setCountdown(
      setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        document.getElementById('timerDisplay').textContent = `${formattedMinutes}:${formattedSeconds}`;

        const timerPercentage = ((pauseInput * 60 - timer) / (pauseInput * 60)) * 100;
        document.getElementById('circle2').style.height = `${timerPercentage}%`;

        timer--;
        if (timer < 0) {
          clearInterval(countdown);
          setTimeout(() => {
            startStudy(studyTime, pauseInput);
          }, 1000);
        }
        setTimeLeft(timer / 60);
      }, 1000)
    );
  };

  const pauseTomato = () => {
    clearInterval(countdown);
    pauseTimer.current = setTimeout(clearTomato, 30 * 60 * 1000); // Clears after 30 min if not resumed
  };

  const clearTomato = () => {
    if (!live) return;
    setTimeLeft(0);
    setRepetitionInput(0);
    clearInterval(countdown);
    clearTimeout(pauseTimer.current);
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('circle2').style.height = '0%';
    setCurrentText('');
  };

  const resetTomato = () => {
    // Reset all states and display after completion
    clearInterval(countdown);
    setFirstTime(true);
    setIsRunning(false);
    setLive(false);
    setCurrentText(`Completed: ${timePercent()}%`);
  };

  const timePercent = () => {
    const totalStudyTime = studyInput * 60 * ogRepInput;
    const totalStudied = cicli * studyInput * 60 + (studyInput * 60 - sTimeLeft * 60);
    return ((totalStudied / totalStudyTime) * 100).toFixed(2);
  };

  // Handle window unload to save state in localStorage
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('timerState', JSON.stringify({
        isRunning, studying, timeLeft, sTimeLeft, studyInput, pauseInput, repetitionInput, ogRepInput, cicli,
        firstTime, currentText, timerId, countdown, live
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
      setIsRunning(savedState.isRunning);
      setStudying(savedState.studying);
      setTimeLeft(savedState.timeLeft);
      setSTimeLeft(savedState.sTimeLeft);
      setStudyInput(savedState.studyInput);
      setPauseInput(savedState.pauseInput);
      setRepetitionInput(savedState.repetitionInput);
      setOgRepInput(savedState.ogRepInput);
      setCicli(savedState.cicli);
      setFirstTime(savedState.firstTime);
      setCurrentText(savedState.currentText);
      setTimerId(savedState.timerId);
      setLive(savedState.live);

      if (savedState.isRunning) {
        if (savedState.studying) {
          startStudy(savedState.timeLeft, savedState.pauseInput);
        } else {
          startPause(savedState.timeLeft, savedState.studyInput);
        }
      }
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center justify-center gap-5 bg-red-500 shadow-md rounded-xl p-5">
          <div id="interface" className="flex flex-col items-center gap-5">
            <label id="topText" htmlFor="timerInput" className="text-xl font-bold bg-white rounded-lg px-4 py-2">
              Entry study time in minute:
            </label>
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-5 font-medium">
                <div className="flex flex-col items-center">
                  <div className="mb-1" id="sT">STUDY TIME</div>
                  <input
                    type="number"
                    id="studyTime"
                    name="studyTime"
                    min="1"
                    value={studyInput}
                    onChange={(e) => setStudyInput(e.target.value)}
                    className="bg-white text-center text-lg font-semibold rounded-lg w-full h-12"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-1" id="pT">PAUSE TIME</div>
                  <input
                    type="number"
                    id="pauseTime"
                    name="pauseTime"
                    min="1"
                    value={pauseInput}
                    onChange={(e) => setPauseInput(e.target.value)}
                    className="bg-white text-center text-lg font-semibold rounded-lg w-full h-12"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-1" id="rep">REPETITION</div>
                  <input
                    type="number"
                    id="repTime"
                    name="repeat"
                    min="1"
                    value={repetitionInput}
                    onChange={(e) => setRepetitionInput(e.target.value)}
                    className="bg-white text-center text-2xl font-semibold rounded-lg w-28 h-28"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-center items-center mt-2">
                <button
                  id="startButton"
                  type="submit"
                  className="rounded-lg w-24 h-10 bg-white font-semibold text-lg shadow-md hover:bg-gray-400 hover:text-white active:bg-red-300"
                >
                  START
                </button>
                <button
                  id="pauseButton"
                  type="button"
                  onClick={clearTomato}
                  className="rounded-lg w-24 h-10 bg-white font-semibold text-lg shadow-md hover:bg-gray-400 hover:text-white active:bg-red-300"
                >
                  STOP
                </button>
              </div>
            </form>
          </div>

          <div id="circleWrap" className="relative">
            <div id="circle" className="relative w-48 h-48 rounded-full border-4 border-red-300 overflow-hidden">
              <div
                className="timer absolute text-center w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
                id="timerDisplay"
              >
                00:00
              </div>
              <div id="circle2" className="absolute bottom-0 w-full bg-red-300 transition-all duration-1000 ease-in-out"></div>
            </div>
          </div>

          <div
            id="current"
            className="text-white text-center flex items-center justify-center w-full h-10 text-xl bg-red-300 rounded-lg font-bold"
          >
            {currentText}
          </div>
        </div>
      </div>

      <div id="timerId" data-timerid={timerId}></div>
    </div>
  );
};

export default TomatoPage;
