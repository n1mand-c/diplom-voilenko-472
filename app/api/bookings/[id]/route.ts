import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    
    // Validate booking ownership
    const [bookings]: any = await pool.query('SELECT * FROM rb_bookings WHERE id = ?', [params.id]);
    if (bookings.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const booking = bookings[0];

    // Only Admin/Manager can update to any status. 
    // Users can ONLY cancel their OWN bookings if status is not already cancelled, and check-in > 3 days.
    if (session.role === 'ROLE_USER') {
      if (booking.user_id !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (status !== 'cancelled') {
        return NextResponse.json({ error: 'Users can only cancel bookings' }, { status: 400 });
      }
      // booking.check_in may be a Date object from MySQL, convert to string first
      const checkInStr = typeof booking.check_in === 'string' ? booking.check_in : booking.check_in.toISOString().split('T')[0];
      const checkInDate = new Date(checkInStr + 'T12:00:00');
      const daysUntilCheckIn = (checkInDate.getTime() - Date.now()) / (1000 * 3600 * 24);
      if (daysUntilCheckIn <= 3) {
        return NextResponse.json({ error: 'Скасування неможливе менш ніж за 3 дні до заїзду' }, { status: 400 });
      }
    }

    await pool.query('UPDATE rb_bookings SET status = ? WHERE id = ?', [status, params.id]);

    // If cancelled, also cancel pending splits
    if (status === 'cancelled') {
      await pool.query('UPDATE rb_booking_splits SET status = "cancelled" WHERE booking_id = ? AND status = "pending"', [params.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
