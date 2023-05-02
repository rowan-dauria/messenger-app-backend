// server/index.js

const express = require('express');
const dummyData = require('./dumy_data');

const PORT = 3001;

const app = express();

app.use(express.json());

app.use('/hello', (req, res) => {
  res.status(200).json('hi!');
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
