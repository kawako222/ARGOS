const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');


// Definimos que cuando alguien pegue a /login, se ejecute el controlador
router.post('/login', authController.login);

router.get('/me', verifyToken, (req, res) => {
  res.json({ 
    message: "¡Esta es información secreta!", 
    user_data: req.user // Aquí devolvemos lo que venía en el token
  });
});

module.exports = router;
