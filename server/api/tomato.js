const db = require('./mongo');
const TomatoUser = db.TomatoUser;

// Salva un nuovo timer nel DB
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
      startTime
    };

    if (!tomatoUser) {
      tomatoUser = new TomatoUser({ username, tomatoes: [newTomato] });
    } else {
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
  const { id, timeStudied } = req.body;

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
    tomato.live = false;

    await tomatoUser.save();

    res.status(200).json({ message: "Tomato updated", tomato });

  } catch (err) {
    console.error("Error updating tomato:", err);
    res.status(500).json({ message: "Error updating tomato", error: err });
  }
}

async function getLastTomato(req, res) {
  const username = db.env !== "DEV" ? req.user.username : "a"; 

  try {
    const tomatoUser = await TomatoUser.findOne({ username });

    if (!tomatoUser || tomatoUser.tomatoes.length === 0) {
      return res.status(404).json({ message: 'No tomatoes found for this user' });
    }

    const lastTomato = tomatoUser.tomatoes[tomatoUser.tomatoes.length - 1];
    res.status(200).json(lastTomato);
  } catch (err) {
    console.error('Error fetching last tomato:', err);
    res.status(500).json({ message: 'Error fetching last tomato', error: err });
  }
}


// Esporta le funzioni
module.exports = { saveTomato, updateTomato, getLastTomato };
