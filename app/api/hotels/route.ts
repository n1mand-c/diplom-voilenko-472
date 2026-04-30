import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'all';

    let query = `
      SELECT 
        h.*,
        (SELECT JSON_ARRAYAGG(image_url) FROM rb_hotel_images WHERE hotel_id = h.id) as images
      FROM rb_hotels h
    `;
    let params: any[] = [];

    if (sport !== 'all') {
      query += ' WHERE h.sport = ?';
      params.push(sport);
    }
    
    query += ' ORDER BY stars DESC, rating DESC';

    const [rows]: any = await pool.query(query, params);

    const parsedRows = rows.map((h: any) => {
      let images = h.images;
      if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch(e) { images = []; }
      }
      return { ...h, images };
    });

    return NextResponse.json({ hotels: parsedRows });
  } catch (error) {
    console.error('Error fetching public hotels', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
