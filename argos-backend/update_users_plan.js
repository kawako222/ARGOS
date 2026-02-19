const pool = require('./src/db');

const updateUsersTable = async () => {
  try {
    console.log("🔄 Actualizando tabla de usuarios...");

    // 1. Agregamos el límite semanal (cuántas clases puede tomar)
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS weekly_limit INTEGER DEFAULT 0;
    `);

    // 2. Agregamos el nombre del plan (ej. 'Plan 2 clases')
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50) DEFAULT 'Sin Plan';
    `);

    // 3. Agregamos un registro de la última recarga para evitar duplicados
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_credit_reload VARCHAR(20);
    `);

    console.log("✅ Tabla de usuarios actualizada con éxito.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al actualizar la base de datos:", err);
    process.exit(1);
  }
};

updateUsersTable();
