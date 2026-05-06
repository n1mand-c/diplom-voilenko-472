import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET User Bookings
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rows]: any = await pool.query(`
      SELECT b.*, 
             DATE_FORMAT(b.check_in, '%Y-%m-%d') as check_in, 
             DATE_FORMAT(b.check_out, '%Y-%m-%d') as check_out, 
             h.name as hotel_name, h.location as hotel_location, h.image_url as hotel_image 
      FROM rb_bookings b
      JOIN rb_hotels h ON b.hotel_id = h.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [session.userId]);

    return NextResponse.json({ bookings: rows });
  } catch (error) {
    console.error('Error fetching bookings', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST Create Booking
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    const {
      hotelId, checkIn, checkOut,
      guestName, guestEmail, guestPhone,
      guestsCount, totalPrice, paymentMethod, roomTypeId,
      discountApplied
    } = body;

    // Availability check: if roomTypeId provided, ensure rooms are still free
    if (roomTypeId) {
      const [avail]: any = await pool.query(`
        SELECT
          COALESCE(rt.total_rooms, 1) AS total_rooms,
          COUNT(b.id) AS booked
        FROM rb_room_types rt
        LEFT JOIN rb_bookings b
          ON b.room_type_id = rt.id
          AND b.status != 'cancelled'
          AND b.check_in  < ?
          AND b.check_out > ?
        WHERE rt.id = ?
        GROUP BY rt.id
      `, [checkOut, checkIn, roomTypeId]);

      if (avail.length > 0) {
        const { total_rooms, booked } = avail[0];
        if (Number(booked) >= Number(total_rooms)) {
          return NextResponse.json(
            { error: 'Немає вільних номерів цього типу на обрані дати. Оберіть інший тип або дати.' },
            { status: 409 }
          );
        }
      }
    }

    const userId = session?.userId || null;
    const status = paymentMethod === 'transfer' ? 'pending' : 'confirmed';

    const [result]: any = await pool.query(`
      INSERT INTO rb_bookings (
        user_id, guest_name, guest_email, guest_phone,
        hotel_id, room_type_id, check_in, check_out, guests_count,
        total_price, payment_method, status, discount_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, guestName, guestEmail, guestPhone,
      hotelId, roomTypeId || null, checkIn, checkOut, guestsCount,
      totalPrice, paymentMethod, status, discountApplied ? 1 : 0
    ]);

    return NextResponse.json({ success: true, bookingId: result.insertId });
  } catch (error) {
    console.error('Error creating booking', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
