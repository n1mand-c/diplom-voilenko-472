import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/bookings/[id]/splits — create split payment requests
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookingId } = await params;
    const body = await req.json();
    const { splits } = body; 
    // splits: Array<{ username: string, percentage: number, payNow: boolean, paymentMethod?: string }>

    if (!splits || splits.length === 0) {
      return NextResponse.json({ error: 'No splits provided' }, { status: 400 });
    }

    // Validate total percentage < 100
    const totalPct = splits.reduce((s: number, x: any) => s + Number(x.percentage), 0);
    if (totalPct >= 100) {
      return NextResponse.json({ error: `Сума відсотків друзів не може бути 100% або більше. Зараз: ${totalPct.toFixed(1)}%` }, { status: 400 });
    }

    // Get booking to verify ownership and get total price
    const [bookings]: any = await pool.query(
      `SELECT * FROM rb_bookings WHERE id = ? AND user_id = ?`,
      [bookingId, session.userId]
    );
    if (bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found or not yours' }, { status: 404 });
    }
    const booking = bookings[0];
    const totalPrice = Number(booking.total_price);

    // Resolve all usernames to user IDs
    const userRows: any[] = [];
    for (const split of splits) {
      const [users]: any = await pool.query(
        `SELECT id, username FROM users WHERE username = ?`, [split.username]
      );
      if (users.length === 0) {
        return NextResponse.json({ error: `Користувача "${split.username}" не знайдено` }, { status: 404 });
      }
      userRows.push({ ...split, userId: users[0].id });
    }

    // Delete any existing splits for this booking
    await pool.query(`DELETE FROM rb_booking_splits WHERE booking_id = ?`, [bookingId]);

    // Insert initiator's split (the remaining percentage)
    const initiatorPct = 100 - totalPct;
    const initiatorAmount = ((initiatorPct / 100) * totalPrice).toFixed(2);
    const initiatorPaymentMethod = booking.payment_method || 'card';
    const initiatorStatus = initiatorPaymentMethod === 'transfer' ? 'pending' : 'paid';
    const initiatorPaidAt = initiatorStatus === 'paid' ? new Date() : null;

    await pool.query(
      `INSERT INTO rb_booking_splits (booking_id, user_id, invited_by, percentage, amount, status, payment_method, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, session.userId, session.userId, initiatorPct, initiatorAmount, initiatorStatus, initiatorPaymentMethod, initiatorPaidAt]
    );

    // Insert all friends' splits
    for (const split of userRows) {
      const amount = ((Number(split.percentage) / 100) * totalPrice).toFixed(2);
      const status = split.payNow ? 'paid' : 'pending';
      const paidAt = split.payNow ? new Date() : null;
      const paymentMethod = split.payNow ? (split.paymentMethod || 'card') : null;

      await pool.query(
        `INSERT INTO rb_booking_splits (booking_id, user_id, invited_by, percentage, amount, status, payment_method, paid_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, split.userId, session.userId, split.percentage, amount, status, paymentMethod, paidAt]
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error creating splits', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/bookings/[id]/splits — get splits for a specific booking (for initiator view)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: bookingId } = await params;

    const [rows]: any = await pool.query(`
      SELECT s.*, u.username
      FROM rb_booking_splits s
      JOIN users u ON s.user_id = u.id
      WHERE s.booking_id = ?
      ORDER BY s.created_at ASC
    `, [bookingId]);

    return NextResponse.json({ splits: rows });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
