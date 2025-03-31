const express = require('express')
const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy;
const flash = require('connect-flash')
const expressSession = require("express-session");
const cors = require('cors')
const bcrypt = require("bcryptjs");

const db = require("./api/mongo")
const User = db.User

const app = express()
app.use(cors({
  origin: 'http://localhost:3000', // Consenti richieste solo da questo dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metodi consentiti
  credentials: true // Se stai usando cookie o autenticazione con credenziali
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    expressSession({
      secret: "yourSecretKey",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.username = req.isAuthenticated() ? req.user.username : null;
  next();
});


passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {     console.log("Checking username:", username);
      
      // Usa async/await invece del callback
      const user = await User.findOne({ username });

      if (!user) {
        console.log("User not found in the database.");
        return done(null, false, { message: 'Incorrect username.' });
      }

      console.log("User found, checking password...");
      
      // Prosegui con il controllo della password usando bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log("Password does not match");
        return done(null, false, { message: 'Incorrect password.' });
      }

      console.log("Password matches, authentication successful");
      return done(null, user);
      
    } catch (err) {
      console.log("Database error:", err);
      return done(err);
    }
  }
));

passport.serializeUser(function(user, done) {
  console.log("Serializing user:", user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user with ID:", id);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const ensureAuthenticated = (req, res, next) => {
  console.log(db.env)
  if(db.env === "DEV") return next()
  else {
    console.log("Is user authenticated?", req.isAuthenticated());
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
  }
};

function auth(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err); // Gestisce eventuali errori
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' }); // Restituisce un errore se l'autenticazione fallisce
    }
    req.login(user, (err) => {
      if (err) {
        return next(err); // Gestisce eventuali errori durante l'accesso
      }
      return res.status(200).json({ message: 'Authentication successful', user: { username: user.username } });
    });
  })(req, res, next);
}

app.post("/api/login", (req, res, next) => { return auth(req, res, next) });
  
app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' }); // Se l'utente esiste già
      }
  
      const hashedPassword = await bcrypt.hash(password, 10); // Crittografa la password
      const newUser = new User({
        username,
        password: hashedPassword,
      });
  
      await newUser.save(); // Salva il nuovo utente nel database

      await (new db.Profile({username})).save()
  
      return auth(req, res, next)

      //res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ message: 'Server error' }); // Gestisce eventuali errori del server
    }
});




const profile = require("./api/profile")

app.get('/api/profile',ensureAuthenticated, profile.get)
app.post('/api/profile', ensureAuthenticated, profile.post)

app.post('/api/profile/pic', ensureAuthenticated, profile.upload.single('image'),  profile.postPic)
app.get('/api/profile/pic', ensureAuthenticated, profile.getPic)
app.use('/cdn', express.static(__dirname + "/pics"));


// Tomato

const tomato = require('./api/tomato');

app.post('/api/tomato', ensureAuthenticated, tomato.saveTomato);
app.put('/api/tomato', ensureAuthenticated, tomato.updateTomato);

// Eventi

const eventController = require("./api/event");

app.post('/api/event', ensureAuthenticated, eventController.saveEvent);
app.get('/api/event', ensureAuthenticated, eventController.getEvents);
app.delete('/api/event/:id', ensureAuthenticated, eventController.deleteEvent);



const build = __dirname + "/client/build/"
app.use(express.static(build))

app.get('*',ensureAuthenticated, function (req, res) {
    res.sendFile(build+"index.html")
})

app.listen(8000, () => {
    console.log("Server online http://localhost:8000")
})

/*
app.get("/api/test1", async (req, res) => {
  try {
    const user = await User.findOne({ username: 'a' });
    if (user) {
      console.log("User found:", user);
    } else {
      console.log("User not found.");
    }
    res.send("Test completed");
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).send("Database error");
  }
});*/