// controllers/auxiliaresController.js

const { Auxiliar, Equipo } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * Obtener todos los auxiliares activos con sus equipos asignados
 */
exports.getAuxiliares = async (req, res) => {
  try {
    const auxiliares = await Auxiliar.findAll({
      where: { estadoActivo: 1 }, // Solo auxiliares activos
      include: {
        model: Equipo,
        as: 'equipo',
        attributes: ['id_equipos', 'tipoDispositivo', 'marca', 'modelo', 'estadoActivo'],
      },
    });
    res.status(200).json(auxiliares);
  } catch (error) {
    console.error('Error al obtener auxiliares:', error);
    res.status(500).json({ message: 'Error al obtener auxiliares.', error: error.message });
  }
};

// controllers/auxiliaresController.js

exports.createAuxiliar = async (req, res) => {
  const { nombre_auxiliar, numero_serie_aux, id_equipo } = req.body;

  try {
    // Validar campos obligatorios
    if (!nombre_auxiliar || !numero_serie_aux) {
      console.log('Faltan campos obligatorios');
      return res.status(400).json({ message: 'Nombre y número de serie son obligatorios.' });
    }

    // Si se proporciona id_equipo, verificar que exista y esté activo
    if (id_equipo !== null && id_equipo !== undefined) {
      const equipo = await Equipo.findOne({
        where: { id_equipos: id_equipo, estadoActivo: 1 },
      });
      if (!equipo) {
        console.log(`Equipo con id_equipos ${id_equipo} no encontrado o inactivo`);
        return res.status(404).json({ message: 'El equipo proporcionado no existe o está inactivo.' });
      }
    }

    const newAuxiliar = await Auxiliar.create({
      nombre_auxiliar,
      numero_serie_aux,
      id_equipo: id_equipo || null, // Asignar null si no se proporciona id_equipo
      estadoActivo: 1, // Activar el auxiliar por defecto
    });

    // Obtener el auxiliar recién creado con su equipo
    const auxiliarWithEquipo = await Auxiliar.findByPk(newAuxiliar.id_auxiliar, {
      include: {
        model: Equipo,
        as: 'equipo',
        attributes: ['id_equipos', 'tipoDispositivo', 'marca', 'modelo', 'estadoActivo'],
      },
    });

    console.log('Auxiliar creado:', auxiliarWithEquipo);
    res.status(201).json(auxiliarWithEquipo);
  } catch (error) {
    console.error('Error al crear auxiliar:', error);
    res.status(500).json({ message: 'Error al crear auxiliar.', error: error.message });
  }
};


/**
 * Actualizar un auxiliar existente
 */
exports.updateAuxiliar = async (req, res) => {
  const { id_auxiliar } = req.params;
  const { nombre_auxiliar, numero_serie_aux, id_equipo } = req.body;

  try {
    // Validar campos obligatorios
    if (!nombre_auxiliar || !numero_serie_aux) {
      return res.status(400).json({ message: 'Nombre y número de serie son obligatorios.' });
    }

    // Buscar el auxiliar por ID y verificar que esté activo
    const auxiliar = await Auxiliar.findOne({
      where: { id_auxiliar, estadoActivo: 1 },
    });
    if (!auxiliar) {
      return res.status(404).json({ message: 'Auxiliar no encontrado o está inactivo.' });
    }

    // Si se proporciona id_equipo, verificar que exista y esté activo
    if (id_equipo) {
      const equipo = await Equipo.findOne({
        where: { id_equipos: id_equipo, estadoActivo: 1 },
      });
      if (!equipo) {
        return res.status(404).json({ message: 'El equipo proporcionado no existe o está inactivo.' });
      }
    }

    // Actualizar los campos del auxiliar
    auxiliar.nombre_auxiliar = nombre_auxiliar;
    auxiliar.numero_serie_aux = numero_serie_aux;
    auxiliar.id_equipo = id_equipo || null; // Asignar null si no se proporciona id_equipo
    await auxiliar.save();

    // Obtener el auxiliar actualizado con su equipo
    const updatedAuxiliarWithEquipo = await Auxiliar.findByPk(auxiliar.id_auxiliar, {
      include: {
        model: Equipo,
        as: 'equipo',
        attributes: ['id_equipos', 'tipoDispositivo', 'marca', 'modelo', 'estadoActivo'],
      },
    });

    res.status(200).json(updatedAuxiliarWithEquipo);
  } catch (error) {
    console.error('Error al actualizar auxiliar:', error);
    res.status(500).json({ message: 'Error al actualizar auxiliar.', error: error.message });
  }
};

/**
 * Reasignar un equipo a un auxiliar
 */
exports.reassignEquipo = async (req, res) => {
  try {
    const { id_auxiliar } = req.params;
    const { id_equipo } = req.body;

    // Buscar el auxiliar por ID y verificar que esté activo
    const auxiliar = await Auxiliar.findOne({
      where: { id_auxiliar, estadoActivo: 1 },
    });
    if (!auxiliar) {
      return res.status(404).json({ message: 'Auxiliar no encontrado o está inactivo.' });
    }

    // Si se proporciona id_equipo, verificar que exista y esté activo
    if (id_equipo) {
      const equipo = await Equipo.findOne({
        where: { id_equipos: id_equipo, estadoActivo: 1 },
      });
      if (!equipo) {
        return res.status(404).json({ message: 'El equipo proporcionado no existe o está inactivo.' });
      }
    }

    // Actualizar el id_equipo
    auxiliar.id_equipo = id_equipo || null; // `id_equipo` puede ser null
    await auxiliar.save();

    // Obtener el auxiliar actualizado con su equipo
    const updatedAuxiliarWithEquipo = await Auxiliar.findByPk(auxiliar.id_auxiliar, {
      include: {
        model: Equipo,
        as: 'equipo',
        attributes: ['id_equipos', 'tipoDispositivo', 'marca', 'modelo', 'estadoActivo'],
      },
    });

    res.status(200).json(updatedAuxiliarWithEquipo);
  } catch (error) {
    console.error('Error al reasignar equipo:', error);
    res.status(500).json({ message: 'Error al reasignar equipo.', error: error.message });
  }
};

/**
 * Desactivar (Soft Delete) un auxiliar
 */
exports.softDeleteAuxiliar = async (req, res) => {
  const { id_auxiliar } = req.params;

  try {
    // Buscar el auxiliar por ID y verificar que esté activo
    const auxiliar = await Auxiliar.findOne({
      where: { id_auxiliar, estadoActivo: 1 },
    });
    if (!auxiliar) {
      return res.status(404).json({ message: 'Auxiliar no encontrado o ya está inactivo.' });
    }

    // Actualizar estadoActivo a 0 (soft delete)
    auxiliar.estadoActivo = 0;
    await auxiliar.save();

    res.status(200).json({ message: 'Auxiliar desactivado exitosamente.' });
  } catch (error) {
    console.error('Error al desactivar auxiliar:', error);
    res.status(500).json({ message: 'Error al desactivar auxiliar.', error: error.message });
  }
};

/**
 * Reactivar un auxiliar previamente desactivado (Soft Restore)
 * Esta función es opcional y puede ser implementada si se requiere
 */
exports.restoreAuxiliar = async (req, res) => {
  const { id_auxiliar } = req.params;

  try {
    // Buscar el auxiliar por ID y verificar que esté inactivo
    const auxiliar = await Auxiliar.findOne({
      where: { id_auxiliar, estadoActivo: 0 },
    });
    if (!auxiliar) {
      return res.status(404).json({ message: 'Auxiliar no encontrado o ya está activo.' });
    }

    // Verificar si el equipo asociado está activo (si se asigna un equipo)
    if (auxiliar.id_equipo) {
      const equipo = await Equipo.findOne({
        where: { id_equipos: auxiliar.id_equipo, estadoActivo: 1 },
      });
      if (!equipo) {
        return res.status(400).json({ message: 'El equipo asociado no existe o está inactivo. Reactivación fallida.' });
      }
    }

    // Reactivar el auxiliar
    auxiliar.estadoActivo = 1;
    await auxiliar.save();

    // Obtener el auxiliar reactivado con su equipo
    const reactivatedAuxiliar = await Auxiliar.findByPk(auxiliar.id_auxiliar, {
      include: {
        model: Equipo,
        as: 'equipo',
        attributes: ['id_equipos', 'tipoDispositivo', 'marca', 'modelo', 'estadoActivo'],
      },
    });

    res.status(200).json({ message: 'Auxiliar reactivado exitosamente.', auxiliar: reactivatedAuxiliar });
  } catch (error) {
    console.error('Error al reactivar auxiliar:', error);
    res.status(500).json({ message: 'Error al reactivar auxiliar.', error: error.message });
  }
};
