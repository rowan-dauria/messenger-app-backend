const pgPool = require('./pg_pool');

async function authenticatedUser(email, password) {
  const result = await pgPool.query(
    // TODO: Fix this, new passwords should be hashed with a new salt each time, and the
    // TODO  hash should be compared to the entered password, like crypt(entered pswd, HASH)
    // TODO  refer to https://www.postgresql.org/docs/current/pgcrypto.html#PGCRYPTO-PASSWORD-HASHING-FUNCS
    'SELECT id, email, display_name FROM users WHERE email = $1 AND password = crypt($2, password)',
    [email, password],
  );
  if (result.rows.length === 1) return result.rows[0];
  if (result.rows.length > 1) throw new Error('More than 1 row returned when querying for user');
  return false;
}

module.exports = authenticatedUser;
