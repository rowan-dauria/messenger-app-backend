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

async function userExists(email) {
  const userResult = await pgPool.query(
    'SELECT email FROM users WHERE email = $1',
    [email],
  );
  const userNumber = userResult.rowCount;
  if (userNumber === 1) return true;
  if (userNumber === 0) return false;
  throw new Error('Multiple users with the same email found');
}

class UserExistsError extends Error {
  constructor(email) {
    super();
    this.message = `User already exists with email ${email}`;
  }
}

async function insertUser(displayName, email, password) {
  const userExistsBool = await userExists(email);

  if (userExistsBool) throw new UserExistsError(email);

  // hash password when inserting into database.
  const result = await pgPool.query(
    'INSERT INTO users (display_name, email, "password") VALUES ($1, $2, crypt($3, "password")) RETURNING display_name, email',
    [displayName, email, password],
  );

  if (result.rows.length === 1) return result.rows[0];
  throw new Error('Error occurred whilst adding user to database');
}

async function testDbConnection() {
  const rows = await pgPool.query(
    'SELECT id, email, display_name FROM users',
  );
  return rows;
}

module.exports = {
  authenticatedUser,
  testDbConnection,
  insertUser,
  UserExistsError,
};
