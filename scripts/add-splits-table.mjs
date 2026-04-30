import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
let host = 'localhost', port = 3306, user = 'root', password = '26091017', database = 'test1';

try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    const val = rest.join('=').trim().replace(/^"|"$/g, '');
    if (key === 'DB_HOST') host = val;
    if (key === 'DB_PORT') port = Number(val);
    if (key === 'DB_USER') user = val;
    if (key === 'DB_PASSWORD') password = val;
    if (key === 'DB_NAME') database = val;
  }
} catch (e) { /* use defaults */ }

const conn = await mysql.createConnection({ host, port, user, password, database });

try {
  const [cols] = await conn.execute(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rb_booking_splits'
  `, [database]);

  if (cols.length === 0) {
    await conn.execute(`
      CREATE TABLE rb_booking_splits (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        booking_id     INT NOT NULL,
        user_id        INT NOT NULL,
        invited_by     INT NOT NULL,
        percentage     DECIMAL(5,2) NOT NULL,
        amount         DECIMAL(10,2) NOT NULL,
        status         ENUM('pending','paid','declined') NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(20) NULL,
        paid_at        DATETIME NULL,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES rb_bookings(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table rb_booking_splits created.');
  } else {
    console.log('ℹ️  Table rb_booking_splits already exists.');
  }
} catch (e) {
  console.error('❌ Error:', e.message);
}

await conn.end();
