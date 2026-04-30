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
    if (session.role === 'ROLE_MANAGER' && Number(session.hotelId) !== Number(params.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, sport, sportLabel, stars, price, imageUrl, description, reviews, images } = body;

    await pool.query(`
      UPDATE rb_hotels 
      SET name=?, location=?, sport=?, sport_label=?, stars=?, price=?, image_url=?, description=?, reviews=?
      WHERE id=?
    `, [name, location, sport, sportLabel, stars, price, imageUrl, description || '', reviews || 0, params.id]);

    // Normalize images: handle both string and array, split anything comma-joined
    const rawImages = images;
    const normalizedImages: string[] = [];
    if (Array.isArray(rawImages)) {
      for (const item of rawImages) {
        if (typeof item === 'string') {
          // Each item might still be comma-joined if coming from old input
          item.split(',').map((u: string) => u.trim()).filter(Boolean).forEach((u: string) => normalizedImages.push(u));
        }
      }
    } else if (typeof rawImages === 'string' && rawImages) {
      rawImages.split(',').map((u: string) => u.trim()).filter(Boolean).forEach((u: string) => normalizedImages.push(u));
    }

    if (normalizedImages.length >= 0) {
      // Always sync the images: delete old ones
      await pool.query('DELETE FROM rb_hotel_images WHERE hotel_id=?', [params.id]);
      
      // Insert each one as a separate row
      for (const url of normalizedImages) {
        if (url) {
          await pool.query('INSERT INTO rb_hotel_images (hotel_id, image_url) VALUES (?, ?)', [params.id, url]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hotel', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || session.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await pool.query('DELETE FROM rb_hotels WHERE id=?', [params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hotel', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
