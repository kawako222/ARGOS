const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/authMiddleware');

// Todo requiere login
router.use(verifyToken);

// Reservar una clase
router.post('/', bookingController.createBooking);

// Ver mis reservas
router.get('/', bookingController.getMyBookings);

//Cancelar reservas
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;