import { Link } from 'react-router-dom';
import { useTimeMachine } from '../components/timeMachine/timeMachineContext';
import { useEffect, useState } from 'react';
import { address } from "../utils"

export default function Header(props) {
  const { virtualDate, resetVirtualDate, changeVirtualDate } = useTimeMachine();

  {/*funzione temporanea*/} 
  const [realDate, setRealDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setRealDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  {/*funzione temporanea*/} 

  function toLocalDateTimeString(date) {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function formatWithSeconds(date) {
    return date.toLocaleString(undefined, {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  const handleChange = (e) => {
    const selected = new Date(e.target.value);
    changeVirtualDate(selected); // centralizzata nel context
  };

  return (
    <header>
      <nav className="bg-white shadow py-4 fixed top-0 left-0 w-full z-50">
        <div className="px-2 mx-auto max-w-7xl">
          <div className="flex items-center justify-between px-8 mx-auto max-w-7xl">
            <div className=" flex items-center mr-4">
              <Link className="flex-shrink-0" to="/selfie">
              <button
                        type="button"
                        className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700  hover:bg-gray-50  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                      >
              
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-house-door-fill" viewBox="0 0 16 16">
                <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
              </svg>
              
              </button>
              </Link>
            </div>

            {/* Time Machine Controls */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <label className="flex items-center space-x-2">
              <input
                type="datetime-local"
                value={toLocalDateTimeString(virtualDate)}
                onChange={handleChange}
                className="rounded-md px-2 py-1 text-sm text-gray-700 border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
              />
              </label>

              <button
                onClick={resetVirtualDate}
                className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300 transition"
              >
                Reset Date
              </button>

              <div className="flex flex-col text-sm text-gray-600 space-y-1 text-center">
                <span>🕒 Reale: {formatWithSeconds(realDate)}</span>
                <span>🕒 Virtuale: {formatWithSeconds(virtualDate)}</span>
              </div>
            </div>
            
            <div className="block">
              <div className="flex items-center ml-4">
                <div className="relative">
                  <div className="relative inline-block text-left">
                    <div>
                    <Link to="/selfie/profile">
                      <button
                        type="button"
                        className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                      >
                        <svg
                          width={30}
                          fill="currentColor"
                          height={30}
                          className="text-gray-800"
                          viewBox="0 0 1792 1792"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M1523 1339q-22-155-87.5-257.5t-184.5-118.5q-67 74-159.5 115.5t-195.5 41.5-195.5-41.5-159.5-115.5q-119 16-184.5 118.5t-87.5 257.5q106 150 271 237.5t356 87.5 356-87.5 271-237.5zm-243-699q0-159-112.5-271.5t-271.5-112.5-271.5 112.5-112.5 271.5 112.5 271.5 271.5 112.5 271.5-112.5 112.5-271.5zm512 256q0 182-71 347.5t-190.5 286-285.5 191.5-349 71q-182 0-348-71t-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"></path>
                        </svg>
                        
                      </button>
                      </Link>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </nav>

    </header>
  )
}