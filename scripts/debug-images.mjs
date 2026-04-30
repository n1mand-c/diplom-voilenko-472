import mysql from 'mysql2/promise';

async function debug() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    // Check rb_hotel_images table
    console.log('\n=== rb_hotel_images table contents ===');
    const [images] = await pool.query('SELECT * FROM rb_hotel_images ORDER BY hotel_id, id');
    console.log(JSON.stringify(images, null, 2));

    // Check a JOIN query - what the API returns
    console.log('\n=== Hotels with images via JOIN ===');
    const [hotels] = await pool.query(`
      SELECT 
        h.id, h.name, h.image_url,
        (SELECT JSON_ARRAYAGG(image_url) FROM rb_hotel_images WHERE hotel_id = h.id) as images
      FROM rb_hotels h
      ORDER BY h.id
    `);
    for (const h of hotels) {
      console.log(`Hotel ${h.id} (${h.name}): images=${JSON.stringify(h.images)} type=${typeof h.images}`);
    }

    // Also check if there's an images column on rb_hotels
    console.log('\n=== rb_hotels columns ===');
    const [cols] = await pool.query('SHOW COLUMNS FROM rb_hotels');
    console.log(cols.map(c => c.Field).join(', '));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

debug();
