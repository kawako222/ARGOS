const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const verifyToken = require('../middlewares/authMiddleware');

// PROTECCIÓN: Solo usuarios logueados pueden ver/crear clases
router.use(verifyToken);

// Rutas
router.get('/', courseController.getAllCourses);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;