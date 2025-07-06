const db = require('./mongo');
const TomatoUser = db.TomatoUser;

// Salva un nuovo tomato
async function saveTomato(req, res) {
  const username = db.env !== "DEV" ? req.user.username : "a"; // o req.body.username in alternativa
  const { totalTime, studyTime, pauseTime, overTime, repetition, startTime } = req.body;

  try {
    let tomatoUser = await TomatoUser.findOne({ username });

    const newTomato = {
      totalTime,
      studyTime,
      pauseTime,
      overTime,
      repetition,
      startTime,
      live: true,  // nuovo tomato è live
    };

    if (!tomatoUser) {
      tomatoUser = new TomatoUser({ username, tomatoes: [newTomato] });
    } else {
      // Metti live: false su tutti i tomato live ed imposta il tempo studiato
      const now = new Date(startTime);

      tomatoUser.tomatoes.forEach(t => {
        if (t.live === true) {
          const start = new Date(t.startTime);
          const durationSec = t.totalTime * 60;
          const elapsed = Math.floor((now - start) / 1000);
          t.timeStudied = Math.min(Math.max(0, elapsed), durationSec);
          t.live = false;
        }
      });

      // Aggiungi il nuovo tomato live
      tomatoUser.tomatoes.push(newTomato);
    }

    await tomatoUser.save();

    const savedTomato = tomatoUser.tomatoes[tomatoUser.tomatoes.length - 1]; // ultimo aggiunto
    res.status(201).json({ message: "Tomato session saved", tomato: savedTomato });

  } catch (err) {
    console.error("Error saving tomato:", err);
    res.status(500).json({ message: "Error saving tomato", error: err });
  }
}

// Aggiorna il tempo studiato di un timer esistente
async function updateTomato(req, res) {
  const { id, timeStudied, live } = req.body;

  try {
    const tomatoUser = await TomatoUser.findOne({ "tomatoes._id": id });
    if (!tomatoUser) {
      return res.status(404).json({ message: "Tomato not found" });
    }

    const tomato = tomatoUser.tomatoes.id(id);
    if (!tomato) {
      return res.status(404).json({ message: "Tomato not found inside user" });
    }

    tomato.timeStudied = timeStudied;
    tomato.live = live; 

    await tomatoUser.save();

    res.status(200).json({ message: "Tomato updated", tomato });

  } catch (err) {
    console.error("Error updating tomato:", err);
    res.status(500).json({ message: "Error updating tomato", error: err });
  }
}

// Funzione per ottenere l'ultimo tomato con live === false
async function getLastTomato(req, res) {
  const username = db.env !== "DEV" ? req.user.username : "a"; 

  try {
    const tomatoUser = await TomatoUser.findOne({ username });

    if (!tomatoUser || tomatoUser.tomatoes.length === 0) {
      return res.status(404).json({ message: 'No tomatoes found for this user' });
    }

    // Cerca l'ultimo tomato con live === false
    const lastInactiveTomato = [...tomatoUser.tomatoes]
      .reverse()
      .find(t => t.live === false);

    if (!lastInactiveTomato) {
      return res.status(404).json({ message: 'No inactive tomatoes found for this user' });
    }

    res.status(200).json(lastInactiveTomato);
  } catch (err) {
    console.error('Error fetching last inactive tomato:', err);
    res.status(500).json({ message: 'Error fetching last inactive tomato', error: err });
  }
}

// Funzione per ottenere l'ultimo tomato live == true
async function getLiveTomato(req, res) {
  const username = db.env !== "DEV" ? req.user.username : "a";

  try {
    const tomatoUser = await TomatoUser.findOne({ username });

    if (!tomatoUser || tomatoUser.tomatoes.length === 0) {
      return res.status(404).json({ message: 'No tomatoes found for this user' });
    }

    // Cerca l'ultimo tomato con live === true
    const lastLiveTomato = [...tomatoUser.tomatoes]
      .reverse()
      .find(t => t.live === true);

    if (!lastLiveTomato) {
      return res.status(404).json({ message: 'No live tomatoes found for this user' });
    }

    res.status(200).json(lastLiveTomato);
  } catch (err) {
    console.error('Error fetching live tomato:', err);
    res.status(500).json({ message: 'Error fetching live tomato', error: err });
  }
}

// Esporta le funzioni
module.exports = { saveTomato, updateTomato, getLastTomato, getLiveTomato };
