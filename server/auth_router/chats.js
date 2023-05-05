const express = require('express');
const pgPool = require('../pg_pool');

const chatsRouter = express.Router();

chatsRouter.get('/', async (req, res) => {
  const result = await pgPool.query(
    'SELECT id, name, members FROM chats ORDER BY id ASC',
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

module.exports = chatsRouter;
