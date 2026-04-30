import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET — check if current user has already used the Red Bull discount
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      // Not logged in — no discount history
      return NextResponse.json({ used: false });
    }

    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as cnt FROM rb_bookings WHERE user_id = ? AND discount_applied = 1`,
      [session.userId]
    );

    const used = Number(rows[0]?.cnt) > 0;
    return NextResponse.json({ used });
  } catch (error) {
    console.error('Error checking discount status', error);
    return NextResponse.json({ used: false });
  }
}
