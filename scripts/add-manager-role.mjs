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
    console.log('Inserting ROLE_MANAGER into roles table...');
    await pool.query("INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');");
    console.log('Successfully added ROLE_MANAGER.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    process.exit(0);
  }
}

run();
