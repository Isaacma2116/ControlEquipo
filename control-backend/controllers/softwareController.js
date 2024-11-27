const Software = require('../models/Software');
const SoftwareEquipos = require('../models/SoftwareEquipos');
const SoftwareLicencias = require('../models/SoftwareLicencias');
const SoftwareHistorial = require('../models/SoftwareHistorial'); // Agregado
const SoftwareEquiposHistorial = require('../models/SoftwareEquiposHistorial'); // Agregado
const SoftwareLicenciasHistorial = require('../models/SoftwareLicenciasHistorial'); // Agregado
const Equipo = require('../models/Equipo');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const levenshtein = require('fast-levenshtein');


// Función auxiliar para encontrar software por ID con las asociaciones necesarias
const findSoftwareById = async (id) => {
    return await Software.findByPk(id, {
        include: [
            { model: SoftwareEquipos, as: 'equiposAsociados' },
            { model: SoftwareLicencias, as: 'licencias' },
        ],
    });
};

// Obtener todos los nombres de software para sugerencias
exports.getAllSoftwareNames = async (req, res) => {
    try {
        const softwareNames = await Software.findAll({
            attributes: ['nombre']
        });
        const names = softwareNames.map(s => s.nombre.trim());
        res.status(200).json(names);
    } catch (error) {
        console.error('Error al obtener los nombres de software:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Agrupar nombres de software similares con maxDispositivos
const groupSimilarNames = (softwareList) => {
    const groups = [];
    softwareList.forEach((software) => {
        let foundGroup = false;
        for (const group of groups) {
            if (levenshtein.get(software.nombre, group[0].nombre) <= 2) { // Tolerancia de 2 caracteres
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
        });
        const names = softwareNames.map(s => ({
            nombre: s.nombre.trim(),
            maxDispositivos: s.maxDispositivos
        }));
        const grouped = groupSimilarNames(names);
        res.status(200).json(grouped);
    } catch (error) {
        console.error('Error al agrupar nombres de software:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Crear un nuevo software con transacciones y validaciones
exports.createSoftware = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        console.log("Datos recibidos en createSoftware:", JSON.stringify(req.body, null, 2));
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

        // Validaciones básicas para campos requeridos y valores válidos
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
            return res.status(400).json({ message: 'El número máximo de dispositivos debe ser un número válido mayor o igual a 0.' });
        }

        // Validar que todos los IDs de equipos en equipos_asociados existan en la base de datos
        for (const equipoId of equipos_asociados) {
            const exists = await Equipo.findByPk(equipoId);
            if (!exists) {
                await t.rollback();
                return res.status(400).json({ message: `El equipo con ID ${equipoId} no existe.` });
            }
        }

        // Crear el nuevo software
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
            },
            { transaction: t }
        );

        // Asociar equipos a software, si existen
        if (equipos_asociados.length > 0) {
            const softwareEquiposData = equipos_asociados.map((id_equipos) => ({
                id_software: newSoftware.id_software,
                id_equipos,
                fechaAsignacion: new Date(),
            }));
            await SoftwareEquipos.bulkCreate(softwareEquiposData, { transaction: t });
        }

        // Validar y guardar softwareLicencias solo si hay datos válidos
        const validSoftwareLicencias = softwareLicencias.filter((licencia) => {
            return licencia.claveLicencia || licencia.correoAsociado || licencia.contrasenaCorreo || Array.isArray(licencia.id_equipos);
        });

        if (validSoftwareLicencias.length > 0) {
            for (const licencia of validSoftwareLicencias) {
                console.log("Validando licencia:", licencia);
                if (licencia.id_equipos && !Array.isArray(licencia.id_equipos)) {
                    await t.rollback();
                    return res.status(400).json({ message: `El campo id_equipos debe ser un array o null en la licencia ${licencia.claveLicencia}.` });
                }
                if (Array.isArray(licencia.id_equipos)) {
                    for (const equipoId of licencia.id_equipos) {
                        const exists = await Equipo.findByPk(equipoId);
                        if (!exists) {
                            await t.rollback();
                            return res.status(400).json({ message: `El equipo con ID ${equipoId} no existe en la licencia ${licencia.claveLicencia}.` });
                        }
                    }
                }
            }
            const softwareLicenciasData = validSoftwareLicencias.map((licencia) => ({
                id_software: newSoftware.id_software,
                claveLicencia: licencia.claveLicencia || null,
                correoAsociado: licencia.correoAsociado || null,
                contrasenaCorreo: licencia.contrasenaCorreo || null,
                compartida: licencia.compartida || false,
            }));
            await SoftwareLicencias.bulkCreate(softwareLicenciasData, { transaction: t });
        }

        await t.commit();
        res.status(201).json(newSoftware);
    } catch (error) {
        await t.rollback();
        console.error('Error al crear el software:', error);
        res.status(400).json({ message: 'Error al enviar los datos.', error });
    }
};

// Obtener todos los softwares, con los equipos y licencias asociados
exports.getSoftwares = async (req, res) => {
    try {
        const { page, limit } = req.query;
        let options = {
            include: [
                {
                    model: SoftwareEquipos,
                    as: 'equiposAsociados',
                    attributes: ['id_equipos', 'fechaAsignacion', 'estado_asignacion'],
                },
                {
                    model: SoftwareLicencias,
                    as: 'licencias',
                    attributes: ['claveLicencia', 'correoAsociado', 'contrasenaCorreo', 'compartida', 'estado_renovacion'],
                },
            ],
        };

        if (page && limit) {
            const offset = (page - 1) * limit;
            options = { ...options, limit: parseInt(limit), offset: parseInt(offset) };
        }

        const softwares = await Software.findAndCountAll(options);

        // Verificación en consola para ver los datos obtenidos
        console.log(softwares.rows);  // Aquí puedes ver si los equipos y licencias están correctamente incluidos

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
        if (!software) {
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
            include: [{ model: Software, as: 'software' }],
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
        let condition = query ? { nombre: { [Op.like]: `%${query}%` } } : {};
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
        const { idSoftware } = req.params;
        const software = await Software.findByPk(idSoftware);
        if (!software) {
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

// Actualizar un software por su ID
exports.updateSoftware = async (req, res) => {
    const t = await sequelize.transaction(); // Iniciar transacción
    try {
        const { id } = req.params;

        // Verificar si el software existe
        const software = await Software.findByPk(id, { transaction: t });
        if (!software) {
            await t.rollback();
            return res.status(404).json({ message: 'Software no encontrado' });
        }

        // Guardar estado actual del software en el historial
        await SoftwareHistorial.create(
            {
                ...software.toJSON(),
                accion: 'editar',
                fecha_operacion: new Date(),
            },
            { transaction: t }
        );

        // Guardar relaciones actuales (equipos asociados) en el historial
        const equiposAsociados = await SoftwareEquipos.findAll({ where: { id_software: id }, transaction: t });

        if (equiposAsociados.length === 0) {
            console.log('No hay equipos asociados para este software.');
        } else {
            for (const equipo of equiposAsociados) {
                await SoftwareEquiposHistorial.create(
                    {
                        id: equipo.id,
                        id_software: equipo.id_software,
                        id_equipos: equipo.id_equipos,
                        fechaAsignacion: equipo.fechaAsignacion || new Date(), // Proporcionar fecha si está nula
                        estado_asignacion: equipo.estado_asignacion || 'activo', // Asegúrate de usar un valor válido
                        accion: 'editar',
                        fecha_operacion: new Date(),
                    },
                    { transaction: t }
                );
            }
        }
        

        // Guardar relaciones actuales (licencias asociadas) en el historial
        const licenciasAsociadas = await SoftwareLicencias.findAll({ where: { id_software: id }, transaction: t });

for (const licencia of licenciasAsociadas) {
    await SoftwareLicenciasHistorial.create(
        {
            id_licencia: licencia.id_licencia,
            id_software: licencia.id_software,
            claveLicencia: licencia.claveLicencia,
            correoAsociado: licencia.correoAsociado,
            contrasenaCorreo: licencia.contrasenaCorreo,
            compartida: licencia.compartida,
            estado_renovacion: licencia.estado_renovacion || 'activa', // Establecer un valor predeterminado si es null
            accion: 'editar',
            fecha_operacion: new Date(),
        },
        { transaction: t }
    );
}


        // Preparar datos de actualización para el software
        const softwareData = {
            nombre: req.body.nombre || software.nombre,
            version: req.body.version || software.version,
            fecha_adquisicion: req.body.fechaAdquisicion || null,
            fecha_caducidad: req.body.fechaCaducidad || null,
            tipoLicencia: req.body.tipoLicencia || software.tipoLicencia,
            estado: req.body.estado || software.estado,
            licenciaCaducada: req.body.licenciaCaducada ? 1 : 0,
            maxDispositivos: req.body.maxDispositivos || software.maxDispositivos,
        };

        // Actualizar los datos del software
        await software.update(softwareData, { transaction: t });

        // Actualizar relaciones (equipos asociados)
        if (Array.isArray(req.body.equipos_asociados) && req.body.equipos_asociados.length > 0) {
            for (const equipoId of req.body.equipos_asociados) {
                const exists = await Equipo.findByPk(equipoId);
                if (!exists) {
                    await t.rollback();
                    return res.status(400).json({ message: `El equipo con ID ${equipoId} no existe.` });
                }
            }

            const equiposData = req.body.equipos_asociados.map((id_equipos) => ({
                id_software: id,
                id_equipos,
                fechaAsignacion: new Date(),
            }));

            // Eliminar relaciones antiguas y crear nuevas
            await SoftwareEquipos.destroy({ where: { id_software: id }, transaction: t });
            await SoftwareEquipos.bulkCreate(equiposData, { transaction: t });
        }

        // Actualizar relaciones (licencias asociadas)
        if (Array.isArray(req.body.softwareLicencias)) {
            const validLicencias = req.body.softwareLicencias.map((licencia) => ({
                id_software: id,
                claveLicencia: licencia.claveLicencia || null,
                correoAsociado: licencia.correoAsociado || null,
                contrasenaCorreo: licencia.contrasenaCorreo || null,
                compartida: !!licencia.compartida,
            }));

            // Eliminar relaciones antiguas y crear nuevas
            await SoftwareLicencias.destroy({ where: { id_software: id }, transaction: t });
            if (validLicencias.length > 0) {
                await SoftwareLicencias.bulkCreate(validLicencias, { transaction: t });
            }
        }

        // Confirmar la transacción
        await t.commit();
        res.status(200).json({ message: 'Software actualizado correctamente' });
    } catch (error) {
        // En caso de error, revertir la transacción
        await t.rollback();
        console.error('Error al actualizar el software:', error);
        res.status(500).json({ message: 'Error al actualizar el software', error });
    }
};

// Eliminar un software por su ID con historial
exports.deleteSoftware = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Buscar el software por ID
        const software = await findSoftwareById(id);
        if (!software) {
            await t.rollback();
            return res.status(404).json({ message: 'Software no encontrado' });
        }

        // Guardar en historial
        await SoftwareHistorial.create(
            {
                ...software.toJSON(),
                accion: 'eliminar',
                fecha_operacion: new Date(),
            },
            { transaction: t }
        );

        // Guardar equipos asociados en el historial
        for (const equipo of software.equiposAsociados) {
            await SoftwareEquiposHistorial.create(
                {
                    ...equipo.toJSON(),
                    accion: 'eliminar',
                    fecha_operacion: new Date(),
                },
                { transaction: t }
            );
        }

        // Guardar licencias asociadas en el historial
        for (const licencia of software.licencias) {
            await SoftwareLicenciasHistorial.create(
                {
                    ...licencia.toJSON(),
                    accion: 'eliminar',
                    fecha_operacion: new Date(),
                },
                { transaction: t }
            );
        }

        // Eliminar software y sus relaciones
        await SoftwareEquipos.destroy({ where: { id_software: id }, transaction: t });
        await SoftwareLicencias.destroy({ where: { id_software: id }, transaction: t });
        await software.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Software eliminado exitosamente' });
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
                    [Op.lte]: soonDate
                }
            }
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

        res.status(200).json({ expired: expired || [], expiringSoon: expiringSoon || [] });
    } catch (error) {
        console.error('Error al obtener software próximo a caducar o caducado:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Obtener historial de un software específico
exports.getSoftwareHistorial = async (req, res) => {
    const { id } = req.params; // Capturar el parámetro id desde la URL
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'El ID del software no fue proporcionado.' });
      }
  
      const historial = await SoftwareHistorial.findAll({
        where: { id_software: id }, // Utilizar el id para filtrar el historial
        order: [['fecha_operacion', 'DESC']],
      });
  
      if (!historial || historial.length === 0) {
        return res.status(200).json([]); // Responder con un array vacío si no hay historial
      }
  
      res.status(200).json(historial);
    } catch (error) {
      console.error('Error al obtener el historial del software:', error);
      res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
    }
  };
  