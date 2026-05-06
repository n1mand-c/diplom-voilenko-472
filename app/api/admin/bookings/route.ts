import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let query = `
      SELECT b.*, 
             DATE_FORMAT(b.check_in, '%Y-%m-%d') as check_in, 
             DATE_FORMAT(b.check_out, '%Y-%m-%d') as check_out, 
             h.name as hotel_name, u.email as user_email
      FROM rb_bookings b
      JOIN rb_hotels h ON b.hotel_id = h.id
      LEFT JOIN users u ON b.user_id = u.id
    `;
    let queryParams: any[] = [];

    if (session.role === 'ROLE_MANAGER') {
      query += ` WHERE h.id = ? `;
      queryParams.push(session.hotelId || 0);
    }
    
    query += ` ORDER BY b.created_at DESC`;

    const [rows]: any = await pool.query(query, queryParams);

    // Fetch splits for these bookings
    const bookingIds = rows.map((b: any) => b.id);
    let splits: any[] = [];
    if (bookingIds.length > 0) {
      const [splitRows]: any = await pool.query(
        `SELECT s.*, u.username as user_username
         FROM rb_booking_splits s
         JOIN users u ON s.user_id = u.id
         WHERE s.booking_id IN (${bookingIds.map(() => '?').join(',')})`,
        bookingIds
      );
      splits = splitRows;
    }

    return NextResponse.json({ bookings: rows, splits });
  } catch (error) {
    console.error('Error fetching admin bookings', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
