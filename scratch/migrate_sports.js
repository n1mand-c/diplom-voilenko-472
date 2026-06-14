const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '26091017', database: 'test1' });
  try {
    const [rows] = await pool.query('SELECT id, sport FROM rb_hotels WHERE sports IS NULL');
    for (const r of rows) {
      await pool.query('UPDATE rb_hotels SET sports=? WHERE id=?', [JSON.stringify([r.sport]), r.id]);
    }
    console.log('Migrated ' + rows.length + ' hotels OK');
  } catch(e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
})();
