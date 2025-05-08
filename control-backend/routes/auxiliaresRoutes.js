// routes/auxiliaresRoutes.js

const express = require('express');
const router = express.Router();
const auxiliaresController = require('../controllers/auxiliaresController');

// Confirmar que el router está siendo cargado
console.log('Ruta auxiliaresRoutes cargada');

// Ruta de prueba
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Ruta de prueba funciona correctamente.' });
});

// Obtener todos los auxiliares activos
router.get('/', auxiliaresController.getAuxiliares);

// Crear un nuevo auxiliar
router.post('/', auxiliaresController.createAuxiliar);

// Reasignar equipo a un auxiliar
router.put('/:id_auxiliar/reasignar', auxiliaresController.reassignEquipo);

// Actualizar un auxiliar
router.put('/:id_auxiliar', auxiliaresController.updateAuxiliar);

// Desactivar (soft delete) un auxiliar
router.delete('/:id_auxiliar', auxiliaresController.softDeleteAuxiliar);

// Reactivar un auxiliar previamente desactivado (opcional)
router.post('/:id_auxiliar/restore', auxiliaresController.restoreAuxiliar);

module.exports = router;
