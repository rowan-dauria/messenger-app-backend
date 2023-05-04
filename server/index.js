// server/index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const de = require('dotenv');

const messagesRouter = require('./auth_router/messages');
const usersRouter = require('./auth_router/users');
const chatsRouter = require('./auth_router/chats');

const dummyData = require('./dumy_data');

de.config();

const authenticatedUser = (email, password) => { // returns boolean
  // check if username and password match the one we have in records.
  let auth = false;
  dummyData.users.forEach((user) => {
    if (user.email === email && user.password === password) auth = true;
  });
  return auth;
};

const PORT = 3001;
const app = express();
app.use(express.json());

app.use('/', session({ secret: process.env.SECRET, resave: true, saveUninitialized: true }));

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(422).send('username or password not provided');

  if (!authenticatedUser(email, password)) {
    return res.status(403).send('Incorrect username or password');
  }
  const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = { accessToken, email };
  return res.status(200).send('User logged in');
});

app.use('/auth/*', (req, res, next) => {
  if (!req.session.authorization) return res.status(403).json({ message: 'Access denied' });
  const token = req.session.authorization.accessToken;
  return jwt.verify(token, 'access', (err, user) => {
    if (!err) {
      req.user = user;
      return next();
    }
    return res.status(403).json({ message: 'Failed to authenticate the request' });
  });
});
/* eslint-disable import/newline-after-import */
app.use('/auth/users', usersRouter);
app.use('/auth/chats', chatsRouter);
app.use('/auth/messages', messagesRouter);
/* eslint-enable import/newline-after-import */

app.listen(PORT, () => {
  console.log(`The server listening on ${PORT}`);
});
