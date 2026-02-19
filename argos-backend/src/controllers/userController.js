const pool = require('../db');
const bcrypt = require('bcrypt');

// 1. OBTENER TODOS LOS USUARIOS (Incluimos el sueldo para los maestros)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, credits, plan_type, role_assignment, measurements, monthly_salary FROM users ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// 2. REGISTRAR / CREAR USUARIO (Unificado)
// Esta función servirá tanto para el registro público como para que el Admin cree gente
const registerUser = async (req, res) => {
  const { name, email, password, role, monthly_salary, plan_type, role_assignment } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (
        name, email, password_hash, role, 
        monthly_salary, plan_type, role_assignment, measurements, credits
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, name, email, role, monthly_salary;
    `;
    
    const values = [
      name, 
      email, 
      hashedPassword, 
      role || 'ALUMNA', 
      monthly_salary || 0,
      plan_type || 'Sin asignar',
      role_assignment || 'Sin asignar',
      JSON.stringify({ busto: '', cintura: '', cadera: '', talla: '' }),
      0 // créditos iniciales
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("❌ ERROR EN REGISTRO:", error.message);
    if (error.code === '23505') {
      return res.status(400).json({ error: "Ese correo ya existe." });
    }
    res.status(500).json({ error: "Error interno al registrar" });
  }
};

// 3. ACTUALIZAR USUARIO (Incluye sueldo y todos los campos nuevos)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, plan_type, role_assignment, measurements, monthly_salary } = req.body;

  try {
    const query = `
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        plan_type = COALESCE($4, plan_type),
        role_assignment = COALESCE($5, role_assignment),
        measurements = COALESCE($6, measurements),
        monthly_salary = COALESCE($7, monthly_salary)
      WHERE id = $8 
      RETURNING *;
    `;

    const result = await pool.query(query, [
      name || null, 
      email || null, 
      role || null, 
      plan_type || null, 
      role_assignment || null, 
      measurements ? JSON.stringify(measurements) : null,
      monthly_salary || null,
      id
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en update:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

// 4. ELIMINAR USUARIO
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Sin permiso" });

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};

// 5. OBTENER MI PROPIA INFO (Dashboard del alumno/maestro)
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, credits, plan_type, role_assignment, measurements, monthly_salary FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// 6. REGISTRAR UN PAGO
const createPayment = async (req, res) => {
  const { user_id, amount, description, add_credits } = req.body; 

  try {
    // 1. Registramos el pago en el historial
    const queryPayment = `
      INSERT INTO payments (user_id, amount, description) 
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const result = await pool.query(queryPayment, [user_id, amount, description]);

    // 2. Si viene la orden de añadir créditos (mensualidad), actualizamos a la alumna
    if (add_credits) {
      await pool.query(
        `UPDATE users SET credits = COALESCE(credits, 0) + $1 WHERE id = $2`, 
        [add_credits, user_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error en pago:", error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};

// 7. OBTENER PAGOS DE UNA ALUMNA
const getPaymentsByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY payment_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

module.exports = { getAllUsers, registerUser, updateUser, deleteUser, getMe, createPayment, getPaymentsByUser };