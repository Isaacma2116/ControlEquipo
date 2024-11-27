const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');

// Ruta para obtener el historial de un software por su ID
router.get('/:id/historial', softwareController.getSoftwareHistorial);

// Ruta para obtener software próximo a caducar o ya caducado
router.get('/expiring', softwareController.getExpiringSoftware);

// Ruta para obtener los nombres de los softwares (para autocompletar o sugerencias)
router.get('/names', softwareController.getSoftwareNames);

// Ruta para agrupar los nombres de software similares
router.get('/names/grouped', softwareController.groupSoftwareNames);

// Ruta para obtener el número de equipos asociados a un software por ID
router.get('/:id/equipos-usados', softwareController.getEquiposUsados);

// Ruta para obtener un software por su ID, incluyendo asociaciones
router.get('/:id', softwareController.getSoftware);

// Ruta para obtener todos los softwares, con paginación opcional
router.get('/', softwareController.getSoftwares);

// Ruta para obtener los softwares asociados a un equipo específico
router.get('/equipo/:idEquipo', softwareController.getSoftwaresByEquipo);

// Ruta para crear un nuevo software
router.post('/', softwareController.createSoftware);

// Ruta para actualizar un software por su ID, incluyendo actualizaciones de equipos y licencias
router.put('/:id', softwareController.updateSoftware);

// Ruta para eliminar un software por su ID
router.delete('/:id', softwareController.deleteSoftware);

module.exports = router;
