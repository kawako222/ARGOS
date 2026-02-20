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
  const userId = req.params.id;
  console.log(`\n🗑️ INICIANDO PROTOCOLO DE BORRADO PARA ID: ${userId}`);
  
  try {
    // PASO 1: Desvincular al maestro de sus clases 
    // (Actualizamos las clases para que queden sin maestro temporalmente en lugar de borrarlas)
    console.log("Paso 1: Desvinculando de la tabla 'courses'...");
    await pool.query('UPDATE courses SET teacher_id = NULL WHERE teacher_id = $1', [userId]);

    // PASO 2: Borramos su historial de nómina/pagos
    console.log("Paso 2: Borrando de la tabla 'payments'...");
    await pool.query('DELETE FROM payments WHERE user_id = $1', [userId]);

    // PASO 3: Ahora sí, la base de datos nos dejará borrar el expediente
    console.log("Paso 3: Borrando de la tabla 'users'...");
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log("✅ Expediente eliminado exitosamente.");
    res.status(200).json({ message: 'Expediente eliminado correctamente' });

  } catch (error) {
    console.error("\n🔥🔥 ERROR CRÍTICO AL BORRAR 🔥🔥");
    console.error("Motivo exacto de PostgreSQL:", error.message);
    res.status(500).json({ error: 'Error interno al intentar eliminar el expediente' });
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

// ==========================================
// FUNCIONES FINANCIERAS (Añadir a userController.js)
// ==========================================

// 8. Obtener TODOS los pagos de todas las alumnas
const getAllPayments = async (req, res) => {
  try {
    // Asegúrate de que los nombres de las columnas coincidan con tu base de datos
    const result = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json(result.rows); // En Postgres, los datos vienen dentro de .rows
  } catch (error) {
    console.error("Error obteniendo todos los pagos:", error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

// 9. Obtener TODOS los gastos
const getAllExpenses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo gastos:", error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

// 10. Crear un nuevo gasto (Viene del modal)
const createExpense = async (req, res) => {
  const { amount, description, category, date } = req.body;
  try {
    // Usamos $1, $2... para evitar inyecciones SQL en Postgres
    const result = await pool.query(
      'INSERT INTO expenses (amount, description, category, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [amount, description, category, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creando gasto:", error);
    res.status(500).json({ error: 'Error al registrar el gasto' });
  }
};
// Función para borrar PAGO
const deletePayment = async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Pago eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};

// Función para borrar GASTO
const deleteExpense = async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: 'Gasto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};



module.exports = {
  registerUser,
  getAllUsers,
  getMe,
  updateUser,
  deleteUser,
  getPaymentsByUser,
  createPayment,
  // 👇 ASEGÚRATE DE AGREGAR ESTAS 3 👇
  getAllPayments,
  getAllExpenses,
  createExpense,
  deletePayment,
  deleteExpense
};