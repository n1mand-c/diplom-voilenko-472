import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '26091017',
  database: 'test1',
  waitForConnections: true,
  connectionLimit: 10,
});

async function run() {
  try {
    console.log('Adding email column to users table...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN email VARCHAR(255) UNIQUE DEFAULT NULL;
    `);
    console.log('Successfully added email column.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column email already exists. Skipping...');
    } else {
      console.error('Migration failed:', e);
    }
  } finally {
    process.exit(0);
  }
}

run();
