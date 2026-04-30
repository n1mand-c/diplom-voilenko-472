import mysql from 'mysql2/promise';

async function fixImages() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    // Get all hotel images
    const [images] = await pool.query('SELECT * FROM rb_hotel_images');
    
    for (const row of images) {
      const url = row.image_url;
      
      // If a single row contains multiple URLs (comma-separated), split them
      if (url.includes(', ')) {
        console.log(`Fixing hotel ${row.hotel_id}: splitting "${url.substring(0, 80)}..."`);
        const urls = url.split(',').map(u => u.trim()).filter(Boolean);
        
        // Delete the bad row
        await pool.query('DELETE FROM rb_hotel_images WHERE id = ?', [row.id]);
        
        // Insert each URL as a separate row
        for (const singleUrl of urls) {
          if (singleUrl) {
            await pool.query(
              'INSERT INTO rb_hotel_images (hotel_id, image_url) VALUES (?, ?)',
              [row.hotel_id, singleUrl]
            );
          }
        }
        console.log(`  → Split into ${urls.length} separate rows`);
      }
    }
    
    // Final state
    console.log('\n=== Final rb_hotel_images state ===');
    const [finalImages] = await pool.query('SELECT * FROM rb_hotel_images ORDER BY hotel_id, id');
    for (const img of finalImages) {
      console.log(`  ID ${img.id}, hotel ${img.hotel_id}: ${img.image_url.substring(0, 60)}...`);
    }
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

fixImages();
