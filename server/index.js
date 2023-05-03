// server/index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const de = require('dotenv');
const dummyData = require('./dumy_data');

const authenticatedUser = (email, password) => { // returns boolean
  // check if username and password match the one we have in records.
  let auth = false;
  dummyData.users.forEach((user) => {
    if (user.email === email && user.password === password) auth = true;
  });
  return auth;
};

de.config();

const PORT = 3001;

const app = express();

app.use(express.json());

console.log(process.env.SECRET);

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
      console.log('request verified');
      return next();
    }
    return res.status(403).json({ message: 'Failed to authenticate the request' });
  });
});

app.get('/auth/test', (req, res) => {
  console.log('received an authenticated request');
  res.status(200).send('test!!');
});

app.post('/messages', (req, res) => {
  const message = req.body;
  dummyData.messages.push(message);
  res.status(200).json(dummyData.messages[dummyData.messages.length - 1]);
});

app.get('/chats', (req, res) => {
  res.status(200).json(dummyData.chats);
});

app.get('/chats/:id', (req, res) => {
  const chatID = parseInt(req.params.id, 10);
  res.status(200).json(dummyData.messages.filter((message) => message.chat_id === chatID));
});

app.get('/users', (req, res) => {
  res.status(200).json(dummyData.users);
});

app.listen(PORT, () => {
  console.log(`The server listening on ${PORT}`);
});
