import mysql from 'mysql2/promise';

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    const [rows] = await pool.query('DESCRIBE users');
    console.log("Users Table Schema:", rows);
    
    const [users] = await pool.query('SELECT * FROM users LIMIT 2');
    console.log("Users sample:", users);
  } catch (error) {
    console.error("Error", error);
  } finally {
    pool.end();
  }
}

check();
