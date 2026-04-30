import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/splits — my incoming split payment requests
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [rows]: any = await pool.query(`
      SELECT 
        s.*,
        b.hotel_id, b.check_in, b.check_out, b.guests_count, b.total_price as booking_total,
        b.guest_name as booking_guest_name,
        h.name as hotel_name, h.location as hotel_location, h.image_url as hotel_image,
        u.username as invited_by_username
      FROM rb_booking_splits s
      JOIN rb_bookings b ON s.booking_id = b.id
      JOIN rb_hotels h ON b.hotel_id = h.id
      JOIN users u ON s.invited_by = u.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [session.userId]);

    return NextResponse.json({ splits: rows });
  } catch (e) {
    console.error('Error fetching splits', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
