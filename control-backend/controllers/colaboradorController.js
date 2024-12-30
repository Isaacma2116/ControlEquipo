const Colaborador = require('../models/Colaborador');
const Equipo = require('../models/Equipo'); // Asegúrate de que Equipo está correctamente importado
const path = require('path');
const fs = require('fs');

// Crear un nuevo colaborador
exports.createColaborador = async (req, res) => {
  try {
    const {
      id_empleado,
      nombre,
      area,
      cargo,
      correo,
      telefono_personal,
      telefono_smex,
      correo_smex,
    } = req.body;

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
      telefono_smex: telefono_smex || null, // Opcional
      correo_smex: correo_smex || null,   // Opcional
      fotografia,
      activo: true,
    });

    res.status(201).json(newColaborador);
  } catch (error) {
    console.error('Error al crear colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los colaboradores activos
exports.getColaboradores = async (req, res) => {
  try {
    const colaboradores = await Colaborador.findAll({
      where: { activo: true },
    });
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
    const colaborador = await Colaborador.findOne({
      where: { id: req.params.id, activo: true },
    });
    if (colaborador) {
      res.status(200).json(colaborador);
    } else {
      res.status(404).json({ error: 'Colaborador no encontrado o inactivo' });
    }
  } catch (error) {
    console.error('Error al obtener colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un colaborador por ID, incluyendo sus equipos
exports.getColaboradorWithEquipos = async (req, res) => {
  try {
    const colaborador = await Colaborador.findOne({
      where: { id: req.params.id, activo: true },
      include: [
        {
          model: Equipo,
          as: 'equipos',
        },
      ],
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado o inactivo' });
    }

    res.status(200).json(colaborador);
  } catch (error) {
    console.error('Error al obtener colaborador con equipos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un colaborador
// Actualizar un colaborador
exports.updateColaborador = async (req, res) => {
  try {
    const { id_empleado, nombre, area, cargo, correo, telefono_personal, telefono_smex, correo_smex } = req.body;

    const colaborador = await Colaborador.findByPk(req.params.id);
    if (!colaborador) {
      return res.status(404).json({ success: false, message: 'Colaborador no encontrado' });
    }

    // Obtener la imagen actual si no se subió una nueva
    const fotografia = req.file ? req.file.filename : colaborador.fotografia;

    // Eliminar imagen anterior si hay una nueva
    if (req.file && colaborador.fotografia) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'colaboradores', colaborador.fotografia);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Actualizar los datos del colaborador
    await colaborador.update({
      id_empleado,
      nombre,
      area,
      cargo,
      correo,
      telefono_personal,
      telefono_smex: telefono_smex || null, // Opcional
      correo_smex: correo_smex || null,   // Opcional
      fotografia,
    });

    res.status(200).json({ success: true, data: colaborador });
  } catch (error) {
    console.error('Error al actualizar colaborador:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Desactivar un colaborador (eliminación suave)
exports.deleteColaborador = async (req, res) => {
  try {
    const colaborador = await Colaborador.findByPk(req.params.id);
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    // Cambiar el estado a inactivo
    colaborador.activo = false;
    await colaborador.save();

    res.status(200).json({ message: 'Colaborador desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reactivar un colaborador
exports.reactivateColaborador = async (req, res) => {
  try {
    const colaborador = await Colaborador.findByPk(req.params.id);
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    // Cambiar el estado a activo
    colaborador.activo = true;
    await colaborador.save();

    res.status(200).json({ message: 'Colaborador reactivado correctamente' });
  } catch (error) {
    console.error('Error al reactivar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
};
