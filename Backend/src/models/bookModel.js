const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    publicationYear: { type: Number, required: true },
    description: { type: String, required: true },
    image: { 
        url: { type: String },
        publicId: { type: String }
    }
});

module.exports = mongoose.model("Book", BookSchema);