const pool = require('../db');

// 1. OBTENER TODAS LAS CLASES (GET)
const getAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*, 
        u.name as teacher_name 
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener clases" });
  }
};

// ... (El resto del archivo déjalo igual, la función createCourse no cambia)

const createCourse = async (req, res) => {
  const { name, schedule, capacity, teacher_id } = req.body; // <--- ¿Lo estamos desestructurando?

  try {
    const query = `
      INSERT INTO courses (name, schedule, capacity, teacher_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, schedule, capacity, teacher_id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear clase" });
  }
};

// 3. EDITAR CLASE
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, schedule, capacity, teacher_id } = req.body; // <--- REVISA ESTO

  try {
    const query = `
      UPDATE courses 
      SET name = $1, schedule = $2, capacity = $3, teacher_id = $4 
      WHERE id = $5 
      RETURNING *
    `;
    const result = await pool.query(query, [name, schedule, capacity, teacher_id, id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Clase no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar clase" });
  }
};
// 4. ELIMINAR CLASE
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Sin permiso" });

  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: "Clase eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar" });
  }
};

// 5. OBTENER ALUMNAS DE UNA CLASE (Buscando en tus 'bookings')
const getCourseStudents = async (req, res) => {
  const { id } = req.params; // ID del curso
  try {
    // 🕵️‍♂️ Buscamos en la tabla bookings para la fecha actual (CURRENT_DATE)
    const query = `
      SELECT 
        u.id, 
        u.name,
        EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.student_id = u.id 
          AND a.course_id = $1 
          AND a.date = CURRENT_DATE
        ) as attended_today
      FROM bookings b
      JOIN users u ON b.user_id = u.id 
      WHERE b.course_id = $1 
      AND DATE(b.class_date) = CURRENT_DATE
      AND u.role = 'ALUMNA'
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener alumnas del curso:", error);
    res.status(500).json({ error: "Error al obtener la lista de alumnas" });
  }
};

// 6. MARCAR (O QUITAR) ASISTENCIA (Botón Verde)
const toggleAttendance = async (req, res) => {
  const { course_id, student_id, date } = req.body;

  try {
    // 1. Revisamos si ya existe la asistencia
    const checkQuery = 'SELECT * FROM attendance WHERE course_id = $1 AND student_id = $2 AND date = $3';
    const checkResult = await pool.query(checkQuery, [course_id, student_id, date]);

    if (checkResult.rows.length > 0) {
      // Si ya existía (estaba en verde), la borramos (se quita lo verde)
      await pool.query('DELETE FROM attendance WHERE id = $1', [checkResult.rows[0].id]);
      res.json({ message: "Asistencia removida", attended: false });
    } else {
      // Si no existía, la creamos (se pone en verde)
      await pool.query(
        'INSERT INTO attendance (course_id, student_id, date) VALUES ($1, $2, $3)',
        [course_id, student_id, date]
      );
      res.json({ message: "Asistencia registrada", attended: true });
    }
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ error: "Error al registrar asistencia" });
  }
};

// 7: Guardar el pase de lista completo al Finalizar Clase
const finalizeAttendance = async (req, res) => {
  const { course_id, date, students } = req.body;

  try {
    // 1. Borramos cualquier registro previo de esta clase hoy (por si el profe le dio finalizar 2 veces)
    await pool.query('DELETE FROM attendance WHERE course_id = $1 AND date = $2', [course_id, date]);

    // 2. Filtramos solo a las alumnas que sí vinieron (las que tienen el botón verde)
    const presentStudents = students.filter(s => s.attended === true);

    // 3. Insertamos su asistencia en la base de datos
    for (const student of presentStudents) {
      await pool.query(
        'INSERT INTO attendance (course_id, student_id, date) VALUES ($1, $2, $3)',
        [course_id, student.id, date]
      );
    }

    res.json({ message: "Registro de asistencia cerrado exitosamente" });
  } catch (error) {
    console.error("Error al finalizar la asistencia:", error);
    res.status(500).json({ error: "Error interno al guardar el registro" });
  }
};

// 8. REPORTE GLOBAL DE ASISTENCIAS (Para el Admin)
const getAttendanceReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id as attendance_id,
        a.date,
        c.name as course_name,
        u.name as student_name,
        t.name as teacher_name
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users t ON c.teacher_id = t.id
      ORDER BY a.date DESC, c.name ASC, u.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener el reporte de asistencias:", error);
    res.status(500).json({ error: "Error al obtener el reporte" });
  }
};

module.exports = { 
  getAllCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCourseStudents,
  toggleAttendance,
  finalizeAttendance,
  getAttendanceReport   
};