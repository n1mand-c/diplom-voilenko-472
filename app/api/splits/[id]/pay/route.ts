import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// PUT /api/splits/[id]/pay — mark split as paid
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { paymentMethod } = body; // 'card' | 'transfer' | 'later'

    // Verify this split belongs to current user
    const [rows]: any = await pool.query(
      `SELECT * FROM rb_booking_splits WHERE id = ? AND user_id = ?`,
      [id, session.userId]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (rows[0].status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 });

    if (paymentMethod === 'later' || paymentMethod === 'transfer') {
      if (paymentMethod === 'transfer') {
        await pool.query(`UPDATE rb_booking_splits SET payment_method = 'transfer' WHERE id = ?`, [id]);
      }
      return NextResponse.json({ success: true, status: 'pending' });
    }

    await pool.query(
      `UPDATE rb_booking_splits SET status = 'paid', payment_method = ?, paid_at = NOW() WHERE id = ?`,
      [paymentMethod, id]
    );

    return NextResponse.json({ success: true, status: 'paid' });
  } catch (e) {
    console.error('Error paying split', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
