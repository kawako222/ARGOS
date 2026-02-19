const pool = require('./src/db');

const updateSchema = async () => {
  try {
    console.log("🔄 Actualizando esquema de base de datos...");

    // 1. Agregar créditos a usuarios (Si no existen)
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;`);
      console.log("✅ Columna 'credits' verificada.");
    } catch (e) { console.log("ℹ️ Nota sobre users:", e.message); }

    // 2. Agregar cupo a cursos (Si no existe)
    try {
      await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 15;`);
      console.log("✅ Columna 'capacity' verificada.");
    } catch (e) { console.log("ℹ️ Nota sobre courses:", e.message); }

    // 3. Crear tabla de RESERVAS (BOOKINGS)
    // CORRECCIÓN: Tanto user_id como course_id ahora son UUID
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,       -- Definimos primero el tipo
        course_id UUID NOT NULL,     -- Definimos primero el tipo
        class_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'CONFIRMED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Luego las relaciones (Foreign Keys)
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        
        -- Candado para no reservar doble
        UNIQUE(user_id, course_id, class_date) 
      );
    `);
    console.log("✅ Tabla 'bookings' creada correctamente.");

    console.log("🚀 Migración completada exitosamente.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fatal:", err);
    process.exit(1);
  }
};

updateSchema();