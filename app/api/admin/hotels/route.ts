import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get hotels with room and booking stats and images array
    let query = `
      SELECT 
        h.*,
        (SELECT COUNT(*) FROM rb_room_types WHERE hotel_id = h.id) as room_types_count,
        (SELECT COUNT(*) FROM rb_bookings WHERE hotel_id = h.id AND status != 'cancelled') as active_bookings,
        (SELECT JSON_ARRAYAGG(image_url) FROM rb_hotel_images WHERE hotel_id = h.id) as images
      FROM rb_hotels h
    `;
    let queryParams: any[] = [];
    if (session.role === 'ROLE_MANAGER') {
      query += ` WHERE h.id = ? `;
      queryParams.push(session.hotelId || 0);
    }
    query += ` ORDER BY h.id DESC`;

    const [rows]: any = await pool.query(query, queryParams);

    // Actually, I'll rewrite the entire file inside replace content
    const parsedRows = rows.map((h: any) => {
      let images = h.images;
      if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch(e) { images = []; }
      }
      if (!Array.isArray(images)) images = [];
      let amenities = h.amenities;
      if (typeof amenities === 'string') {
        try { amenities = JSON.parse(amenities); } catch(e) { amenities = []; }
      }
      if (!Array.isArray(amenities)) amenities = [];
      // Parse sports array (new multi-sport field)
      let sports = h.sports;
      if (typeof sports === 'string') {
        try { sports = JSON.parse(sports); } catch(e) { sports = []; }
      }
      if (!Array.isArray(sports)) sports = h.sport ? [h.sport] : [];
      return { ...h, images, amenities, sports };
    });

    return NextResponse.json({ hotels: parsedRows });
  } catch (error) {
    console.error('Error fetching admin hotels', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, sport, sportLabel, sports, stars, price, imageUrl, description, reviews, images, amenities } = body;

    const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);
    const amenitiesJson = JSON.stringify(Array.isArray(amenities) ? amenities : []);
    const sportsJson = JSON.stringify(Array.isArray(sports) ? sports : (sport ? [sport] : []));

    const [result]: any = await pool.query(`
      INSERT INTO rb_hotels (name, location, sport, sport_label, sports, stars, price, image_url, description, reviews, images, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, location, sport, sportLabel, sportsJson, stars || 4, price, imageUrl, description || '', reviews || 0, imagesJson, amenitiesJson]);

    const hotelId = result.insertId;


    return NextResponse.json({ success: true, hotelId });
  } catch (error) {
    console.error('Error creating hotel', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
