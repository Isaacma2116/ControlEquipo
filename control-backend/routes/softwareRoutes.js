const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');

// Ruta para obtener los nombres de los softwares (más específica)
router.get('/names', softwareController.getSoftwareNames);

// Ruta para obtener todos los softwares
router.get('/', softwareController.getSoftwares);

// Ruta para obtener un software por su ID (ruta dinámica, va después de las rutas específicas)
router.get('/:id', softwareController.getSoftware);

// Ruta para obtener softwares asociados a un equipo
router.get('/equipo/:idEquipo', softwareController.getSoftwaresByEquipo);

// Ruta para crear un software
router.post('/', softwareController.createSoftware);

// Ruta para actualizar un software por su ID
router.put('/:id', softwareController.updateSoftware);

// Ruta para eliminar un software por su ID
router.delete('/:id', softwareController.deleteSoftware);

module.exports = router;
