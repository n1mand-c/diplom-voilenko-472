import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [users]: any = await pool.query(`
      SELECT u.id, u.username, u.email, u.hotel_id as hotelId,
      (
        SELECT r.name 
        FROM roles_users ru 
        JOIN roles r ON ru.role_id = r.id 
        WHERE ru.user_id = u.id 
        ORDER BY r.id DESC
        LIMIT 1
      ) as role
      FROM users u 
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    
    // Normalize roles to ROLE_USER if null
    const normalizedUsers = users.map((u: any) => ({
      ...u,
      role: u.role || 'ROLE_USER'
    }));

    return NextResponse.json({ users: normalizedUsers });
  } catch (error) {
    console.error('Error fetching users', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
