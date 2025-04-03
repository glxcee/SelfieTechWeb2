const db = require('./mongo')
const Book = db.Book

async function getBook(req, res) {
    console.log("entering books")
    const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
    console.log(user)
    if(user) {
        try {

            const book = await Book.findOne({username: user.username})
            console.log(book)
            return res.status(200).json(book)//send("Profile updated")
        }
        catch(err) {
            return res.status(500).send("Couldn't update")
        }
    }
    return res.status(400).send("User not found")
}

async function updateBook(req, res) {
    console.log("entering")
    const user = db.env!=="DEV" ? req.user : await db.User.findOne({username:"a"})
    console.log(user)
    if(user) {
        try {
            const newBook = {
                notes: req.body.notes
            }

            const book = await Book.findOneAndUpdate({username: user.username}, newBook)
            console.log(book)
            return res.status(200).send("Profile updated")
        }
        catch(err) {
            return res.status(500).send("Couldn't update")
        }

    }

    return res.status(400).send("User not found")

}

module.exports = {
    get: getBook,
    post: updateBook
}