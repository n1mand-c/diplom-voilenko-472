import mysql from 'mysql2/promise';

async function migrateImages() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    console.log('Creating rb_hotel_images table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_hotel_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES rb_hotels(id) ON DELETE CASCADE
      )
    `);

    console.log('Migrating existing single image_url to the new table...');
    const [hotels] = await pool.query('SELECT id, image_url FROM rb_hotels WHERE image_url IS NOT NULL');
    
    for (const h of hotels) {
      if (h.image_url) {
        // Check if this hotel already has images in the new table
        const [existing] = await pool.query('SELECT id FROM rb_hotel_images WHERE hotel_id = ? LIMIT 1', [h.id]);
        if (existing.length === 0) {
          await pool.query('INSERT INTO rb_hotel_images (hotel_id, image_url) VALUES (?, ?)', [h.id, h.image_url]);
          console.log(`Migrated image for hotel ${h.id}`);
        }
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrateImages();
