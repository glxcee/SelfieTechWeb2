import { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import './calendar.css';
import EventModal from './eventModal.js';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    fetchEventsFromDB();

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.render();
      calendarApi.setOption('contentHeight', 450);
    }

    function handleResize() {
      setIsMobile(window.innerWidth < 600);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchEventsFromDB() {
    try {
      const response = await fetch('http://localhost:8000/api/event');
      if (!response.ok) {
        throw new Error('Errore nel caricamento degli eventi');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function handleDateSelect(selectInfo) {
    setSelectedInfo(selectInfo);
    setIsModalOpen(true);
  }

  async function handleSaveEvent(eventData) {
    if (!selectedInfo) return;
    const event = {
      title: eventData.title,
      description: eventData.description,
      start: selectedInfo.startStr,
      end: selectedInfo.endStr,
    };

    let calendarApi = selectedInfo.view.calendar;
    calendarApi.addEvent(event);

    await saveEventToDB(event);
    setIsModalOpen(false);
    setSelectedInfo(null);
  }

  async function handleDelete(clickInfo) {
    if (window.confirm(`Vuoi eliminare l'evento "${clickInfo.event.title}"?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/event/${clickInfo.event.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error("Errore nell'eliminazione dell'evento");
        }
        clickInfo.event.remove();
      } catch (error) {
        console.error('Errore:', error);
      }
    }
  }

  async function saveEventToDB(event) {
    try {
      const response = await fetch('http://localhost:8000/api/event', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error("Errore nel salvataggio dell'evento");
      }
      fetchEventsFromDB();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  return (
    <div className='outBox'>
      <div className="CalendarPage" style={{ width: '100%', overflow: 'hide' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          select={handleDateSelect}
          events={events}
          eventClick={handleDelete}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
        />
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveEvent} 
          selectedInfo={selectedInfo}  // Passa selectedInfo qui
        />
        <style>
          {`
            .fc-header-toolbar {
              ${isMobile ? 'flex-direction: column; gap: 10px;' : ''}
            }
          `}
        </style>
      </div>
    </div>
  );
}
