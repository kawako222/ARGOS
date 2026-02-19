require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("📡 Intentando conectar a Argos DB...");

pool.query('SELECT NOW() as hora_servidor', (err, res) => {
  if (err) {
    console.error('❌ Error crítico:', err.message);
    if (err.code === '28P01') console.error('💡 Pista: Revisa tu contraseña en el .env');
    if (err.code === '3D000') console.error('💡 Pista: La base de datos no existe');
  } else {
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log('🕒 Hora de la DB:', res.rows[0].hora_servidor);
    console.log('🚀 El Backend está listo para recibir órdenes.');
  }
  pool.end();
});
