const express = require('express');
const pgPool = require('../pg_pool');

const usersRouter = express.Router();

usersRouter.get('/', async (req, res) => {
  const result = await pgPool.query(
    'SELECT id, display_name, email FROM users ORDER BY id ASC',
  );
  res.status(200).json(result.rows);
});

usersRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  if (id === 'me') next();
  else {
    const result = await pgPool.query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [id],
    );
    res.status(200).json(result.rows);
  }
}, async (req, res) => {
  const { userID } = req.session.authorization;
  console.log(userID);
  const result = await pgPool.query(
    'SELECT id, display_name, email FROM users WHERE id = $1',
    [userID],
  );
  res.status(200).json(result.rows[0]);
});

module.exports = usersRouter;
