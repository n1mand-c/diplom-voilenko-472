import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [messages]: any = await pool.query(
      'SELECT * FROM rb_support_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [params.id]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const ticketId = params.id;
    
    // Validate ticket access
    const [tickets]: any = await pool.query('SELECT * FROM rb_support_tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const ticket = tickets[0];

    if (session.role === 'ROLE_USER' && ticket.user_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Insert message
    await pool.query(
      'INSERT INTO rb_support_messages (ticket_id, sender_type, message) VALUES (?, ?, ?)',
      [ticketId, session.role, message]
    );

    // If a user replies, reopen the ticket
    if (session.role === 'ROLE_USER' && ticket.status === 'closed') {
      await pool.query('UPDATE rb_support_tickets SET status = ? WHERE id = ?', ['open', ticketId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
