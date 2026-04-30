import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const [reviews]: any = await pool.query(`
      SELECT * FROM rb_reviews
      WHERE hotel_id = ?
      ORDER BY created_at DESC
    `, [params.id]);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    const body = await req.json();
    const { rating, comment } = body;

    // Guest name from session or anonymous
    const guestName = session?.username || 'Анонім';
    const userId = session?.userId || null;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Рейтинг повинен бути від 1 до 5' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO rb_reviews (hotel_id, user_id, guest_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [params.id, userId, guestName, rating, comment || '']
    );

    // Update the hotel's aggregate rating
    await pool.query(`
      UPDATE rb_hotels SET
        rating = (SELECT AVG(rating) FROM rb_reviews WHERE hotel_id = ?),
        reviews = (SELECT COUNT(*) FROM rb_reviews WHERE hotel_id = ?)
      WHERE id = ?
    `, [params.id, params.id, params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating review', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
