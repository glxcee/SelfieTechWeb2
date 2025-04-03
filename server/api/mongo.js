const mongoose = require('mongoose')

mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("reconnected", () => console.log("Reconnected to MongoDB"));
mongoose.connection.on("disconnected", () => console.log("Disconnected from MongoDB"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

const mongoDBUri = "mongodb+srv://Angelo:WLJWOkYfAd6TjMIE@cluster0.jgbsgrq.mongodb.net/selfie?retryWrites=true&w=majority&appName=Cluster0"//"mongodb+srv://riccardomuzzi02:Nutella123@muzzicluster.qh3kblb.mongodb.net/?retryWrites=true&w=majority&appName=MuzziCluster";
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

dev1 = 0 // 1: dev, 0: prod
module.exports = {
    env: dev1 ? "DEV" : "PROD",
    User: mongoose.model("User", userSchema),
    Profile: mongoose.model("Profile", profileSchema),
    Book: mongoose.model("Book", bookSchema)
}