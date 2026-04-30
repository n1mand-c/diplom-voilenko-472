import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Заповніть всі поля' }, { status: 400 });
    }

    const [existing]: any = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Користувач з таким логіном або email вже існує' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result]: any = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    const userId = result.insertId;

    // Get ROLE_USER id (assuming it's usually 1 or we just query it)
    let roleId = 1;
    const [roles]: any = await pool.query('SELECT id FROM roles WHERE name = "ROLE_USER"');
    if (roles.length > 0) {
      roleId = roles[0].id;
    } else {
      // In case table is empty, insert role
      const [r]: any = await pool.query('INSERT INTO roles (name) VALUES ("ROLE_USER")');
      roleId = r.insertId;
    }

    await pool.query('INSERT INTO roles_users (user_id, role_id) VALUES (?, ?)', [userId, roleId]);

    // Set session immediately after registration
    await setSession(userId, username, 'ROLE_USER');

    return NextResponse.json({ success: true, role: 'ROLE_USER' });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
