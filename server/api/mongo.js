const mongoose = require('mongoose')

mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("reconnected", () => console.log("Reconnected to MongoDB"));
mongoose.connection.on("disconnected", () => console.log("Disconnected from MongoDB"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

const mongoDBUri = "mongodb+srv://riccardomuzzi02:Nutella123@muzzicluster.qh3kblb.mongodb.net/?retryWrites=true&w=majority&appName=MuzziCluster"//"mongodb+srv://Angelo:WLJWOkYfAd6TjMIE@cluster0.jgbsgrq.mongodb.net/selfie?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDBUri);


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const profileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: String,
  surname: String,
  birth: String
});

const noteSchema = new mongoose.Schema({
    id: {type: String, required: true},
    title: {type: String, required: true},
    categories: [String],
    content: String,
    created: {type: Date, required: true},
    modified: Date
});

const bookSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    notes: [noteSchema]
});

const tomatoSchema = new mongoose.Schema({
    totalTime: Number,
    studyTime: Number,
    pauseTime: Number,
    overTime: Number,
    repetition: Number,
    timeStudied: { type: Number, default: 0},
    live: { type: Boolean, default: true },
    startTime: { type: Date, default: Date.now },
})

const tomatoUserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    tomatoes: [tomatoSchema]
})

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    start: { type: String, required: true },
    end: { type: String, required: true },
    user: { type: String, required: true } // { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associazione con l'utente
});

const VirtualDateSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    vDate: { type: Date, default: Date.now },
    rDate: { type: Date, default: Date.now }
})

const notificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    raed: { type: Boolean, default: false }, // Indica se la notifica è stata letta
    user: { type: String, required: true }, // Associazione con l'utente
    type: { type: String, required: true }, // Tipo di notifica (es. "event", "tomato", etc.)
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Riferimento all'evento associato
})

dev1 = 1 // 1: dev, 0: prod
module.exports = {
    env: dev1 ? "DEV" : "PROD",
    User: mongoose.model("User", userSchema),
    Profile: mongoose.model("Profile", profileSchema),
    Book: mongoose.model("Book", bookSchema),
    Tomato: mongoose.model("Tomato", tomatoSchema),
    Event: mongoose.model("Event", eventSchema), 
    TomatoUser: mongoose.model("TomatoUser", tomatoUserSchema),
    VirtualDate: mongoose.model("VirtualDate", VirtualDateSchema),
    Notification: mongoose.model("Notification", notificationSchema)
}