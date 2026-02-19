const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // 1. Buscar el token en los headers (Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  
  // Si no hay header, o no empieza con "Bearer ", rechazamos.
  if (!authHeader) {
    return res.status(403).json({ error: "Acceso Denegado: Falta el Token de seguridad." });
  }

  // El header viene como "Bearer eyJhbGciOi...", así que separamos el texto.
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: "Acceso Denegado: Token con formato incorrecto." });
  }

  try {
    // 2. VERIFICAR LA FIRMA (La magia de la criptografía)
    // Si el token fue modificado o expiró, esta línea lanza un error automáticamente.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_temporal');
    
    // 3. ¡Token Válido! 
    // Guardamos los datos del usuario dentro de la petición (req) para usarlos después.
    req.user = decoded;
    
    // Dejamos pasar la petición a la siguiente función (el Controller)
    next(); 

  } catch (err) {
    return res.status(401).json({ error: "Token Inválido o Expirado." });
  }
};

module.exports = verifyToken;
