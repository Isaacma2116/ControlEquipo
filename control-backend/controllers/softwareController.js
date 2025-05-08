// controllers/softwareController.js

const {
  Software,
  SoftwareEquipos,
  SoftwareLicencias,
  SoftwareHistorial,
  SoftwareEquiposHistorial,
  SoftwareLicenciasHistorial,
  Equipo,
} = require('../models/associations');

const { Op } = require('sequelize');
const levenshtein = require('fast-levenshtein');

// Función auxiliar para encontrar software por ID con las asociaciones necesarias
const findSoftwareById = async (id) => {
  return await Software.findByPk(id, {
    include: [
      {
        model: SoftwareEquipos,
        as: 'equiposAsociados',
        include: [
          {
            model: SoftwareEquiposHistorial,
            as: 'historial',
          },
        ],
      },
      {
        model: SoftwareLicencias,
        as: 'licencias',
        include: [
          {
            model: SoftwareLicenciasHistorial,
            as: 'historial',
          },
        ],
      },
      {
        model: SoftwareHistorial,
        as: 'historial',
      },
    ],
  });
};

// Obtener todos los nombres de software (para sugerencias, etc.)
exports.getAllSoftwareNames = async (req, res) => {
  try {
    const softwareNames = await Software.findAll({
      attributes: ['nombre'],
      where: { estadoActivo: 1 }, // Solo softwares activos
    });
    const names = softwareNames.map((s) => s.nombre.trim());
    res.status(200).json(names);
  } catch (error) {
    console.error('Error al obtener los nombres de software:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Agrupar nombres de software similares
const groupSimilarNames = (softwareList) => {
  const groups = [];
  softwareList.forEach((software) => {
    let foundGroup = false;
    for (const group of groups) {
      if (levenshtein.get(software.nombre, group[0].nombre) <= 2) {
        group.push(software);
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) {
      groups.push([software]);
    }
  });
  return groups;
};

// Endpoint para agrupar nombres de software similares con maxDispositivos
exports.groupSoftwareNames = async (req, res) => {
  try {
    const softwareNames = await Software.findAll({
      attributes: ['nombre', 'maxDispositivos'],
      where: { estadoActivo: 1 },
    });
    const names = softwareNames.map((s) => ({
      nombre: s.nombre.trim(),
      maxDispositivos: s.maxDispositivos,
    }));
    const grouped = groupSimilarNames(names);
    res.status(200).json(grouped);
  } catch (error) {
    console.error('Error al agrupar nombres de software:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Crear un nuevo software
exports.createSoftware = async (req, res) => {
  const t = await Software.sequelize.transaction();
  try {
    console.log('Datos recibidos en createSoftware:', JSON.stringify(req.body, null, 2));

    const {
      nombre,
      version,
      fechaAdquisicion,
      fechaCaducidad,
      tipoLicencia,
      estado,
      equipos_asociados = [],
      licenciaCaducada,
      maxDispositivos,
      softwareLicencias = [],
    } = req.body;

    // Validaciones básicas
    if (!nombre || !version) {
      await t.rollback();
      return res.status(400).json({ message: 'Nombre y versión son requeridos.' });
    }
    if (!['mensual', 'anual', 'vitalicia'].includes(tipoLicencia)) {
      await t.rollback();
      return res.status(400).json({ message: 'Tipo de licencia no válido.' });
    }
    if (!['activo', 'sin uso', 'vencido', 'vencido con equipo'].includes(estado)) {
      await t.rollback();
      return res.status(400).json({ message: 'Estado no válido.' });
    }

    const maxLicencias = parseInt(maxDispositivos, 10);
    if (isNaN(maxLicencias) || maxLicencias < 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: 'El número máximo de dispositivos debe ser un número válido mayor o igual a 0.' });
    }

    // Validar equipos si están presentes
    if (equipos_asociados.length > 0) {
      for (const equipoId of equipos_asociados) {
        const exists = await Equipo.findByPk(equipoId, { transaction: t });
        if (!exists) {
          await t.rollback();
          return res.status(400).json({ message: `El equipo con ID ${equipoId} no existe.` });
        }
      }
    }

    // Crear nuevo software
    const newSoftware = await Software.create(
      {
        nombre: nombre.trim(),
        version: version.trim(),
        fecha_adquisicion: fechaAdquisicion || null,
        fecha_caducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad || null,
        tipoLicencia,
        estado,
        licenciaCaducada: licenciaCaducada ? 1 : 0,
        maxDispositivos: maxLicencias,
        estadoActivo: 1,
      },
      { transaction: t }
    );

    console.log(`Software creado con ID ${newSoftware.id_software}`);

    // Crear SoftwareLicencias y asociar Equipos
    for (const licencia of softwareLicencias) {
      // Validar campos requeridos si la licencia está en uso
      const tieneEquipos = licencia.equipos_asociados && licencia.equipos_asociados.length > 0;
      if (tieneEquipos) {
        if (
          (!licencia.claveLicencia || licencia.claveLicencia.trim() === '') &&
          (!licencia.correoAsociado || licencia.correoAsociado.trim() === '')
        ) {
          await t.rollback();
          return res.status(400).json({
            message: 'Cada licencia en uso debe tener al menos una "Clave de Licencia" o "Correo Asociado".',
          });
        }
      }

      // Crear la licencia
      const createdLicencia = await SoftwareLicencias.create(
        {
          id_software: newSoftware.id_software,
          claveLicencia: licencia.claveLicencia && licencia.claveLicencia.trim() !== '' ? licencia.claveLicencia.trim() : null,
          correoAsociado: licencia.correoAsociado && licencia.correoAsociado.trim() !== '' ? licencia.correoAsociado.trim() : null,
          contrasenaCorreo: licencia.contrasenaCorreo && licencia.contrasenaCorreo.trim() !== '' ? licencia.contrasenaCorreo.trim() : null,
          compartida: licencia.compartida || false,
          estado_renovacion: licencia.estadoRenovacion || 'activa', // Asignar valor predeterminado si no se proporciona
        },
        { transaction: t }
      );

      console.log(
        `Licencia creada con ID ${createdLicencia.id_licencia} para software ID ${newSoftware.id_software}`
      );

      // Crear historial para la licencia (Acción 'insertar')
      await SoftwareLicenciasHistorial.create(
        {
          id_licencia_original: createdLicencia.id_licencia,
          id_software: newSoftware.id_software,
          claveLicencia: createdLicencia.claveLicencia,
          correoAsociado: createdLicencia.correoAsociado,
          contrasenaCorreo: createdLicencia.contrasenaCorreo,
          compartida: createdLicencia.compartida,
          estado_renovacion: createdLicencia.estado_renovacion,
          fecha_operacion: new Date(),
          accion: 'insertar',
        },
        { transaction: t }
      );

      // Asociar equipos a esa licencia si están presentes
      if (tieneEquipos) {
        // Validar equipos de la licencia
        for (const equipoId of licencia.equipos_asociados) {
          const exists = await Equipo.findByPk(equipoId, { transaction: t });
          if (!exists) {
            await t.rollback();
            return res.status(400).json({
              message: `El equipo con ID ${equipoId} no existe en la licencia ${licencia.claveLicencia}.`,
            });
          }
        }

        const softwareEquiposData = licencia.equipos_asociados.map((id_equipo) => ({
          id_software: newSoftware.id_software,
          id_licencia: createdLicencia.id_licencia,
          id_equipos: id_equipo,
          fechaAsignacion: new Date(),
          estado_asignacion: 'activo',
        }));

        console.log(
          `Asociando equipos a la licencia ${createdLicencia.id_licencia}:`,
          softwareEquiposData
        );

        const createdSoftwareEquipos = await SoftwareEquipos.bulkCreate(softwareEquiposData, { transaction: t });

        // Crear historial para cada SoftwareEquipos creado (Acción 'insertar')
        for (const se of createdSoftwareEquipos) {
          await SoftwareEquiposHistorial.create(
            {
              id_software_equipo: se.id, // Asumiendo que 'id' es el PK de SoftwareEquipos
              id_software: se.id_software,
              id_equipos: se.id_equipos.toString(),
              id_licencia: se.id_licencia,
              fechaAsignacion: se.fechaAsignacion,
              estado_asignacion: se.estado_asignacion,
              fecha_operacion: new Date(),
              accion: 'insertar',
            },
            { transaction: t }
          );
        }
      } else {
        // Licencia sin uso: no asociar equipos
        console.log(`Licencia ${createdLicencia.id_licencia} marcada como sin uso.`);
      }
    }

    await t.commit();
    console.log('Transacción completada exitosamente.');
    res.status(201).json(newSoftware);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear el software:', error);
    res.status(400).json({ message: 'Error al enviar los datos.', error: error.message });
  }
};

// Obtener todos los softwares con paginación y filtrar activos
exports.getSoftwares = async (req, res) => {
  try {
    const { page, limit } = req.query;
    let options = {
      where: { estadoActivo: 1 }, // Solo activos
      include: [
        {
          model: SoftwareEquipos,
          as: 'equiposAsociados',
          attributes: ['id_equipos', 'fechaAsignacion', 'estado_asignacion', 'id_licencia'],
        },
        {
          model: SoftwareLicencias,
          as: 'licencias',
          attributes: [
            'id_licencia',
            'claveLicencia',
            'correoAsociado',
            'contrasenaCorreo',
            'compartida',
            'estado_renovacion',
          ],
        },
      ],
    };

    if (page && limit) {
      const offset = (page - 1) * limit;
      options = { ...options, limit: parseInt(limit), offset: parseInt(offset) };
    }

    const softwares = await Software.findAndCountAll(options);
    console.log(softwares.rows); // Para debug

    if (page && limit) {
      res.status(200).json({
        totalItems: softwares.count,
        totalPages: Math.ceil(softwares.count / limit),
        currentPage: parseInt(page),
        data: softwares.rows,
      });
    } else {
      res.status(200).json(softwares.rows || softwares);
    }
  } catch (error) {
    console.error('Error al obtener los softwares:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Obtener un software por su ID
exports.getSoftware = async (req, res) => {
  try {
    const software = await findSoftwareById(req.params.id);
    if (!software || software.estadoActivo !== 1) {
      return res.status(404).json({ message: 'Software no encontrado' });
    }
    res.status(200).json(software);
  } catch (error) {
    console.error('Error al obtener el software:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Obtener softwares asociados a un equipo
exports.getSoftwaresByEquipo = async (req, res) => {
  try {
    const { idEquipo } = req.params;
    const softwareEquipos = await SoftwareEquipos.findAll({
      where: { id_equipos: idEquipo },
      include: [
        {
          model: Software,
          as: 'software',
          where: { estadoActivo: 1 },
        },
      ],
    });

    if (softwareEquipos.length === 0) {
      return res.status(200).json({ message: 'No hay softwares asociados a este equipo.', data: [] });
    }

    const softwareData = softwareEquipos.map((se) => se.software);
    res.status(200).json(softwareData);
  } catch (error) {
    console.error('Error al obtener los softwares por equipo:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Buscar nombres de software que coincidan con un término de búsqueda
exports.getSoftwareNames = async (req, res) => {
  try {
    const { query } = req.query;
    let condition = query
      ? { nombre: { [Op.like]: `%${query}%` }, estadoActivo: 1 }
      : { estadoActivo: 1 };

    const softwareNames = await Software.findAll({
      where: condition,
      attributes: ['nombre'],
    });
    const names = softwareNames.map((software) => software.nombre.trim());

    if (names.length === 0) {
      return res.status(200).json({ message: 'No se encontraron coincidencias', data: [] });
    }

    res.status(200).json(names);
  } catch (error) {
    console.error('Error al obtener los nombres de los softwares:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Obtener el número de dispositivos asociados a un software por su ID
exports.getEquiposUsados = async (req, res) => {
  try {
    const { id } = req.params;
    const software = await Software.findByPk(id);
    if (!software || software.estadoActivo !== 1) {
      return res.status(404).json({ message: 'Software no encontrado' });
    }

    const equiposUsados = await SoftwareEquipos.count({
      where: { id_software: software.id_software },
    });

    res.status(200).json({ count: equiposUsados });
  } catch (error) {
    console.error('Error al obtener los equipos usados:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Actualizar un software por su ID (con registro en SoftwareHistorial)
exports.updateSoftware = async (req, res) => {
  const t = await Software.sequelize.transaction();
  try {
    const { id } = req.params;
    const software = await Software.findByPk(id, { transaction: t });
    if (!software || software.estadoActivo !== 1) {
      await t.rollback();
      return res.status(404).json({ message: 'Software no encontrado' });
    }

    console.log('Payload recibido en updateSoftware:', JSON.stringify(req.body, null, 2));

    // Datos de actualización
    const softwareData = {
      nombre: req.body.nombre ? req.body.nombre.trim() : software.nombre,
      version: req.body.version ? req.body.version.trim() : software.version,
      fecha_adquisicion: req.body.fechaAdquisicion || null,
      // Si la licencia es vitalicia, entonces fecha_caducidad será null
      fecha_caducidad:
        req.body.tipoLicencia === 'vitalicia' ? null : req.body.fechaCaducidad || null,
      tipoLicencia: req.body.tipoLicencia || software.tipoLicencia,
      estado: req.body.estado || software.estado,
      licenciaCaducada: req.body.licenciaCaducada ? 1 : 0,
      maxDispositivos:
        req.body.maxDispositivos !== undefined
          ? parseInt(req.body.maxDispositivos, 10)
          : software.maxDispositivos,
      estadoActivo:
        req.body.estadoActivo !== undefined ? req.body.estadoActivo : software.estadoActivo,
    };

    // Validaciones finales
    if (!softwareData.nombre || !softwareData.version) {
      await t.rollback();
      return res.status(400).json({ message: 'Nombre y versión son requeridos.' });
    }
    if (!['mensual', 'anual', 'vitalicia'].includes(softwareData.tipoLicencia)) {
      await t.rollback();
      return res.status(400).json({ message: 'Tipo de licencia no válido.' });
    }
    if (
      ![
        'activo',
        'sin uso',
        'vencido',
        'vencido con equipo',
        'inactivo',
      ].includes(softwareData.estado)
    ) {
      await t.rollback();
      return res.status(400).json({ message: 'Estado no válido.' });
    }

    // Actualizar software principal
    await software.update(softwareData, { transaction: t });

    // Insertar en SoftwareHistorial con accion 'editar'
    await SoftwareHistorial.create(
      {
        id_software: software.id_software,
        nombre: softwareData.nombre,
        version: softwareData.version,
        fecha_adquisicion: softwareData.fecha_adquisicion,
        fecha_caducidad: softwareData.fecha_caducidad, // Será null si es vitalicia
        tipoLicencia: softwareData.tipoLicencia,
        estado: softwareData.estado,
        licenciaCaducada: !!softwareData.licenciaCaducada,
        maxDispositivos: softwareData.maxDispositivos,
        accion: 'editar',
        fecha_operacion: new Date(),
      },
      { transaction: t }
    );

    // Actualizar relaciones (equipos asociados)
    if (Array.isArray(req.body.equipos_asociados)) {
      // Validar equipos
      const equiposValidos = await Equipo.findAll({
        where: { id_equipos: req.body.equipos_asociados },
        transaction: t,
      });
      if (equiposValidos.length !== req.body.equipos_asociados.length) {
        await t.rollback();
        return res.status(400).json({ message: 'Algunos IDs de equipos no existen.' });
      }

      // Obtener los equipos actuales antes de eliminarlos para registrar el historial
      const equiposAnteriores = await SoftwareEquipos.findAll({
        where: { id_software: id },
        transaction: t,
      });

      // Eliminar asociaciones actuales
      await SoftwareEquipos.destroy({ where: { id_software: id }, transaction: t });

      // Crear nuevas asociaciones
      const equiposData = req.body.equipos_asociados.map((id_equipo) => ({
        id_software: id,
        id_equipos: id_equipo,
        id_licencia: null,
        fechaAsignacion: new Date(),
        estado_asignacion: 'activo',
      }));

      console.log('Datos de equipos a actualizar:', equiposData);
      const createdSoftwareEquipos = await SoftwareEquipos.bulkCreate(equiposData, { transaction: t });

      // Crear historiales para los equipos eliminados (Acción 'borrar')
      for (const equipoAnterior of equiposAnteriores) {
        await SoftwareEquiposHistorial.create(
          {
            id_software_equipo: equipoAnterior.id, // Asumiendo que 'id' es el PK de SoftwareEquipos
            id_software: equipoAnterior.id_software,
            id_equipos: equipoAnterior.id_equipos.toString(),
            id_licencia: equipoAnterior.id_licencia,
            fechaAsignacion: equipoAnterior.fechaAsignacion,
            estado_asignacion: equipoAnterior.estado_asignacion,
            fecha_operacion: new Date(),
            accion: 'borrar',
          },
          { transaction: t }
        );
      }

      // Crear historiales para los nuevos equipos asociados (Acción 'editar')
      for (const se of createdSoftwareEquipos) {
        await SoftwareEquiposHistorial.create(
          {
            id_software_equipo: se.id,
            id_software: se.id_software,
            id_equipos: se.id_equipos.toString(),
            id_licencia: se.id_licencia,
            fechaAsignacion: se.fechaAsignacion,
            estado_asignacion: se.estado_asignacion,
            fecha_operacion: new Date(),
            accion: 'editar',
          },
          { transaction: t }
        );
      }
    }

    // Actualizar relaciones (licencias asociadas)
    if (Array.isArray(req.body.softwareLicencias)) {
      // Eliminar licencias actuales y sus asociaciones de equipos
      const licenciasAnteriores = await SoftwareLicencias.findAll({
        where: { id_software: id },
        transaction: t,
      });

      await SoftwareLicencias.destroy({ where: { id_software: id }, transaction: t });
      await SoftwareEquipos.destroy({ where: { id_software: id }, transaction: t });

      // Registrar historial de licencias eliminadas (Acción 'borrar')
      for (const licAnterior of licenciasAnteriores) {
        await SoftwareLicenciasHistorial.create(
          {
            id_licencia_original: licAnterior.id_licencia,
            id_software: id,
            claveLicencia: licAnterior.claveLicencia,
            correoAsociado: licAnterior.correoAsociado,
            contrasenaCorreo: licAnterior.contrasenaCorreo,
            compartida: licAnterior.compartida,
            estado_renovacion: licAnterior.estadoRenovacion || 'activa', // Asignar valor predeterminado si no se proporciona
            fecha_operacion: new Date(),
            accion: 'borrar',
          },
          { transaction: t }
        );
      }

      // Crear nuevas licencias
      const validLicencias = req.body.softwareLicencias.map((licencia) => ({
        id_software: id,
        claveLicencia: licencia.claveLicencia ? licencia.claveLicencia.trim() : null,
        correoAsociado: licencia.correoAsociado ? licencia.correoAsociado.trim() : null,
        contrasenaCorreo: licencia.contrasenaCorreo ? licencia.contrasenaCorreo.trim() : null,
        compartida: !!licencia.compartida,
        estado_renovacion: licencia.estadoRenovacion || 'activa', // Asignar valor predeterminado si no se proporciona
      }));

      console.log('Datos de licencias a actualizar:', validLicencias);

      // Validar cada licencia antes de crearla
      for (const licencia of validLicencias) {
        // Si la licencia está en uso, debe tener al menos claveLicencia o correoAsociado
        const tieneEquipos = licencia.equipos_asociados && licencia.equipos_asociados.length > 0;
        if (tieneEquipos) {
          if (
            (!licencia.claveLicencia || licencia.claveLicencia.trim() === '') &&
            (!licencia.correoAsociado || licencia.correoAsociado.trim() === '')
          ) {
            await t.rollback();
            return res.status(400).json({
              message: 'Cada licencia en uso debe tener al menos una "Clave de Licencia" o "Correo Asociado".',
            });
          }
        }
      }

      if (validLicencias.length > 0) {
        const createdLicencias = await SoftwareLicencias.bulkCreate(validLicencias, {
          transaction: t,
          returning: true,
        });

        for (let i = 0; i < createdLicencias.length; i++) {
          const licencia = createdLicencias[i];
          const equipos_asociados = req.body.softwareLicencias[i].equipos_asociados || [];

          // Crear historial para la licencia (Acción 'editar')
          await SoftwareLicenciasHistorial.create(
            {
              id_licencia_original: licencia.id_licencia,
              id_software: id,
              claveLicencia: licencia.claveLicencia,
              correoAsociado: licencia.correoAsociado,
              contrasenaCorreo: licencia.contrasenaCorreo,
              compartida: licencia.compartida,
              estado_renovacion: licencia.estado_renovacion,
              fecha_operacion: new Date(),
              accion: 'editar',
            },
            { transaction: t }
          );

          // Crear historiales para los equipos eliminados anteriormente y asociados
          const equiposAnteriores = await SoftwareEquipos.findAll({
            where: { id_licencia: licencia.id_licencia },
            transaction: t,
          });

          for (const equipoAnterior of equiposAnteriores) {
            await SoftwareEquiposHistorial.create(
              {
                id_software_equipo: equipoAnterior.id, // Asumiendo que 'id' es el PK de SoftwareEquipos
                id_software: equipoAnterior.id_software,
                id_equipos: equipoAnterior.id_equipos.toString(),
                id_licencia: equipoAnterior.id_licencia,
                fechaAsignacion: equipoAnterior.fechaAsignacion,
                estado_asignacion: equipoAnterior.estado_asignacion,
                fecha_operacion: new Date(),
                accion: 'borrar',
              },
              { transaction: t }
            );
          }

          // Crear nuevas asociaciones de equipos y sus historiales
          if (equipos_asociados.length > 0) {
            const softwareEquiposData = equipos_asociados.map((id_equipo) => ({
              id_software: id,
              id_licencia: licencia.id_licencia,
              id_equipos: id_equipo,
              fechaAsignacion: new Date(),
              estado_asignacion: 'activo',
            }));

            console.log(
              `Asociando equipos a la licencia ${licencia.id_licencia}:`,
              softwareEquiposData
            );

            const createdSoftwareEquipos = await SoftwareEquipos.bulkCreate(softwareEquiposData, { transaction: t });

            // Crear historial para cada SoftwareEquipos creado (Acción 'editar')
            for (const se of createdSoftwareEquipos) {
              await SoftwareEquiposHistorial.create(
                {
                  id_software_equipo: se.id,
                  id_software: se.id_software,
                  id_equipos: se.id_equipos.toString(),
                  id_licencia: se.id_licencia,
                  fechaAsignacion: se.fechaAsignacion,
                  estado_asignacion: se.estado_asignacion,
                  fecha_operacion: new Date(),
                  accion: 'editar',
                },
                { transaction: t }
              );
            }
          }
        }
      }
    }

    await t.commit();
    console.log('Transacción completada exitosamente.');
    res.status(200).json({ message: 'Software actualizado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar el software:', error);
    res.status(500).json({ message: 'Error al actualizar el software', error: error.message });
  }
};

// Eliminar un software por su ID (Soft Delete)
exports.deleteSoftware = async (req, res) => {
  const t = await Software.sequelize.transaction();
  try {
    const { id } = req.params;
    const software = await findSoftwareById(id);
    if (!software || software.estadoActivo !== 1) {
      await t.rollback();
      return res.status(404).json({ message: 'Software no encontrado' });
    }

    // Marcar como inactivo
    await software.update({ estado: 'inactivo', estadoActivo: 0 }, { transaction: t });

    // Insertar en SoftwareHistorial con accion 'borrar'
    await SoftwareHistorial.create(
      {
        id_software: software.id_software,
        nombre: software.nombre,
        version: software.version,
        fecha_adquisicion: software.fecha_adquisicion,
        fecha_caducidad: software.fecha_caducidad,
        tipoLicencia: software.tipoLicencia,
        estado: 'inactivo',
        licenciaCaducada: software.licenciaCaducada,
        maxDispositivos: software.maxDispositivos,
        accion: 'borrar',
        fecha_operacion: new Date(),
      },
      { transaction: t }
    );

    // Registrar el borrado de equipos asociados en SoftwareEquiposHistorial
    const equiposAsociados = await SoftwareEquipos.findAll({
      where: { id_software: id },
      transaction: t,
    });

    for (const equipo of equiposAsociados) {
      await SoftwareEquiposHistorial.create(
        {
          id_software_equipo: equipo.id, // Asumiendo que 'id' es el PK de SoftwareEquipos
          id_software: id,
          id_equipos: equipo.id_equipos.toString(),
          id_licencia: equipo.id_licencia,
          fechaAsignacion: equipo.fechaAsignacion,
          estado_asignacion: equipo.estado_asignacion,
          fecha_operacion: new Date(),
          accion: 'borrar',
        },
        { transaction: t }
      );
    }

    // Registrar el borrado de licencias asociadas en SoftwareLicenciasHistorial
    const licenciasAsociadas = await SoftwareLicencias.findAll({
      where: { id_software: id },
      transaction: t,
    });

    for (const licencia of licenciasAsociadas) {
      await SoftwareLicenciasHistorial.create(
        {
          id_licencia_original: licencia.id_licencia,
          id_software: id,
          claveLicencia: licencia.claveLicencia,
          correoAsociado: licencia.correoAsociado,
          contrasenaCorreo: licencia.contrasenaCorreo,
          compartida: licencia.compartida,
          estado_renovacion: licencia.estadoRenovacion || 'activa', // Asignar valor predeterminado si no se proporciona
          fecha_operacion: new Date(),
          accion: 'borrar',
        },
        { transaction: t }
      );
    }

    // Opcional: Desasociar equipos relacionados
    await SoftwareEquipos.destroy({ where: { id_software: id }, transaction: t });

    // Opcional: Desasociar licencias relacionadas
    await SoftwareLicencias.destroy({ where: { id_software: id }, transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Software marcado como inactivo exitosamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar el software:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Obtener software próximo a caducar o caducado
exports.getExpiringSoftware = async (req, res) => {
  try {
    const today = new Date();
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 30);

    const expiringSoftware = await Software.findAll({
      where: {
        fecha_caducidad: {
          [Op.not]: null,
          [Op.lte]: soonDate,
        },
        estadoActivo: 1,
      },
    });

    const expired = [];
    const expiringSoon = [];

    expiringSoftware.forEach((software) => {
      const expiryDate = new Date(software.fecha_caducidad);
      if (expiryDate < today) {
        expired.push(software);
      } else {
        expiringSoon.push(software);
      }
    });

    res.status(200).json({
      expired: expired || [],
      expiringSoon: expiringSoon || [],
    });
  } catch (error) {
    console.error('Error al obtener software próximo a caducar o caducado:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Obtener el historial completo del software por su ID
exports.getSoftwareHistorial = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del software desde los parámetros de la ruta

    // Verificar si el software existe y está activo
    const software = await Software.findByPk(id, {
      include: [
        { model: SoftwareLicencias, as: 'licencias' },
        { model: SoftwareEquipos, as: 'equiposAsociados' },
      ],
    });

    if (!software || software.estadoActivo !== 1) {
      return res.status(404).json({ message: 'Software no encontrado' });
    }

    // Obtener historial general del software
    const softwareHistorial = await SoftwareHistorial.findAll({
      where: { id_software: id },
      order: [['fecha_operacion', 'DESC']],
    });

    // Obtener historial de licencias
    const licenciasHistorial = await SoftwareLicenciasHistorial.findAll({
      where: { id_licencia_original: { [Op.in]: software.licencias.map((lic) => lic.id_licencia) } },
      order: [['fecha_operacion', 'DESC']],
    });

    // Obtener historial de equipos asociados
    const equiposHistorial = await SoftwareEquiposHistorial.findAll({
      where: { id_software_equipo: { [Op.in]: software.equiposAsociados.map((eq) => eq.id) } },
      order: [['fecha_operacion', 'DESC']],
    });

    res.status(200).json({
      softwareHistorial,
      licenciasHistorial,
      equiposHistorial,
    });
  } catch (error) {
    console.error('Error al obtener el historial del software:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};
