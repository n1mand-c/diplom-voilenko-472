import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || session.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { role, hotelId } = await req.json();

    // Prevent admin from demoting themselves
    if (session.userId === parseInt(params.id) && role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
    }

    // Get role_id from roles table
    const [roleRows]: any = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
    if (roleRows.length === 0) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const roleId = roleRows[0].id;

    // Update role: delete existing entries and insert new
    await pool.query('DELETE FROM roles_users WHERE user_id = ?', [params.id]);
    await pool.query('INSERT INTO roles_users (user_id, role_id) VALUES (?, ?)', [params.id, roleId]);

    // Update hotel_id in users table
    await pool.query('UPDATE users SET hotel_id = ? WHERE id = ?', [hotelId || null, params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
