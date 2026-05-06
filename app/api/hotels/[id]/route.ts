import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const [rows]: any = await pool.query(`
      SELECT 
        h.*
      FROM rb_hotels h WHERE id = ?
    `, [params.id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Готель не знайдено' }, { status: 404 });
    }

    const hotel = rows[0];
    if (typeof hotel.images === 'string') {
      try { hotel.images = JSON.parse(hotel.images); } catch (e) { hotel.images = []; }
    }
    if (typeof hotel.amenities === 'string') {
      try { hotel.amenities = JSON.parse(hotel.amenities); } catch (e) { hotel.amenities = []; }
    }

    // Fetch room types for this hotel
    const [roomTypes]: any = await pool.query('SELECT * FROM rb_room_types WHERE hotel_id = ?', [params.id]);
    
    const parsedRoomTypes = roomTypes.map((rt: any) => {
      let amenities = rt.amenities;
      if (typeof amenities === 'string') {
        try { amenities = JSON.parse(amenities); } catch(e) { amenities = []; }
      }
      return { ...rt, amenities };
    });

    return NextResponse.json({ hotel, roomTypes: parsedRoomTypes });
  } catch (error) {
    console.error('Failed to fetch hotel', error);
    return NextResponse.json({ error: 'Помилка завантаження' }, { status: 500 });
  }
}
