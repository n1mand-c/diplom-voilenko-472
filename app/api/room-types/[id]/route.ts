import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || session.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await pool.query('DELETE FROM rb_room_types WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room type', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, capacity, extraPrice, totalRooms, amenities } = await req.json();
    const amenitiesJson = JSON.stringify(Array.isArray(amenities) ? amenities : []);

    await pool.query(`
      UPDATE rb_room_types 
      SET name = ?, capacity = ?, extra_price = ?, total_rooms = ?, amenities = ?
      WHERE id = ?
    `, [name, capacity, extraPrice || 0, totalRooms || 1, amenitiesJson, params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating room type', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
