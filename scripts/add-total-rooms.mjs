import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const env = {};
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        env[key] = val;
      }
    });
  }
} catch (e) {
  console.error("Error reading .env.local:", e.message);
}

const host = env.DB_HOST || process.env.DB_HOST || 'localhost';
const user = env.DB_USER || process.env.DB_USER || 'root';
const password = env.DB_PASSWORD || process.env.DB_PASSWORD || '';
const database = env.DB_NAME || process.env.DB_NAME || 'test1';
const port = env.DB_PORT || process.env.DB_PORT || 3306;

const pool = mysql.createPool({
  host, user, password, database, port: Number(port),
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('ALTER TABLE rb_room_types ADD COLUMN total_rooms INT DEFAULT 1');
    console.log('Column total_rooms added successfully!');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column total_rooms already exists!');
    } else {
      console.error('Error adding column:', e.message);
    }
  }
  process.exit(0);
}

run();
