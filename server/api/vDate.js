const db = require('./mongo');
const VirtualDate = db.VirtualDate;

// Salva o aggiorna la VirtualDate dell'utente
async function postVirtualDate(req, res) {
    console.log("entering")
    const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
    console.log(user)

    if (user) {
        try {
            const newVirtualData = {
                vDate: new Date(req.body.virtualDate),
                rDate: new Date()
            };

            const updated = await VirtualDate.findOneAndUpdate(
                { username: user.username },
                newVirtualData,
                { new: true, upsert: true }
            );

            console.log("VirtualDate aggiornata:", updated);
            return res.status(200).send("Virtual date salvata correttamente");
        } catch (err) {
            console.error("Errore durante il salvataggio:", err);
            return res.status(500).send("Errore nel salvataggio della virtual date");
        }
    }

    return res.status(400).send("Utente non trovato");
}

async function getVirtualDate(req, res) {

    const user = db.env !== "DEV" ? req.user : await db.User.findOne({ username: "a" });
    console.log("Utente:", user);

    if (user) {
        try {
            const doc = await VirtualDate.findOne({ username: user.username });
            if (!doc) return res.status(404).send("Virtual date non trovata");

            return res.status(200).json(doc);
        } catch (err) {
            console.error("Errore durante la lettura:", err);
            return res.status(500).send("Errore durante il recupero della virtual date");
        }
    }

    return res.status(400).send("Utente non trovato");
}

module.exports = { postVirtualDate, getVirtualDate };