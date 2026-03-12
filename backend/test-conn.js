const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^@]+@/, ':****@'));
    await client.connect();
    console.log('Successfully connected to PostgreSQL!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

test();
