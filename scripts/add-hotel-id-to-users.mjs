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
    console.log('Adding hotel_id column to users table...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN hotel_id INT DEFAULT NULL;
    `);
    console.log('Successfully added hotel_id column.');
    
    // Optional: Add foreign key constraint if preferred
    // await pool.query(`
    //   ALTER TABLE users
    //   ADD CONSTRAINT fk_user_hotel
    //   FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    //   ON DELETE SET NULL;
    // `);
    // console.log('Successfully added foreign key constraint.');

  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column hotel_id already exists. Skipping...');
    } else {
      console.error('Migration failed:', e);
    }
  } finally {
    process.exit(0);
  }
}

run();
