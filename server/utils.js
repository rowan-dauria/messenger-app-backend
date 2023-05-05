const pgPool = require('./pg_pool');

async function authenticatedUser(email, password) {
  const result = await pgPool.query(
    'SELECT id, email, display_name FROM users WHERE email = $1 AND password = crypt($2, password)',
    [email, password],
  );
  if (result.rows.length === 1) return result.rows[0];
  if (result.rows.length > 1) throw new Error('More than 1 row returned when querying for user');
  return false;
}

module.exports = authenticatedUser;
