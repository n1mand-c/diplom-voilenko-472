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
      return { ...h, images };
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
    const { name, location, sport, sportLabel, stars, price, imageUrl, description, reviews, images } = body;

    const [result]: any = await pool.query(`
      INSERT INTO rb_hotels (name, location, sport, sport_label, stars, price, image_url, description, reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, location, sport, sportLabel, stars || 4, price, imageUrl, description || '', reviews || 0]);

    const hotelId = result.insertId;

    // Normalize and save images - handle both arrays and comma-joined strings
    const normalizedImages: string[] = [];
    if (Array.isArray(images)) {
      for (const item of images) {
        if (typeof item === 'string') {
          item.split(',').map((u: string) => u.trim()).filter(Boolean).forEach((u: string) => normalizedImages.push(u));
        }
      }
    } else if (typeof images === 'string' && images) {
      images.split(',').map((u: string) => u.trim()).filter(Boolean).forEach((u: string) => normalizedImages.push(u));
    }

    for (const url of normalizedImages) {
      if (url) {
        await pool.query('INSERT INTO rb_hotel_images (hotel_id, image_url) VALUES (?, ?)', [hotelId, url]);
      }
    }

    return NextResponse.json({ success: true, hotelId });
  } catch (error) {
    console.error('Error creating hotel', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
