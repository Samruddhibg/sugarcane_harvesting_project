const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://sugarcane_harvest:sugarcane_harvest@localhost:5432/sugarcane_harvest';

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('amazonaws.com') ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;