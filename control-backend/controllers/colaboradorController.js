const Colaborador = require('../models/Colaborador');
const Equipo = require('../models/Equipo'); // Asegúrate de que Equipo está correctamente importado
const path = require('path');
const fs = require('fs');

// Crear un nuevo colaborador
exports.createColaborador = async (req, res) => {
  try {
    const { id_empleado, nombre, area, cargo, correo, telefono_personal, correo_smex } = req.body;
    if (!id_empleado || !nombre || !area || !cargo || !correo) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const fotografia = req.file ? req.file.filename : null;

    const newColaborador = await Colaborador.create({
      id_empleado,
      nombre,
      area,
      cargo,
      correo,
      telefono_personal,
      correo_smex,
      fotografia,
    });

    res.status(201).json(newColaborador);
  } catch (error) {
    console.error('Error al crear colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los colaboradores
exports.getColaboradores = async (req, res) => {
  try {
    const colaboradores = await Colaborador.findAll();
    if (colaboradores.length === 0) {
      return res.status(200).json({ message: 'No se encontraron colaboradores.', colaboradores: [] });
    }
    res.status(200).json(colaboradores);
  } catch (error) {
    console.error('Error al obtener colaboradores:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un colaborador por ID
exports.getColaboradorById = async (req, res) => {
  try {
    const colaborador = await Colaborador.findByPk(req.params.id);
    if (colaborador) {
      res.status(200).json(colaborador);
    } else {
      res.status(404).json({ error: 'Colaborador no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un colaborador por ID, incluyendo sus equipos
exports.getColaboradorWithEquipos = async (req, res) => {
  try {
    const colaborador = await Colaborador.findByPk(req.params.id, {
      include: [
        {
          model: Equipo,
          as: 'equipos',
        },
      ],
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    res.status(200).json(colaborador);
  } catch (error) {
    console.error('Error al obtener colaborador con equipos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un colaborador
exports.updateColaborador = async (req, res) => {
  try {
    const { id_empleado, nombre, area, cargo, correo, telefono_personal, correo_smex } = req.body;
    if (!id_empleado || !nombre || !area || !cargo || !correo) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const fotografia = req.file ? req.file.filename : req.body.fotografia;

    const colaborador = await Colaborador.findByPk(req.params.id);
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    // Eliminar imagen anterior si hay una nueva
    if (req.file && colaborador.fotografia) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'colaboradores', colaborador.fotografia);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await colaborador.update({
      id_empleado,
      nombre,
      area,
      cargo,
      correo,
      telefono_personal,
      correo_smex,
      fotografia,
    });

    res.status(200).json(colaborador);
  } catch (error) {
    console.error('Error al actualizar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un colaborador
exports.deleteColaborador = async (req, res) => {
  try {
    const colaborador = await Colaborador.findByPk(req.params.id);
    if (colaborador) {
      // Elimina la imagen del colaborador si existe
      if (colaborador.fotografia) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'colaboradores', colaborador.fotografia);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      await colaborador.destroy();
      res.status(200).json({ message: 'Colaborador eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Colaborador no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};
