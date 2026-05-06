import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/admin/occupancy?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&hotelId=N
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || startDate;
    const hotelIdFilter = searchParams.get('hotelId');

    // Determine which hotel to restrict to
    let restrictHotelId: number | null = null;
    if (session.role === 'ROLE_MANAGER' && session.hotelId) {
      restrictHotelId = Number(session.hotelId);
    } else if (hotelIdFilter && hotelIdFilter !== 'all') {
      restrictHotelId = Number(hotelIdFilter);
    }

    // 1. Get room type summary (counts)
    let summaryQuery = `
      SELECT 
        h.id as hotel_id,
        h.name as hotel_name,
        rt.id as room_type_id,
        rt.name as room_type_name,
        rt.capacity as room_type_capacity,
        COALESCE(rt.total_rooms, 1) as total_rooms,
        COUNT(b.id) as booked_count
      FROM rb_hotels h
      JOIN rb_room_types rt ON rt.hotel_id = h.id
      LEFT JOIN rb_bookings b ON 
        b.hotel_id = h.id AND 
        b.room_type_id = rt.id AND 
        b.status != 'cancelled' AND
        b.check_in <= ? AND b.check_out >= ?
    `;
    const summaryParams: any[] = [endDate, startDate];
    if (restrictHotelId) {
      summaryQuery += ' WHERE h.id = ?';
      summaryParams.push(restrictHotelId);
    }
    summaryQuery += ' GROUP BY h.id, h.name, rt.id, rt.name, rt.capacity, rt.total_rooms ORDER BY h.id, rt.id';

    // 2. Get individual bookings with dates
    let bookingsQuery = `
      SELECT 
        b.id as booking_id,
        b.hotel_id,
        b.room_type_id,
        DATE_FORMAT(b.check_in, '%Y-%m-%d') as check_in,
        DATE_FORMAT(b.check_out, '%Y-%m-%d') as check_out,
        b.guests_count,
        b.guest_name,
        rt.name as room_type_name
      FROM rb_bookings b
      LEFT JOIN users u ON b.user_id = u.id
      JOIN rb_room_types rt ON b.room_type_id = rt.id
      WHERE b.status != 'cancelled'
        AND b.check_in <= ? AND b.check_out >= ?
    `;
    const bookingsParams: any[] = [endDate, startDate];
    if (restrictHotelId) {
      bookingsQuery += ' AND b.hotel_id = ?';
      bookingsParams.push(restrictHotelId);
    }
    bookingsQuery += ' ORDER BY b.check_in ASC';

    const [[summaryRows], [bookingRows]]: any = await Promise.all([
      pool.query(summaryQuery, summaryParams),
      pool.query(bookingsQuery, bookingsParams),
    ]);

    // Group bookings by hotel_id → room_type_id
    const bookingsByRoomType: Record<string, any[]> = {};
    for (const bk of bookingRows) {
      const key = `${bk.hotel_id}_${bk.room_type_id}`;
      if (!bookingsByRoomType[key]) bookingsByRoomType[key] = [];
      bookingsByRoomType[key].push({
        id: bk.booking_id,
        guestName: bk.guest_name,
        checkIn: bk.check_in,
        checkOut: bk.check_out,
        guestsCount: bk.guests_count,
      });
    }

    // Group summary by hotel
    const hotelsMap: Record<string, any> = {};
    for (const row of summaryRows) {
      if (!hotelsMap[row.hotel_id]) {
        hotelsMap[row.hotel_id] = { id: row.hotel_id, name: row.hotel_name, roomTypes: [] };
      }
      const totalRooms = Number(row.total_rooms);
      const bookedCount = Number(row.booked_count);
      const key = `${row.hotel_id}_${row.room_type_id}`;
      hotelsMap[row.hotel_id].roomTypes.push({
        id: row.room_type_id,
        name: row.room_type_name,
        capacity: row.room_type_capacity,
        totalRooms,
        bookedCount,
        availableCount: Math.max(0, totalRooms - bookedCount),
        bookings: bookingsByRoomType[key] || [],
      });
    }

    return NextResponse.json({ occupancy: Object.values(hotelsMap) });
  } catch (error) {
    console.error('Occupancy error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
