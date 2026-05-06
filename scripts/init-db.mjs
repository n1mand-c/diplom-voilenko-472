import mysql from 'mysql2/promise';

async function initDB() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26091017',
    database: 'test1',
  });

  try {
    // 1. Hotels Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        sport_label VARCHAR(100) NOT NULL,
        stars INT DEFAULT 4,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        description TEXT,
        rating DECIMAL(3,1) DEFAULT 0.0,
        reviews INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Room Types Table (belonging to a Hotel)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        capacity INT DEFAULT 2,
        extra_price DECIMAL(10,2) DEFAULT 0.00,
        FOREIGN KEY (hotel_id) REFERENCES rb_hotels(id) ON DELETE CASCADE
      )
    `);

    // 3. Bookings Table
    // We link guest name, hotel info, and dates.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT, -- Link to existing spring boot users if needed
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50),
        hotel_id INT NOT NULL,
        room_type_id INT,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests_count INT DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'card',
        status VARCHAR(50) DEFAULT 'pending',
        discount_applied BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES rb_hotels(id)
      )
    `);

    // 4. Support Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        hotel_id INT,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES rb_hotels(id) ON DELETE SET NULL
      )
    `);

    // 5. Support Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rb_support_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES rb_support_tickets(id) ON DELETE CASCADE
      )
    `);

    // Ensure columns exist (Alter tables)
    try {
      await pool.query('ALTER TABLE rb_hotels ADD COLUMN amenities JSON');
      await pool.query('ALTER TABLE rb_hotels ADD COLUMN images JSON');
    } catch(e) {}
    try {
      await pool.query('ALTER TABLE rb_room_types ADD COLUMN amenities JSON');
      await pool.query('ALTER TABLE rb_room_types ADD COLUMN total_rooms INT DEFAULT 1');
    } catch(e) {}

    console.log("Datatables rb_hotels, rb_room_types, and rb_bookings created successfully!");

    // Seed data if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM rb_hotels');
    if (rows[0].count === 0) {
      console.log("Seeding hotels...");
      await pool.query(`
        INSERT INTO rb_hotels (name, location, sport, sport_label, stars, price, image_url, description, rating, reviews) VALUES
        ('Alpine Extreme Resort', 'Шамоні, Франція', 'ski', 'Лижі / Фрірайд', 5, 4200, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop', 'Преміальний гірськолижний курорт у серці Монблану.', 4.9, 312),
        ('Powder Palace Hotel', 'Зельден, Австрія', 'snowboard', 'Сноубординг', 5, 3800, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop', 'Снобордичний рай з доступом до найкращих парків та свіжого пухляку.', 4.8, 247),
        ('Red Bull Base Camp', 'Іннсбрук, Австрія', 'ski', 'Лижі / Фрірайд', 4, 3100, 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&auto=format&fit=crop', 'Офіційний партнер Red Bull. Готель де зупиняються спортивні зірки.', 4.9, 521),
        ('Summit Climbers Lodge', 'Доломіти, Італія', 'climbing', 'Скелелазіння', 4, 2800, 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&auto=format&fit=crop', 'Спеціалізований готель для альпіністів з власним скеледромом.', 4.7, 189)
      `);
      
      console.log("Seeding room types...");
      await pool.query(`
        INSERT INTO rb_room_types (hotel_id, name, capacity, extra_price) VALUES
        (1, 'Стандарт', 2, 0),
        (1, 'Люкс', 2, 1500),
        (2, 'Стандарт', 2, 0),
        (2, 'Люкс', 3, 1200),
        (3, 'Стандарт', 2, 0),
        (4, 'Стандарт', 2, 0)
      `);
      console.log("Seed complete!");
    }

  } catch (error) {
    console.error("Failed to init DB", error);
  } finally {
    pool.end();
  }
}

initDB();
