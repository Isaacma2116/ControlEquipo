const express = require('express');
const CelularController = require('../controllers/CelularController');
const router = express.Router();

// Rutas para gestionar celulares
router.get('/', CelularController.getAll);
router.get('/:id', CelularController.getById);
router.post('/', CelularController.create);
router.put('/:id', CelularController.update);
router.delete('/:id', CelularController.delete);

module.exports = router;
