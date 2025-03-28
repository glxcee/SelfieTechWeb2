import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import './calendar.css';

export default function Calendar() {
  const calendarRef = useRef(null);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.render();
      calendarApi.setOption('contentHeight', 450);  // Imposta l'altezza desiderata
    }
  }, []);

  return (
    <div className='outBox'>
        <div className="CalendarPage" style={{ width: '100%', overflow: 'visible' }}>
        <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridDay"  // Imposta la vista iniziale (può essere 'dayGridMonth', 'timeGridWeek', 'timeGridDay')
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',  // Aggiungi i bottoni per le viste giornaliera, settimanale e mensile
            }}
        />
        </div>
    </div>
  );
}
