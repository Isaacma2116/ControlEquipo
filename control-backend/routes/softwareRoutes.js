const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');

// Ruta para obtener los nombres de software
router.get('/names', softwareController.getSoftwareNames);

// Otras rutas para CRUD
router.post('/', softwareController.createSoftware);
router.get('/', softwareController.getSoftwares);
router.get('/:id', softwareController.getSoftware);
router.put('/:id', softwareController.updateSoftware);
router.delete('/:id', softwareController.deleteSoftware);

module.exports = router;
