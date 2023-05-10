const express = require('express');
const pgPool = require('../pg_pool');

const chatsRouter = express.Router();

chatsRouter.get('/', async (req, res) => {
  const result = await pgPool.query(
    'SELECT * FROM chats WHERE $1 = ANY(members) ORDER BY id ASC',
    [req.session.authorization.userID],
  );
  res.status(200).json(result.rows);
});

chatsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pgPool.query(
    'SELECT id, name, members FROM chats WHERE id = $1',
    [id],
  );
  res.status(200).json(result.rows);
});

chatsRouter.post('/', async (req, res) => {
  const { members, name } = req.body;
  const result = await pgPool.query(
    'INSERT INTO chats (members, name) VALUES ($1, $2) returning *',
    [members, name],
  );
  res.status(200).json(result.rows);
});

// takes the socket as argument
function handleChatEvents(socket) {
  socket.on('chats join', ({ chatIds }) => {
    socket.join(chatIds);
  });
}

module.exports = { handleChatEvents, chatsRouter };
