const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '26091017', database: 'test1' });
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS rb_support_tickets (id INT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, hotel_id INT, subject VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    console.log('1 OK');
    await pool.query("CREATE TABLE IF NOT EXISTS rb_support_messages (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, sender_role VARCHAR(50) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES rb_support_tickets(id) ON DELETE CASCADE)");
    console.log('2 OK');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
