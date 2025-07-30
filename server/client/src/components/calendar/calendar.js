import { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import './calendar.css';
import EventModal from './eventModal.js';
import EventDeleteModal from './eventDeleteModal.js';
import TomatoModal from './tomatoModal';
import { address } from '../../utils.js';
import { useTimeMachine } from '../timeMachine/timeMachineContext.js';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import rrulePlugin from '@fullcalendar/rrule';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [events, setEvents] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTomatoModalOpen, setIsTomatoModalOpen] = useState(false);

  const [eventToDelete, setEventToDelete] = useState(null);

  const { virtualDate } = useTimeMachine();

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

  /*
  useEffect(() => {
    if (!calendarRef.current) return;
    const calendarApi = calendarRef.current.getApi();

    const now = new Date(virtualDate);
    calendarApi.gotoDate(now);

    // Cambia dinamicamente l'opzione 'now' (data "oggi")
    calendarApi.setOption('now', now.toISOString());

    // Forza refresh vista
    calendarApi.render();
  }, [virtualDate]);
  */

  async function fetchEventsFromDB() {
    try {
      const response = await fetch(address+'api/event');
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
    let endDateObj = new Date(selectInfo.endStr);
    endDateObj.setDate(endDateObj.getDate() - 1); // Aggiusto la data
    selectInfo.endStr = endDateObj.toISOString();
    setSelectedInfo(selectInfo);
    setIsModalOpen(true);
  }

  async function handleSaveEvent(eventData) {
    if (!selectedInfo) return;

    const event = {
        title: eventData.title,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        periodic: eventData.periodic || false,
        recurrenceDays: eventData.periodic ? eventData.recurrenceDays : null,
        recurrenceEndDate: eventData.periodic ? eventData.recurrenceEndDate : null,
        notifyConfig: eventData.notifyConfig
    };

    let calendarApi = selectedInfo.view.calendar;
    calendarApi.addEvent(event);

    await saveEventToDB(event);
    setIsModalOpen(false);
    setSelectedInfo(null);
  }

  async function saveEventToDB(event) {
    try {
      const response = await fetch(address+'api/event', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const responseText = await response.text(); // Leggi la risposta come testo
      console.log(responseText); // Aggiungi un log per ispezionare la risposta
      if (!response.ok) {
        throw new Error("Errore nel salvataggio dell'evento");
      }
      fetchEventsFromDB();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  function handleEventSelect(clickInfo) {
    setEventToDelete({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      description: clickInfo.event.extendedProps.description, 
    }); // Salva l'evento da eliminare
    setIsDeleteModalOpen(true); // Mostra il modale di conferma
  }

  function handleOpenTomatoModal() {
    setIsModalOpen(false);       // Chiude EventModal
    setIsTomatoModalOpen(true);  // Apre TomatoModal
    setSelectedDate(selectedInfo.startStr); // Passa la data selezionata a TomatoModal
  }

  async function handleTomatoConfirm(eventData) {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.addEvent(eventData);
    await saveEventToDB(eventData);
    setIsTomatoModalOpen(false); // Chiudi TomatoModal
  }

  function handleDeleteModalResponse(isConfirmed) {
    if (isConfirmed && eventToDelete) {
      deleteEventFromDB(eventToDelete.id); // Elimina l'evento dal DB
      let calendarApi = calendarRef.current.getApi();
      calendarApi.getEventById(eventToDelete.id)?.remove(); // Rimuovi l'evento dal calendario
    }
    setEventToDelete(null); // Resetta l'evento
  }

  async function deleteEventFromDB(eventId) {
    try {
      const response = await fetch(`${address}api/event/${eventId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Errore nell'eliminazione dell'evento");
      }

      fetchEventsFromDB(); // Ricarica gli eventi dopo l'eliminazione
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  return (
    <div className='outBox'>
      <div className="CalendarPage" style={{ width: '100%', overflow: 'hide' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, bootstrap5Plugin, rrulePlugin]}
          themeSystem="bootstrap5"
          initialView="dayGridMonth"
          selectable={true}
          select={handleDateSelect}
          events={events}
          eventClick={handleEventSelect}
          initialDate={virtualDate.toISOString()} // Imposta la data iniziale del calendario
          now={virtualDate.toISOString()}
          headerToolbar={{
            left: 'prev,next,today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short' // Mostra AM/PM
          }}
        />
        <EventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveEvent} 
          onTomatoClick={handleOpenTomatoModal}
          selectedInfo={selectedInfo}
        />
        <EventDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteModalResponse} // Passa la risposta
          event={eventToDelete}
        />
        <TomatoModal
          isOpen={isTomatoModalOpen}
          onClose={() => setIsTomatoModalOpen(false)}
          onConfirm={handleTomatoConfirm}
          selectedDate={selectedInfo?.startStr}
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
