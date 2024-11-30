const db = require('./mongo')
const Profile = db.Profile

const multer = require("multer")
const fs = require("fs")

async function getProfile(req, res) {
    console.log("entering")
    const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
    console.log(user)
    if(user) {
        try {

            const prof = await Profile.findOne({username: user.username})
            console.log(prof)
            return res.status(200).json(prof)//send("Profile updated")
        }
        catch(err) {
            return res.status(500).send("Couldn't update")
        }
    }
    return res.status(400).send("User not found")
}

async function postProfile(req, res) {
    console.log("entering")
    const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
    console.log(user)
    if(user) {
        try {
            const newProf = {
                name: req.body.name,
                surname: req.body.surname,
                birth: req.body.birth
            }

            const prof = await Profile.findOneAndUpdate({username: user.username}, newProf)
            console.log(prof)
            return res.status(200).send("Profile updated")
        }
        catch(err) {
            return res.status(500).send("Couldn't update")
        }

    }

    return res.status(400).send("User not found")

}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'pics/');
    },
    filename: (req, file, cb) => {
      var username = ""
      if(db.env === "DEV") username = "a"
      else username = req.user.username
  
      const filePath = "./pics/"+username+".jpg"
      
      if(fs.existsSync(filePath))
        fs.unlinkSync(filePath, (err) => {
          if (err) {
            console.error('Errore durante l\'eliminazione del file:', err);
          } else {
            console.log('File eliminato con successo');
          }
        });

      cb(null, username+".jpg"); // Aggiunge un timestamp al nome del file
    }
});

function postProfilePic(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Errore nel caricamento dell\'immagine.' });
    }

    res.json({ message: 'Immagine caricata con successo!', file: req.file });
}

module.exports = {
    get: getProfile,
    post: postProfile,
    upload: multer({ storage: storage }),
    postPic: postProfilePic
}