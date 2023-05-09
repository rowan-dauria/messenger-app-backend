const express = require('express');
const pgPool = require('../pg_pool');

const messagesRouter = express.Router();

messagesRouter.get('/', async (req, res, next) => {
  if (req.query.chat_id) return next();
  const result = await pgPool.query(
    'SELECT id, created_at, content, created_by FROM messages ORDER BY id ASC',
  );
  return res.status(200).json(result.rows);
}, async (req, res) => {
  const chatID = req.query.chat_id;
  const result = await pgPool.query(
    'SELECT id, created_at, content, created_by FROM messages WHERE chat_id = $1',
    [chatID],
  );
  return res.status(200).json(result.rows);
});

messagesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pgPool.query(
    'SELECT id, created_at, content, created_by FROM messages WHERE id = $1',
    [id],
  );
  res.status(200).json(result.rows);
});

messagesRouter.post('/', async (req, res) => {
  const createdBy = req.body.created_by;
  const chatID = req.body.chat_id;
  const { content } = req.body;

  if (!content.image && !content.text) return res.status(422).sendStatus('Invalid content in message');
  let result;
  try {
    result = await pgPool.query(
      'INSERT INTO messages (created_by, chat_id, content) VALUES ($1, $2, $3) RETURNING *',
      [createdBy, chatID, content],
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.sendStatus(500);
  }
});

function handleMessageEvents(socket) {
  socket.on('message to server', async (message) => {
    const createdBy = message.created_by;
    const chatID = message.chat_id;
    const { content } = message;
    const result = await pgPool.query(
      'INSERT INTO messages (created_by, chat_id, content) VALUES ($1, $2, $3) RETURNING *',
      [createdBy, chatID, content],
    );
    console.log(result);
    socket.to(chatID).emit('message to client', result);
  });
}

module.exports = { handleMessageEvents, messagesRouter };
