const express = require('express');
const multer = require('multer');
const path = require('path');
const colaboradorController = require('../controllers/colaboradorController');

const router = express.Router();

// Configuración de almacenamiento para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/colaboradores'); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Nombre del archivo único
  },
});

const upload = multer({ storage });

// Rutas para manejar las operaciones CRUD de colaboradores
router.post('/', upload.single('fotografia'), colaboradorController.createColaborador); // Crear colaborador
router.get('/', colaboradorController.getColaboradores); // Obtener todos los colaboradores
router.get('/:id', colaboradorController.getColaboradorById); // Obtener colaborador por ID
router.get('/:id/equipos', colaboradorController.getColaboradorWithEquipos); // Obtener colaborador con equipos asociados
router.put('/:id', upload.single('fotografia'), colaboradorController.updateColaborador); // Actualizar colaborador
router.delete('/:id', colaboradorController.deleteColaborador); // Eliminar colaborador

module.exports = router;
