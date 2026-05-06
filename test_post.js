const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '26091017', database: 'test1' });
  try {
    const session = { userId: 1, role: 'ROLE_USER' };
    const hotelId = "";
    const name = "test";
    const email = "test@test.com";
    const message = "hello";
    const subject = "";
    
    const resolvedSubject = subject || `Звернення від ${name} (${email})`;
    const resolvedHotelId = hotelId ? parseInt(hotelId) : null;

    // Create ticket
    const [ticketResult] = await pool.query(
      'INSERT INTO rb_support_tickets (user_id, hotel_id, subject, status, guest_name, guest_email) VALUES (?, ?, ?, ?, ?, ?)',
      [session.userId, resolvedHotelId, resolvedSubject, 'open', name || 'Гість', email || '']
    );

    const ticketId = ticketResult.insertId;

    // Add initial message
    await pool.query(
      'INSERT INTO rb_support_messages (ticket_id, sender_role, message) VALUES (?, ?, ?)',
      [ticketId, session.role, message]
    );
    console.log("Success", ticketId);
  } catch(e) {
    console.error("ERROR:");
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
