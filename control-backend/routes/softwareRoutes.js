// routes/softwareRoutes.js

const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');

// **Rutas Más Específicas Primero**
router.get('/:id/historial', softwareController.getSoftwareHistorial);
router.get('/:id/equipos-usados', softwareController.getEquiposUsados);
router.get('/equipo/:idEquipo', softwareController.getSoftwaresByEquipo);
router.get('/expiring', softwareController.getExpiringSoftware);

// **Rutas Generales Después**
router.get('/', softwareController.getSoftwares);
router.get('/:id', softwareController.getSoftware);
router.post('/', softwareController.createSoftware);
router.put('/:id', softwareController.updateSoftware);
router.delete('/:id', softwareController.deleteSoftware);

module.exports = router;
