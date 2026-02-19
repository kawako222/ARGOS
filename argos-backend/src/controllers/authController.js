const pool = require('../db'); // (Ahorita creamos este archivo de conexión)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { email, password } = req.body;
  const now = new Date();
  const currentMonth = now.getMonth() + '-' + now.getFullYear();
  try {
    // 1. BUSCAR USUARIO
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas (Usuario no encontrado)" });
    }

    const user = userQuery.rows[0];

    // 2. VERIFICAR CONTRASEÑA (Magia de Bcrypt)
    // Compara la contraseña plana que llega con el HASH de la DB
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas (Contraseña incorrecta)" });
    }

    // 3. GENERAR TOKEN (JWT)
    // Esto es el "Gafete VIP". Contiene el ID y el ROL del usuario.
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secreto_super_seguro_temporal', // ¡Pon esto en tu .env!
      { expiresIn: '8h' } // El token expira en 8 horas
    );
    if (user.last_credit_reload !== currentMonth) {
    // Calculamos créditos mensuales (aprox 4 semanas)
    const newCredits = user.weekly_limit * 4; 
    await pool.query('UPDATE users SET credits = $1, last_credit_reload = $2 WHERE id = $3', 
    [newCredits, currentMonth, user.id]);
}
    // 4. RESPONDER AL FRONTEND
    res.json({
      message: "Login exitoso",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { login };
