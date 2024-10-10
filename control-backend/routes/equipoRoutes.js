const express = require('express');
const equipoController = require('../controllers/equipoController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'equipos');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage });

// Rutas para la gestión de equipos
router.get('/', equipoController.getEquipos); // Obtener todos los equipos
router.get('/:id_equipos', equipoController.getEquipoById); // Obtener un equipo por id_equipos
router.post('/', upload.single('imagen'), equipoController.createEquipo); // Crear un nuevo equipo con imagen
router.put('/:id_equipos', upload.single('imagen'), equipoController.updateEquipo); // Actualizar un equipo con una imagen nueva
router.delete('/:id_equipos', equipoController.deleteEquipo); // Eliminar un equipo

module.exports = router;
