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
    const { name, location, sport, sportLabel, stars, price, imageUrl, description, reviews, images, amenities } = body;

    const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);
    const amenitiesJson = JSON.stringify(Array.isArray(amenities) ? amenities : []);

    await pool.query(`
      UPDATE rb_hotels 
      SET name=?, location=?, sport=?, sport_label=?, stars=?, price=?, image_url=?, description=?, reviews=?, images=?, amenities=?
      WHERE id=?
    `, [name, location, sport, sportLabel, stars, price, imageUrl, description || '', reviews || 0, imagesJson, amenitiesJson, params.id]);



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
