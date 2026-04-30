import mysql from 'mysql2/promise';

async function addReviews() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    console.log('Creating rb_reviews table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        user_id INT,
        guest_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES rb_hotels(id) ON DELETE CASCADE
      )
    `);
    console.log('Done!');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    pool.end();
  }
}

addReviews();
