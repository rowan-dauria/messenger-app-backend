const de = require('dotenv');
const { Pool } = require('pg');

de.config();

const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STRING}?sslmode=require`,
});

module.exports = pool;
