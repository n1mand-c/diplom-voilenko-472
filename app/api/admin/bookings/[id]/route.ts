import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await req.json();

    if (session.role === 'ROLE_MANAGER') {
      const [bRows]: any = await pool.query('SELECT hotel_id FROM rb_bookings WHERE id = ?', [params.id]);
      if (bRows.length === 0 || Number(bRows[0].hotel_id) !== Number(session.hotelId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await pool.query('UPDATE rb_bookings SET status = ? WHERE id = ?', [status, params.id]);

    if (status === 'confirmed') {
      // Auto-confirm transfer splits when booking is confirmed
      await pool.query(
        `UPDATE rb_booking_splits 
         SET status = 'paid', paid_at = NOW() 
         WHERE booking_id = ? AND payment_method = 'transfer' AND status = 'pending'`,
        [params.id]
      );
    } else if (status === 'pending') {
      // Revert transfer splits back to pending when booking goes back to pending
      await pool.query(
        `UPDATE rb_booking_splits 
         SET status = 'pending', paid_at = NULL 
         WHERE booking_id = ? AND payment_method = 'transfer' AND status = 'paid'`,
        [params.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
