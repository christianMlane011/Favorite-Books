const express = require('express');

const { Book } = require('../models/book');


const router = new express.Router();

router.post('/books', async (req, res) => {
  const book = new Book(req.body);

  
  try {
    await book.save();
    res.status(201).send(book);
  } catch (e) {
    res.status(400).send(e.message);
  };
});


router.get('/books', async (req, res) => {
  const books = await Book.find({});
  res.send(books);
});

router.get('/books/:id', async (req, res) => {

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(400).send({ error: 'Book not found' });
    };
    res.send (book);
  } catch (e) {
    return res.status(400).send();
  };
});

router.patch('/books/:id', async (req, res) => {
  const allowedUpdates = ['title', 'author', 'genre'];
  const updates = Object.keys(req.body);

  const isValid = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid updates to book' });
  };

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).send();
    };

    updates.forEach((update) => book[update] = req.body[update]);

    await book.save();
    res.send(book);
  } catch (e) {
    res.status(400).send();
  };
});

module.exports = router;