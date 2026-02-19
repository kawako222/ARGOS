const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware'); // Tu middleware original

// 1. RUTAS PÚBLICAS (Opcional)
// Si quieres que el registro sea abierto, ponlo antes del verifyToken
router.post('/register', userController.registerUser);

// 2. PROTECCIÓN: De aquí para abajo, todo pide Token
router.use(verifyToken);

router.get('/', userController.getAllUsers);
router.get('/me', userController.getMe);

// 3. GESTIÓN (Editar y Borrar)
router.put('/:id', userController.updateUser);   
router.delete('/:id', userController.deleteUser); 

//4. PAGOS
router.get('/:id/payments', userController.getPaymentsByUser);
router.post('/payments', userController.createPayment);

// NOTA: Quité la línea de 'createUser' porque ahora usas 'registerUser'
// NOTA: Quité 'addCredits' porque lo integraremos dentro de 'updateUser' más adelante

module.exports = router;