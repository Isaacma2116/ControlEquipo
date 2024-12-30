const Celular = require('../models/Celular');
const Colaborador = require('../models/Colaborador');

// Controlador para manejar Celulares
const CelularController = {
  // Obtener todos los celulares
  async getAll(req, res) {
    try {
      const celulares = await Celular.findAll({
        include: {
          model: Colaborador,
          as: 'colaborador',
          attributes: ['id', 'nombre', 'correo'], // Incluye solo campos relevantes del colaborador
        },
      });

      if (celulares.length === 0) {
        return res.status(404).json({ error: 'No se encontraron celulares.' });
      }

      res.status(200).json(celulares);
    } catch (error) {
      console.error('Error al obtener los celulares:', error);
      res.status(500).json({ error: 'Error al obtener los celulares' });
    }
  },

  // Obtener un celular por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const celular = await Celular.findByPk(id, {
        include: {
          model: Colaborador,
          as: 'colaborador',
          attributes: ['id', 'nombre', 'correo'],
        },
      });

      if (!celular) {
        return res.status(404).json({ error: 'Celular no encontrado' });
      }

      res.status(200).json(celular);
    } catch (error) {
      console.error('Error al obtener el celular:', error);
      res.status(500).json({ error: 'Error al obtener el celular' });
    }
  },

  // Crear un nuevo celular
  async create(req, res) {
    try {
      const {
        color,
        marca,
        modelo,
        imei,
        numeroDeSerie,
        contrasena_o_pin,
        correoAsociado,
        contrasenaDelCorreo,
        componentesDelCelular,
        renovacionDelEquipo,
        idColaborador,
      } = req.body;

      // Validar que el IMEI tenga entre 15 y 20 caracteres
      if (imei.length < 15 || imei.length > 20) {
        return res.status(400).json({ error: 'El IMEI debe tener entre 15 y 20 caracteres.' });
      }

      const nuevoCelular = await Celular.create({
        color,
        marca,
        modelo,
        imei,
        numeroDeSerie,
        contrasena_o_pin,
        correoAsociado,
        contrasenaDelCorreo,
        componentesDelCelular,
        renovacionDelEquipo,
        idColaborador: idColaborador || null, // Puede ser nulo si no se proporciona un colaborador
      });

      res.status(201).json(nuevoCelular);
    } catch (error) {
      console.error('Error al crear el celular:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.errors.map((e) => e.message).join(', ') });
      }
      res.status(500).json({ error: 'Error al crear el celular' });
    }
  },

  // Actualizar un celular existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        color,
        marca,
        modelo,
        imei,
        numeroDeSerie,
        contrasena_o_pin,
        correoAsociado,
        contrasenaDelCorreo,
        componentesDelCelular,
        renovacionDelEquipo,
        idColaborador,
      } = req.body;

      // Validar que el IMEI tenga entre 15 y 20 caracteres
      if (imei && (imei.length < 15 || imei.length > 20)) {
        return res.status(400).json({ error: 'El IMEI debe tener entre 15 y 20 caracteres.' });
      }

      const celular = await Celular.findByPk(id);
      if (!celular) {
        return res.status(404).json({ error: 'Celular no encontrado' });
      }

      await celular.update({
        color,
        marca,
        modelo,
        imei,
        numeroDeSerie,
        contrasena_o_pin,
        correoAsociado,
        contrasenaDelCorreo,
        componentesDelCelular,
        renovacionDelEquipo,
        idColaborador: idColaborador || celular.idColaborador, // Si no se proporciona, se mantiene el anterior
      });

      res.status(200).json(celular);
    } catch (error) {
      console.error('Error al actualizar el celular:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: error.errors.map((e) => e.message).join(', ') });
      }
      res.status(500).json({ error: 'Error al actualizar el celular' });
    }
  },

  // Eliminar un celular
  async delete(req, res) {
    try {
      const { id } = req.params;

      const celular = await Celular.findByPk(id);
      if (!celular) {
        return res.status(404).json({ error: 'Celular no encontrado' });
      }

      await celular.destroy();
      res.status(204).send(); // Respuesta sin contenido
    } catch (error) {
      console.error('Error al eliminar el celular:', error);
      res.status(500).json({ error: 'Error al eliminar el celular' });
    }
  },
};

module.exports = CelularController;
