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


module.exports = { getAllCourses, createCourse, updateCourse, deleteCourse };