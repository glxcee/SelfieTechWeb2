const db = require('./mongo');
const Event = db.Event;
const User = db.User;

async function setNotifications(event) { 
    const n1 = new db.Notification({
            name: event.title + " reminder!",
            description: event.title + " scheduled for " + event.start,
            user: event.user,
            type: event.title === "Tomato" ? "tomato" : "event", // Tipo di notifica
            event: event._id, // Riferimento all'evento appena creato
            date: (new Date(event.start) - 30000)
         })

    await n1.save()
}


// Salva un nuovo evento nel database
async function saveEvent(req, res) {
    try {
        console.log("Richiesta ricevuta per salvare un evento:", req.body);
        const { title, description, start, end } = req.body;
        const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})

        const newEvent = new Event({
            title,
            description,
            start,
            end,
            user: user.username, // Associa l'evento all'utente
        });

        await newEvent.save();
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
        const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
        const events = await Event.find({ user: user.username });
        res.json(events.map(event => ({
            id: event._id.toString(), // Converte _id in stringa
            title: event.title.toLowerCase() === 'pomodoro' ? '🍅' : event.title,   // visualizzazione del tomato nel calendar
            description: event.description,
            start: event.start,
            end: event.end,
            color: event.title.toLowerCase() === 'pomodoro' ? 'red' : 'light-blue' // Colore dinamico
        })));
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

module.exports = { saveEvent, getEvents, deleteEvent };