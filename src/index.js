const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const userRouter = require('./routers/user');
const bookRouter = require('./routers/book');
require('./db/mongoose');


const app = express();

const publicDirectory = path.join(__dirname, '../public');

app.use(cookieParser());
app.use(express.json());
app.use(express.static(publicDirectory));


const port = process.env.PORT;

app.use(userRouter);
app.use(bookRouter);


app.listen(port, () => {
  console.log('Now listening on port', port);
});

