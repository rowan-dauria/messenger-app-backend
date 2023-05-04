const express = require('express');
const pgPool = require('../pg_pool');

const messagesRouter = express.Router();

messagesRouter.get('/', async (req, res) => {
  const result = await pgPool.query(
    'SELECT id, created_at, display_name FROM messages ORDER BY id ASC',
  );
  res.status(200).json(result.rows);
});

messagesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pgPool.query(
    'SELECT id, created_at, display_name FROM messages WHERE id = $1',
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

module.exports = messagesRouter;
