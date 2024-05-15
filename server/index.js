// server/index.js

// TODO send messages to BE using socket, emitting to users after msg added to db

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Server } = require('socket.io');
const de = require('dotenv');

const { handleMessageEvents, messagesRouter } = require('./auth_router/messages');
const usersRouter = require('./auth_router/users');
const { handleChatEvents, chatsRouter } = require('./auth_router/chats');

const {
  authenticatedUser,
  insertUser,
  UserExistsError,
} = require('./utils');

de.config();

const PORT = 3001;
const app = express();

const io = new Server(app.listen(PORT, () => {
  console.log(`The server listening on ${PORT}`);
}));

app.use(express.json());

const sessionMiddleware = session({
  secret: process.env.SECRET,
  resave: true, // ? should maybe be changed to false?
  saveUninitialized: true, // ? should maybe be changed to false?
});

// The  The default server-side session storage, MemoryStore,
// is purposely not designed for a production environment.
// It will leak memory under most conditions, does not scale past a single process,
// and is meant for debugging and developing. For a list of stores, see compatible session stores.
// https://www.npmjs.com/package/express-session#compatible-session-stores
app.use('/', sessionMiddleware);
io.engine.use(sessionMiddleware);

// only allow authenticated users
io.use((socket, next) => {
  const sess = socket.request.session;
  if (sess && sess.authorization) {
    next();
  } else {
    console.log('unauthorised socket');
  }
});

io.on('connection', (socket) => {
  console.log(`user connected, socket.id: ${socket.id}`);

  handleChatEvents(socket);
  handleMessageEvents(socket);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(422).send('username or password not provided');

  const user = await authenticatedUser(email, password);
  // If user can't be found, respond with error
  if (!user) {
    return res.status(403).send('Incorrect username or password');
  }
  // If user is found, create a token for the session that will expire after 1hr
  // The token is signed with the user's password and the JWT secret
  // This allows requests to be made to /auth/* endpoints
  const accessToken = jwt.sign(
    { data: password },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 },
  );

  req.session.authorization = { accessToken, email, userID: user.id };
  return res.status(200).json({ user });
});

app.post('/new-user', async (req, res) => {
  const { displayName, email, password } = req.body;

  if (!displayName || !email || !password) return res.status(422).send('username or password not provided');

  try {
    await insertUser(displayName, email, password);
  } catch (err) {
    if (err instanceof UserExistsError) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    return res.status(500).json({ message: 'Error occurred whilst creating user' });
  }

  const user = await authenticatedUser(email, password);
  // If user can't be found, respond with error
  if (!user) {
    return res.status(403).send('Incorrect username or password');
  }
  // If user is found, create a token for the session that will expire after 1hr
  // The token is signed with the user's password and the JWT secret
  // This allows requests to be made to /auth/* endpoints
  const accessToken = jwt.sign(
    { data: password },
    process.env.JWT_SECRET,
    { expiresIn: 60 * 60 },
  );

  req.session.authorization = { accessToken, email, userID: user.id };
  return res.status(200).json({ user });
});

app.use('/auth/*', (req, res, next) => {
  if (!req.session.authorization) return res.status(403).json({ message: 'Access denied' });
  const token = req.session.authorization.accessToken;
  return jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err) => {
      if (!err) {
        return next();
      }
      return res.status(403).json({ message: 'Failed to authenticate the request' });
    },
  );
});

app.use('/auth/users', usersRouter);
app.use('/auth/chats', chatsRouter);
app.use('/auth/messages', messagesRouter);
