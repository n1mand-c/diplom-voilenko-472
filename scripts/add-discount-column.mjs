import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env manually since we're in a script
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
} catch (e) { console.log('No .env.local, using defaults from lib/db.ts'); }

const conn = await mysql.createConnection({ host, port, user, password, database });

try {
  // Check whether column already exists
  const [cols] = await conn.execute(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'rb_bookings' AND COLUMN_NAME = 'discount_applied'
  `, [database]);

  if (cols.length === 0) {
    await conn.execute(`
      ALTER TABLE rb_bookings 
      ADD COLUMN discount_applied TINYINT(1) NOT NULL DEFAULT 0
    `);
    console.log('✅ Column discount_applied added to rb_bookings.');
  } else {
    console.log('ℹ️  Column already exists, skipping.');
  }
} catch (e) {
  console.error('❌ Error:', e.message);
}

await conn.end();
