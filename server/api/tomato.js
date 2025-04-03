const db = require('./mongo');
const Tomato = db.Tomato;

// Salva un nuovo timer nel DB
async function saveTomato(req, res) {
  try {
    console.log('Request body:', req.body); // Log per debug

    const { totalTime, studyTime, pauseTime, overTime, repetition, author } = req.body;

    const newTomato = new Tomato({
      totalTime,
      studyTime,
      pauseTime,
      overTime,
      repetition,
      author,
      timeStudied: 0,
      live: true,
    });

    const savedTomato = await newTomato.save();
    res.status(201).json({ message: 'Tomato session saved successfully', tomato: savedTomato });
  } catch (err) {
    console.error('Error saving tomato:', err);
    res.status(500).json({ message: 'Error saving tomato', error: err });
  }
}

// Aggiorna il tempo studiato di un timer esistente
async function updateTomato(req, res) {
  try {
    const { id, timeStudied } = req.body;

    const tomato = await Tomato.findById(id);
    if (!tomato) {
      return res.status(404).json({ message: 'Tomato not found' });
    }

    tomato.timeStudied = timeStudied;
    tomato.live = false;

    await tomato.save();
    res.status(200).json({ message: 'Tomato updated successfully', tomato });
  } catch (err) {
    console.error('Error updating tomato:', err);
    res.status(500).json({ message: 'Error updating tomato', error: err });
  }
}

// Esporta le funzioni
module.exports = { saveTomato, updateTomato };
