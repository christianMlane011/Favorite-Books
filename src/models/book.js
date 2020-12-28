const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  }
});

bookSchema.virtual('favoritedBy', {
  ref: 'User',
  localField: '_id',
  foreignField: 'books'
});



bookSchema.methods.toJSON = function() {
  const book = this;
  const bookObject = book.toObject();

  delete bookObject.favoritedBy;
  return bookObject;
};

const Book = mongoose.model('Book', bookSchema);

module.exports = {
  Book
};