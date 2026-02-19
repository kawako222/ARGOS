require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedAdmin() {
  console.log("🔐 Preparando inyección del usuario ADMIN...");

  // DATOS DEL ADMINISTRADOR (Cámbialos si quieres)
  const adminName = "Administrador Argos";
  const adminEmail = "admin@argos.com";
  const adminPasswordPlana = "AdminSeguro2026!"; // Esta es la que usarás para loguearte

  try {
    // 1. ENCRIPTACIÓN (HASHING)
    // El número '10' son los "Salt Rounds".
    // 10 es rápido, 12 es seguro, 14 es paranoico (y lento). 10 está bien para empezar.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPasswordPlana, saltRounds);

    console.log(`✅ Contraseña encriptada: ${passwordHash.substring(0, 20)}... (truncado)`);

    // 2. INSERCIÓN EN LA BASE DE DATOS
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'ADMIN')
      ON CONFLICT (email) DO NOTHING -- Si ya existe, no hace nada (evita errores)
      RETURNING id, email, role;
    `;

    const res = await pool.query(query, [adminName, adminEmail, passwordHash]);

    if (res.rows.length > 0) {
      console.log("🎉 ¡Usuario ADMIN creado con éxito!");
      console.log("🆔 ID generado (UUID):", res.rows[0].id);
      console.log("📧 Email:", res.rows[0].email);
      console.log("🔑 Contraseña:", adminPasswordPlana);
    } else {
      console.log("⚠️  El usuario ADMIN ya existía. No se hicieron cambios.");
    }

  } catch (error) {
    console.error("❌ Error al crear admin:", error);
  } finally {
    pool.end();
  }
}

seedAdmin();
