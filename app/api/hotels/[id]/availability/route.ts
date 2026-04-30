import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const checkIn  = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: 'checkIn and checkOut required' }, { status: 400 });
    }

    // Get all room types for this hotel with booked count for overlapping dates
    const [rows]: any = await pool.query(`
      SELECT
        rt.id,
        rt.name,
        rt.capacity,
        rt.extra_price,
        COALESCE(rt.total_rooms, 1) AS total_rooms,
        COUNT(b.id) AS booked
      FROM rb_room_types rt
      LEFT JOIN rb_bookings b
        ON b.room_type_id = rt.id
        AND b.status != 'cancelled'
        AND b.check_in  < ?
        AND b.check_out > ?
      WHERE rt.hotel_id = ?
      GROUP BY rt.id
    `, [checkOut, checkIn, id]);

    const availability = rows.map((r: any) => ({
      id:          r.id,
      name:        r.name,
      capacity:    r.capacity,
      extraPrice:  Number(r.extra_price),
      totalRooms:  Number(r.total_rooms),
      booked:      Number(r.booked),
      available:   Math.max(0, Number(r.total_rooms) - Number(r.booked)),
    }));

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Error checking availability', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
