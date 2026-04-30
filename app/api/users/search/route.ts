import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/users/search?q=username
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json({ users: [] });

    const [rows]: any = await pool.query(
      `SELECT id, username FROM users WHERE username LIKE ? AND id != ? LIMIT 10`,
      [`%${q}%`, session.userId]
    );

    return NextResponse.json({ users: rows });
  } catch (e) {
    return NextResponse.json({ users: [] });
  }
}
