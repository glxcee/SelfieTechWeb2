const db = require('./mongo');
const Event = db.Event;
const User = db.User;

const notify = require('./notification'); // Assicurati di avere un modulo per le notifiche




// Salva un nuovo evento nel database
async function saveEvent(req, res) {
    try {
        console.log("Richiesta ricevuta per salvare un evento:", req.body);
        const { title, description, start, end, periodic, recurrenceDays, recurrenceEndDate, notifyConfig } = req.body;
        const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });

        const newEvent = new Event({
            title,
            description,
            start,
            end,
            user: user.username,
            periodic: periodic === true || periodic === 'true',  // assicura boolean
            repeatDays: periodic ? (recurrenceDays || []).map(day => {
                // Mappa da ['MO','WE'] a numeri [1,3] compatibili con rrule
                // RRule usa 0=SU,1=MO,...6=SA
                const mapDayToNum = {SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6};
                return mapDayToNum[day] ?? null;
            }).filter(d => d !== null) : [],
            repeatUntil: periodic ? recurrenceEndDate || null : null,
            repeatEvery: notifyConfig.repeatEvery || 0, // Numero di ripetizioni della notifica
        });

        await newEvent.save();

        if(!newEvent.periodic)
            notify.set(newEvent, notifyConfig);

        console.log("Evento salvato con successo:", newEvent);
        res.status(201).json({ message: "Evento salvato con successo", event: newEvent });
    } catch (err) {
        console.error("Errore nel salvataggio dell'evento:", err);
        res.status(500).json({ message: "Errore del server", error: err.message });
    }
}

async function snoozeEvent(req, res) {
    try {
        const notificationId = req.params.id;
        const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });

        const notification = await db.Notification.findByIdAndUpdate(notificationId, { $set: { snoozable: false } });
        const event = await Event.findById(notification.event)
        const notifications = await db.Notification.find({ event: notification.event, user: user.username }).sort({ date: -1 });

        if(notifications[0]._id !== notificationId) {
            console.log("Notifica futura già messa in coda")
            await db.Notification.updateOne({ _id: notification[0] }, { $set: { date: event.start, snoozable: false } });
        }


        console.log("Posticipando l'evento per l'utente:", user.username);
        res.status(200).json({ message: "Evento posticipato con successo" });

        /*
        let timeMachine = await db.VirtualDate.findOne({ username: user.username });
            //console.log("USERNAME: ", user.username, "\nTIME MACHINE: ", timeMachine);
        if(!timeMachine) {
            return res.status(404).json({ message: "Time machine not found" });
        }
        const correctTime = (new Date(timeMachine.vDate)).getTime() + (Date.now() - (new Date(timeMachine.rDate)).getTime());
            */

        await Event.updateOne({ _id: notification.event }, { $set: { snoozedAt: new Date() } } );
        
    } catch(err) {
        console.error("Errore nel posticipare l'evento:", err);
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
      const base = {
        id: event._id.toString(),
        title: isPomodoro ? '🍅' : event.title,
        description: event.description,
        color: isPomodoro ? 'red' : 'light-blue'
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

module.exports = { saveEvent, getEvents, deleteEvent, snoozeEvent};