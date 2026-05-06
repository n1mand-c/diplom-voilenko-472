import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ticketId = params.id;
    const [tickets]: any = await pool.query(
      `SELECT t.*, u.username as user_name, u.email as user_email, h.name as hotel_name 
       FROM rb_support_tickets t 
       LEFT JOIN users u ON t.user_id = u.id 
       LEFT JOIN rb_hotels h ON t.hotel_id = h.id 
       WHERE t.id = ?`,
      [ticketId]
    );

    if (tickets.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const ticket = tickets[0];

    // Check permissions
    if (session.role === 'ROLE_USER' && ticket.user_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.role === 'ROLE_MANAGER' && ticket.hotel_id !== session.hotelId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Ticket GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || (session.role !== 'ROLE_ADMIN' && session.role !== 'ROLE_MANAGER')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    await pool.query('UPDATE rb_support_tickets SET status = ? WHERE id = ?', [status, params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ticket PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
