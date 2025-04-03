const db = require('./mongo');
const Event = db.Event;
const User = db.User;

// Salva un nuovo evento nel database
async function saveEvent(req, res) {
    try {
        console.log("Richiesta ricevuta:", req.body);
        console.log("Utente autenticato?", req.isAuthenticated());
        console.log("Dati utente:", req.user);
        /*
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        */
        console.log("Richiesta ricevuta per salvare un evento:", req.body);
        const { title, description, start, end } = req.body;
        const userId = 'user123'; // req.user?._id; // Recupera l'ID dell'utente autenticato

        if (!userId) {
            console.error("Errore: utente non autenticato");
            return res.status(401).json({ message: "User not authenticated" });
        }

        const newEvent = new Event({
            title,
            description,
            start,
            end,
            userId, // Associa l'evento all'utente
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
        const events = await Event.find({ userId: 'user123'/*req.user._id*/ });
        res.json(events);
    } catch (err) {
        console.error("Errore nel recupero degli eventi:", err);
        res.status(500).json({ message: "Errore del server" });
    }
}

// Elimina un evento specifico
async function deleteEvent(req, res) {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Evento non trovato" });
        }

        if (event.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorizzato" });
        }

        await event.deleteOne();
        res.json({ message: "Evento eliminato con successo" });
    } catch (err) {
        console.error("Errore nell'eliminazione dell'evento:", err);
        res.status(500).json({ message: "Errore del server" });
    }
}

module.exports = { saveEvent, getEvents, deleteEvent };