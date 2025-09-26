const db = require('./mongo');
const Event = db.Event;

const notify = require('./notification'); // Assicurati di avere un modulo per le notifiche



// Salva un nuovo evento nel database
async function saveEvent(req, res) {
    try {
        console.log("Richiesta ricevuta per salvare un evento:", req.body);
        const { title, description, start, end, allDay, periodic, recurrenceDays, recurrenceEndDate, notifyConfig, scadenza, location } = req.body;
        const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });

        const newEvent = new Event({
            title,
            description,
            start,
            end,
            allDay: allDay === true || allDay === 'true',
            user: user.username,
            periodic: periodic === true || periodic === 'true',
            repeatDays: periodic ? (recurrenceDays || []).map(day => {
                // Mappa da ['MO','WE'] a numeri [1,3] compatibili con rrule
                // RRule usa 0=SU,1=MO,...6=SA
                const mapDayToNum = {MO:0, TU:1, WE:2, TH:3, FR:4, SA:5, SU:6};
                return mapDayToNum[day] ?? null;
            }).filter(d => d !== null) : [],
            repeatUntil: periodic ? recurrenceEndDate || null : null,
            scadenza: scadenza === true || scadenza === 'true',
            location: location || null,
            repeatEvery: notifyConfig.repeatEvery || 0, // Numero di ripetizioni della notifica
        });

        await newEvent.save();

        notify.set(newEvent, notifyConfig);

        console.log("Evento salvato con successo:", newEvent);
        res.status(201).json({ message: "Evento salvato con successo", event: newEvent });
    } catch (err) {
        console.error("Errore nel salvataggio dell'evento:", err);
        res.status(500).json({ message: "Errore del server", error: err.message });
    }
}


// Recupera tutti gli eventi di un utente
async function getEvents(req, res) {
  try {
    const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });
    
    // Ottieni eventi dal DB
    const events = await Event.find({ user: user.username });

    // Mappa eventi nel formato richiesto da FullCalendar
    const formattedEvents = events.map(event => {
      const isPomodoro = event.title.toLowerCase() === 'pomodoro';

      // Determina il colore dell'evento
      let color;
      if (isPomodoro) {
        color = 'red';
      } else if (event.scadenza === true && event.completed === false) {
        color = 'grey';
      } else if (event.scadenza === true && event.completed === true) {
        color = 'green';
      } else {
        color = 'light-blue';
      }

      const base = {
        id: event._id.toString(),
        title: isPomodoro ? '🍅' : event.title,
        description: event.description,
        color: color,
        scadenza: event.scadenza,
        completed: event.completed,
        location: event.location || null
      };

      if (event.periodic) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const durationInSeconds = (endDate - startDate) / 1000;

        base.rrule = {
          freq: 'weekly',
          byweekday: event.repeatDays,  // array di numeri es: [1,3,5]
          dtstart: startDate.toISOString(),
          until: event.repeatUntil ? new Date(event.repeatUntil).toISOString() : undefined,
        };
        base.duration = durationInSeconds;
      } else {
        base.start = event.start;
        base.end = event.end;
        base.allDay = event.allDay;
      }

      return base;
    });

    res.json(formattedEvents);
  } catch (err) {
    console.error("Errore nel recupero degli eventi:", err);
    res.status(500).json({ message: "Errore del server" });
  }
}


// Elimina un evento specifico
async function deleteEvent(req, res) {
    console.log("ID ricevuto per l'eliminazione:", req.params.id);
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Evento non trovato" });
        }

        await event.deleteOne();
        res.json({ message: "Evento eliminato con successo" });
    } catch (err) {
        console.error("Errore nell'eliminazione dell'evento:", err);
        res.status(500).json({ message: "Errore del server" });
    }
}

// Aggiorna lo stato completed di un evento
async function updateEventCompleted(req, res) {
    try {
        const { completed } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Evento non trovato" });
            console.log("Evento non trovato con ID:", req.params.id);
        }

        event.completed = completed === true || completed === 'true';
        await event.save();

        res.json({ message: "Stato completato aggiornato", event });
    } catch (err) {
        console.error("Errore nell'aggiornamento completato:", err);
        res.status(500).json({ message: "Errore del server" });
    }
}

// Recupera tutti gli eventi con scadenza = true e completed = false
async function getUncompleted(req, res) {
  try {
    const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });

    const events = await Event.find({
      user: user.username,
      scadenza: true,
      completed: false,
    });

    res.json(events);
  } catch (err) {
    console.error("Errore nel recupero eventi non completati:", err);
    res.status(500).json({ message: "Errore del server" });
  }
}


module.exports = { saveEvent, getEvents, deleteEvent, updateEventCompleted, getUncompleted };
