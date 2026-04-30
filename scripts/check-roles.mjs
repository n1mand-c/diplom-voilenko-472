import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '26091017',
  database: 'test1',
});

async function check() {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM roles_users');
    console.log(cols);
    const [roles] = await pool.query('SHOW COLUMNS FROM roles');
    console.log(roles);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
