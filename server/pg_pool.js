const de = require('dotenv');
const { Pool } = require('pg');

de.config();

const pool = new Pool({
  user: process.env.PG_USERNAME,
  host: 'localhost',
  database: 'messenger_db',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

module.exports = pool;
