import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { name, email, hotelId, message, subject } = await req.json();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure tables exist (auto-migrate)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        hotel_id INT,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_support_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES rb_support_tickets(id) ON DELETE CASCADE
      )
    `);

    const resolvedSubject = subject || `Звернення від ${name} (${email})`;
    const resolvedHotelId = hotelId ? parseInt(hotelId) : null;

    // Create ticket
    const [ticketResult]: any = await pool.query(
      'INSERT INTO rb_support_tickets (user_id, hotel_id, subject, status, guest_name, guest_email) VALUES (?, ?, ?, ?, ?, ?)',
      [session.userId, resolvedHotelId, resolvedSubject, 'open', name || 'Гість', email || '']
    );

    const ticketId = ticketResult.insertId;

    // Add initial message
    await pool.query(
      'INSERT INTO rb_support_messages (ticket_id, sender_type, message) VALUES (?, ?, ?)',
      [ticketId, session.role, message]
    );

    return NextResponse.json({ success: true, ticketId });
  } catch (error: any) {
    console.error("Contacts POST error:", error?.message || error);
    return NextResponse.json({ error: "Internal server error", details: error?.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure tables exist
    await pool.query(`CREATE TABLE IF NOT EXISTS rb_support_tickets (id INT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, hotel_id INT, subject VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS rb_support_messages (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, sender_type VARCHAR(50) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES rb_support_tickets(id) ON DELETE CASCADE)`);

    const { role, userId, hotelId } = session;
    
    let query = `
      SELECT t.*, 
             u.username as user_name, u.email as user_email,
             h.name as hotel_name,
             (SELECT COUNT(*) FROM rb_support_messages m WHERE m.ticket_id = t.id) as messages_count
      FROM rb_support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN rb_hotels h ON t.hotel_id = h.id
    `;
    let params: any[] = [];

    if (role === 'ROLE_USER') {
      query += ` WHERE t.user_id = ? ORDER BY t.created_at DESC`;
      params.push(userId);
    } else if (role === 'ROLE_MANAGER') {
      query += ` WHERE t.hotel_id = ? ORDER BY t.created_at DESC`;
      params.push(hotelId);
    } else if (role === 'ROLE_ADMIN') {
      query += ` ORDER BY t.status DESC, t.created_at DESC`;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [tickets]: any = await pool.query(query, params);
    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Contacts GET error:", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
