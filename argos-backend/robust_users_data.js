const pool = require('./src/db');

const updateUsersTable = async () => {
  try {
    console.log("🔄 Asegurando estructura completa de la tabla users...");

    await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password TEXT,
        ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'Sin asignar',
        ADD COLUMN IF NOT EXISTS measurements JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS profile_picture TEXT,
        ADD COLUMN IF NOT EXISTS role_assignment VARCHAR(100) DEFAULT 'Sin asignar',
        ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
    `);

    console.log("✅ Estructura de usuarios verificada y actualizada.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error crítico en la base de datos:", err);
    process.exit(1);
  }
};

updateUsersTable();