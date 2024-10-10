const express = require('express');
const multer = require('multer');
const path = require('path');
const colaboradorController = require('../controllers/colaboradorController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/colaboradores');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('fotografia'), colaboradorController.createColaborador);
router.get('/', colaboradorController.getColaboradores);
router.get('/:id', colaboradorController.getColaboradorById);
router.put('/:id', upload.single('fotografia'), colaboradorController.updateColaborador);
router.delete('/:id', colaboradorController.deleteColaborador);

module.exports = router;
