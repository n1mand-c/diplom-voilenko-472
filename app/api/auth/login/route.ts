import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Заповніть всі поля' }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 401 });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Невірний пароль' }, { status: 401 });
    }

    // Get user roles
    const [rolesRows]: any = await pool.query(`
      SELECT r.name 
      FROM roles_users ru
      JOIN roles r ON ru.role_id = r.id
      WHERE ru.user_id = ?
    `, [user.id]);

    let roleName = 'ROLE_USER';
    if (rolesRows.length > 0) {
       const isAdmin = rolesRows.some((r: any) => r.name === 'ROLE_ADMIN');
       const isManager = rolesRows.some((r: any) => r.name === 'ROLE_MANAGER');
       roleName = isAdmin ? 'ROLE_ADMIN' : (isManager ? 'ROLE_MANAGER' : rolesRows[0].name);
    }

    // Set session
    await setSession(user.id, user.username, roleName, user.hotel_id);

    return NextResponse.json({ success: true, role: roleName });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
