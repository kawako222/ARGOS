require('dotenv').config();
const { Pool } = require('pg');

// Configuración de conexión (la misma de antes)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTablesQuery = `
  -- 1. SEGURIDAD: Habilitar extensión para generar UUIDs aleatorios
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- 2. TABLA DE USUARIOS (El núcleo de identidad)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- OJO: Aquí va el hash, nunca el texto plano
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'MAESTRO', 'ALUMNA')) DEFAULT 'ALUMNA',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. TABLA DE CLASES (Lo que vendemos)
  CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    schedule JSONB, -- JSON es genial para horarios complejos sin crear mil tablas
    teacher_id UUID REFERENCES users(id),
    cost DECIMAL(10, 2) DEFAULT 0.00
  );

  -- 4. TABLA DE INSCRIPCIONES (Quién toma qué)
  CREATE TABLE IF NOT EXISTS enrollments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id) -- Evita que alguien se inscriba doble
  );

  -- 5. TABLA DE PAGOS (El dinero)
  CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDIENTE', 'PAGADO', 'VENCIDO')) DEFAULT 'PENDIENTE',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDB() {
  try {
    console.log("🏗️  Construyendo la base de datos de Argos...");
    await pool.query(createTablesQuery);
    console.log("✅ Tablas creadas con éxito. Sistema blindado con UUIDs.");
  } catch (error) {
    console.error("❌ Error construyendo la DB:", error);
  } finally {
    pool.end();
  }
}

initDB();
