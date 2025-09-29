import { Link } from 'react-router-dom';
import { useTimeMachine } from '../components/timeMachine/timeMachineContext';
import { useEffect, useState } from 'react';
import { address } from "../utils"

export default function Header(props) {
  const { virtualDate, resetVirtualDate, changeVirtualDate } = useTimeMachine();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  {/*funzione temporanea*/} 
  const [realDate, setRealDate] = useState(new Date());

  function fetchNotifications() {
    fetch(`${address}api/notification`)
      .then(response => response.json())
      .then(data => {
        console.log("Notifiche ricevute:", data);

        let eventsSeen = []
        for (let i = 0; i < data.length; i++) {
          if(!eventsSeen.includes(data[i].event) ) {
            data[i].latest = true
            eventsSeen.push(data[i].event)
          }
        }

        setNotifications(data);
      })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRealDate(new Date());
    }, 1000);

    fetchNotifications()
    let notificationInterval = null

    const rn = new Date(virtualDate)
    
    const double0 = new Date(rn.getTime() + 60000)
    
    const waitTime = double0.setSeconds(0,0) - rn.getTime()
    console.log("Real Date!!!: ", rn, "Double 0: ", double0, "Wait Time: ", waitTime)
    // ogni minuto ma a 00
    setTimeout(() => {
      fetchNotifications()
      notificationInterval = setInterval(fetchNotifications, 60000)
    },waitTime)
    
    

    return () => {
      clearInterval(interval);
      if(notificationInterval) 
        clearInterval(notificationInterval);
    } 


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

  const notificationColor = {
    early: "bg-green-500",
    chill: "bg-yellow-500",
    warning: "bg-orange-500",
    close: "bg-red-500"
  }

  function calcColor(range, value) {
    const unit = range/4
    if (value <= unit) return "early"
    else if (value <= unit * 2) return "chill";
    else if (value <= unit * 3) return "warning";
    else return "close";
  }

  function snoozeNotification(eventId) {
    fetch(`${address}api/event/snooze/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log("Notification snoozed:", data);
      fetchNotifications(); // Ricarica le notifiche dopo lo snooze
    })
    .catch(error => {
      console.error("Error snoozing notification:", error);
    });
  }

  return (
    <header>
      <nav className="bg-white shadow py-4 w-full">
        <div className="px-2 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between px-8 gap-1 mx-auto flex-wrap">
            <div className=" flex items-center mr-4">
              <Link className="flex-shrink-0" to="/selfie">
              <button
                        type="button"
                        className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700  hover:bg-gray-100  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
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
              <div className="flex items-center ml-4 gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative hover:bg-gray-100 inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      width={30}
                      fill="none"
                      height={30}
                      className="text-gray-800"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                    <g id="SVGRepo_iconCarrier"></g>
                    <path
                    className='stroke-gray-700'
                      d="M9.00195 17H5.60636C4.34793 17 3.71872 17 3.58633 16.9023C3.4376 16.7925 3.40126 16.7277 3.38515 16.5436C3.37082 16.3797 3.75646 15.7486 4.52776 14.4866C5.32411 13.1835 6.00031 11.2862 6.00031 8.6C6.00031 7.11479 6.63245 5.69041 7.75766 4.6402C8.88288 3.59 10.409 3 12.0003 3C13.5916 3 15.1177 3.59 16.2429 4.6402C17.3682 5.69041 18.0003 7.11479 18.0003 8.6C18.0003 11.2862 18.6765 13.1835 19.4729 14.4866C20.2441 15.7486 20.6298 16.3797 20.6155 16.5436C20.5994 16.7277 20.563 16.7925 20.4143 16.9023C20.2819 17 19.6527 17 18.3943 17H15.0003M9.00195 17L9.00031 18C9.00031 19.6569 10.3435 21 12.0003 21C13.6572 21 15.0003 19.6569 15.0003 18V17M9.00195 17H15.0003"
                      
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    /></svg>
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 h-3 p-2 text-xs font-medium text-white bg-red-500 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <div className="relative inline-block text-left">
                    <div>
                    <Link to="/selfie/profile">
                      <button
                        type="button"
                        className="  flex items-center justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                      >
                        <svg
                          width={30}
                          fill="currentColor"
                          height={30}
                          className="text-gray-700"
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
      { showNotifications ?
      <div className='absolute top-64 right-10 sm:top-28 md:top-20 md:right-48 w-68 max-w-68 z-50 h-60 overflow-y-auto custom-scroll bg-gray-100 shadow-lg rounded-lg border divide-y'>
          {
            notifications.map((notification, index) => {
              const desc = notification.description.split(" ")
              const eventDate = new Date(desc[desc.length - 1])
              const range = new Date(eventDate) - new Date(notification.firstNotification)
              const value = new Date(notification.date) - new Date(notification.firstNotification)

              //console.log("Range: ", range, "First Notification: ", notification.firstNotification, "Event Date: ", eventDate, "Color: ", calcColor(range, value))

              return (
              <div key={index} className='p-3'>
                  <div className='flex gap-2 items-center'>
                    <h3 className="font-semibold">{notification.name}</h3>
                    <span className={`w-3 h-3 rounded-3xl  ${notificationColor[calcColor(range, value)]}`}> </span>
                  </div>
                  <p className="text-xs pt-1">{notification.description}</p>
                  <span className="text-xs text-gray-400">{new Date(notification.date).toLocaleString()}</span>
                  {
                    notification.latest && notification.snoozable ? <button onClick={() => snoozeNotification(notification._id)} className='text-sm py-1 px-2 mx-2 hover:bg-gray-800 hover:text-white transition-all duration-300'>Snooze</button> : ""
                  }
                  
                </div>
            )})
          }
      </div>
      : ""
      }
    </header>
  )
}