const pool = require('../db');

// 1. RESERVAR CLASE (Gastar 1 Crédito)
const createBooking = async (req, res) => {
  const { courseId, classDate } = req.body; // ID de la clase y Fecha (YYYY-MM-DD)
  const userId = req.user.id; // ID del alumno (viene del Token)

  const client = await pool.connect(); // Abrimos cliente para transacción

  try {
    await client.query('BEGIN'); // 🏁 INICIA LA TRANSACCIÓN

    // A. VERIFICAR CRÉDITOS
    const userRes = await client.query('SELECT credits FROM users WHERE id = $1', [userId]);
    const userCredits = userRes.rows[0].credits;

    if (userCredits < 1) {
      throw new Error("Saldo insuficiente. Necesitas comprar más créditos.");
    }

    // B. VERIFICAR CUPO
    // 1. Ver capacidad máxima del curso
    const courseRes = await client.query('SELECT capacity FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) throw new Error("Clase no encontrada");
    
    const maxCapacity = courseRes.rows[0].capacity;

    // 2. Contar inscritos para esa fecha
    const countRes = await client.query(
      'SELECT COUNT(*) FROM bookings WHERE course_id = $1 AND class_date = $2 AND status = \'CONFIRMED\'',
      [courseId, classDate]
    );
    const currentBookings = parseInt(countRes.rows[0].count);

    if (currentBookings >= maxCapacity) {
      throw new Error("Clase llena. No hay cupo disponible.");
    }

    // C. EJECUTAR LA RESERVA
    // 1. Insertar en tabla bookings
    await client.query(
      `INSERT INTO bookings (user_id, course_id, class_date) VALUES ($1, $2, $3)`,
      [userId, courseId, classDate]
    );

    // 2. Restar el crédito al usuario
    await client.query(
      `UPDATE users SET credits = credits - 1 WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT'); // ✅ CONFIRMAR TODO (Guardar cambios)
    
    res.status(201).json({ message: "¡Reserva exitosa! Se descontó 1 crédito." });

  } catch (error) {
    await client.query('ROLLBACK'); // ❌ CANCELAR TODO (Si algo falló)
    
    // Si el error es "Llave duplicada" (Ya reservó esa clase)
    if (error.code === '23505') {
       return res.status(400).json({ error: "Ya tienes reservada esta clase para esa fecha." });
    }
    
    console.error(error);
    res.status(400).json({ error: error.message || "Error al reservar" });
  } finally {
    client.release(); // Soltar la conexión
  }
};

// 2. VER MIS RESERVAS (Historial)
const getMyBookings = async (req, res) => {
  try {
    const query = `
      SELECT b.id, b.class_date, b.course_id, c.name as course_name 
      FROM bookings b
      JOIN courses c ON b.course_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.class_date ASC
    `;
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

//3. CANCELAR RESERVAS
// CANCELAR RESERVA (Y reembolsar crédito)
const deleteBooking = async (req, res) => {
  const { id } = req.params; // ID de la reserva
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificamos que la reserva exista y sea del usuario
    const bookingRes = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (bookingRes.rows.length === 0) {
      throw new Error("Reserva no encontrada o no tienes permiso.");
    }

    // 2. Borramos la reserva
    await client.query('DELETE FROM bookings WHERE id = $1', [id]);

    // 3. Devolvemos el crédito
    await client.query(
      'UPDATE users SET credits = credits + 1 WHERE id = $1',
      [userId]
    );

    await client.query('COMMIT');
    res.json({ message: "Reserva cancelada y crédito reembolsado." });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};


module.exports = { createBooking, getMyBookings, deleteBooking };
