import mysql from 'mysql2/promise';

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log("Tables:", rows);
  } catch (error) {
    console.error("Error", error);
  } finally {
    pool.end();
  }
}

check();
