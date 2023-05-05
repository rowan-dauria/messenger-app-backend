// server/index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const de = require('dotenv');

const messagesRouter = require('./auth_router/messages');
const usersRouter = require('./auth_router/users');
const chatsRouter = require('./auth_router/chats');

const authenticatedUser = require('./utils');

de.config();

const PORT = 3001;
const app = express();
app.use(express.json());

app.use('/', session({ secret: process.env.SECRET, resave: true, saveUninitialized: true }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(422).send('username or password not provided');

  const user = await authenticatedUser(email, password);
  if (!user) {
    return res.status(403).send('Incorrect username or password');
  }
  const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = { accessToken, email, user_id: user.id };
  return res.status(200).json(user);
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
