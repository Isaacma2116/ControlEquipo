const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Ruta para registrar usuarios
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

module.exports = router;
