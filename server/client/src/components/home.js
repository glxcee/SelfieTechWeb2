import CalendarPage from './calendar/calendar';
import NotesPage from './notes/notes';
import GpsPage from './gps/gps';
import MiniTomatoPage from './tomato/miniTomato';
import TimeMachinePage from './timeMachine/timeMachine';
import NotificationPage from './notification/notification';

export default function Home() {
  return (
      <div className="flex flex-col md:flex-row justify-evenly items-start h-auto p-6">
          <div className="flex flex-col items-center justify-evenly w-full p-2">
              <div className="flex justify-center items-center w-full mb-5">
                  <CalendarPage />
              </div>
              <div className="flex flex-col xl:flex-row justify-between w-full mb-5">
                  <div className="flex justify-center items-center w-full mb-5 xl:mb-0">
                      <TimeMachinePage />
                  </div>
                  <div className="flex justify-center items-center w-full mb-5 xl:mb-0">
                      <MiniTomatoPage />
                  </div>
              </div>
          </div>
          <div className="flex flex-col items-center justify-evenly w-full p-2">
              <div className="flex flex-col xl:flex-row justify-between w-full mb-5">
                  <div className="flex justify-center items-center w-full mb-5 xl:mb-0">
                      <GpsPage />
                  </div>
                  <div className="flex justify-center items-center w-full mb-5 xl:mb-0">
                      <NotificationPage />
                  </div>
              </div>
              <div className="flex justify-center items-center w-full">
                  <NotesPage />
              </div>
          </div>
      </div>
  );
}
