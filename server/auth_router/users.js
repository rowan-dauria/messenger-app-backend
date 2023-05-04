const express = require('express');
const pgPool = require('../pg_pool');

const usersRouter = express.Router();

usersRouter.get('/', async (req, res) => {
  const result = await pgPool.query(
    'SELECT id, created_at, display_name FROM users ORDER BY id ASC',
  );
  res.status(200).json(result.rows);
});

usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pgPool.query(
    'SELECT id, created_at, display_name FROM users WHERE id = $1',
    [id],
  );
  res.status(200).json(result.rows);
});

module.exports = usersRouter;
