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

// 1. Obtener la lista de alumnas inscritas en una clase específica
router.get('/:id/students', courseController.getCourseStudents);

// 2. Marcar o quitar la asistencia u obtener
router.post('/attendance', courseController.toggleAttendance);
router.post('/finalize-attendance', courseController.finalizeAttendance);
router.get('/all-attendance', courseController.getAttendanceReport);

module.exports = router;