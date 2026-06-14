import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// Migrate: add total_rooms column if missing
async function ensureTotalRoomsColumn() {
  try {
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM rb_room_types LIKE 'total_rooms'`);
    if (cols.length === 0) {
      await pool.query(`ALTER TABLE rb_room_types ADD COLUMN total_rooms INT DEFAULT 1`);
      console.log('Added total_rooms column to rb_room_types');
    }
  } catch (e) {
    console.error('Migration error in ensureTotalRoomsColumn:', e);
  }
}

export async function GET(req: Request) {
  try {
    await ensureTotalRoomsColumn();
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');

    if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });

    const [rows]: any = await pool.query('SELECT * FROM rb_room_types WHERE hotel_id = ?', [hotelId]);
    
    const parsedRows = rows.map((r: any) => {
      let amenities = r.amenities;
      if (typeof amenities === 'string') {
        try { amenities = JSON.parse(amenities); } catch(e) { amenities = []; }
      }
      return { ...r, amenities };
    });

    return NextResponse.json({ roomTypes: parsedRows });
  } catch (error) {
    console.error('Error fetching room types', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTotalRoomsColumn();
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { hotelId, name, capacity, extraPrice, totalRooms, amenities } = await req.json();
    const amenitiesJson = JSON.stringify(Array.isArray(amenities) ? amenities : []);

    const [result]: any = await pool.query(`
      INSERT INTO rb_room_types (hotel_id, name, capacity, extra_price, total_rooms, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [hotelId, name, capacity, extraPrice || 0, totalRooms || 1, amenitiesJson]);

    return NextResponse.json({ success: true, roomTypeId: result.insertId });
  } catch (error: any) {
    console.error('Error creating room type', error);
    return NextResponse.json({ error: 'Помилка збереження в БД: ' + (error?.message || 'Server error') }, { status: 500 });
  }
}
