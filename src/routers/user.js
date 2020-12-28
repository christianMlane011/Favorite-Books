const express = require('express');
const { Book } = require('../models/book');
const { User } = require('../models/user');

const { auth } = require('../middleware/auth');
const { reset } = require('nodemon');
const  mongoose  = require('mongoose');




const router = new express.Router();


router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = user.createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000});
    res.status(201).send(user);
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).send({ error: 'Username in use' });
    };
    res.status(400).send();
  };
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.checkCredentials(req.body.username, req.body.password);
    const token = user.createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000});
    res.send(user);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  };
});

router.post('/users/me/logout', auth,  async (req, res) => {
  const user = req.user;
  res.cookie('jwt', '', { maxAge: 1 });
  res.send({ message: 'User successfully logged out' , user});
});

router.patch('/users/me', auth, async (req, res) => {
  const pass = req.body.password;
  const user = req.user;

  if (!pass) {
    return res.status(400).send({ error: 'You must provide the new password' });
  };

  try {
    user.password = pass;
    await user.save();
    res.send({ message: 'Password successfully changed', user });
  } catch (e) {
    res.status(500).send(e);
  };

});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.delete('/users/me', auth, async (req, res) => {

  try {
    const user = await User.findByIdAndDelete(req.user._id);
    res.cookie('jwt', '', { maxAge: 1 });
    res.send({ message: 'User successfully deleted', user });
  } catch (e) {
    res.status(500).send({ error: 'Unable to delete user' });
  };
});

router.post('/users/me/favorites', auth, async (req, res) => {

  const user = req.user;

  if (!req.query.book) {
    return res.status(400).send({ error: 'Must include value for book ID'});
  };

  const book = await Book.findById(req.query.book);
  
  if (!book) {
    return res.status(400).send({ error: 'Could not find book' });
  };

  const alreadyFavorited = await User.find({
    _id: user._id,
    books: book._id
  })

  if (alreadyFavorited.length !== 0) {
    return res.status(400).send({ error: 'That book is already in your favorites' });
  };

  try {
    user['books'].push(book);
    await user.save();
    res.send(user);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  };
});

router.get('/users/me/favorites', auth,  async (req, res) => {

  const user = req.user;

  try {
    await user.populate({
      path: 'books'
    }).execPopulate();
    res.send(user.books);
  } catch (e) {
    res.status(500).send();
  };
});

router.delete('/users/me/favorites/:id', auth, async (req, res) => {
  const bookID = req.params.id;
  const user = req.user;

  if (!bookID) {
    return res.status(400).send({ error: 'Must provide book id to remove from favorites' });
  };

  let books = user.books;
  let bookToRemove = books.find((book) => {
    return book._id == bookID;
  });

  if (!bookToRemove) {
    return res.status(400).send({ error: 'You do not have this book favorited' });
  };

  books = books.filter((book) => {
    return book._id != bookID;
  });

  try {
    user.books = books;
    await user.save();
    res.send({ message: `Successfully unfavorited this book` });
  } catch (e) {
    res.status(500).send();
  };

  
});




module.exports = router;