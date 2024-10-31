const Software = require('../models/Software');
const SoftwareEquipos = require('../models/SoftwareEquipos');
const Equipo = require('../models/Equipo'); // Asegúrate de tener este modelo
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Función auxiliar para encontrar software por ID
const findSoftwareById = async (id) => {
    return await Software.findByPk(id, {
        include: [
            {
                model: SoftwareEquipos,
                as: 'softwareEquipos',
                attributes: ['id_equipos', 'fechaAsignacion'],
            },
        ],
    });
};

// Función auxiliar para verificar si un equipo existe
const doesEquipoExist = async (idEquipo) => {
    const equipo = await Equipo.findByPk(idEquipo);
    return equipo !== null;
};

// Crear un nuevo software
exports.createSoftware = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            nombre,
            version,
            fechaAdquisicion,
            fechaCaducidad,
            tipoLicencia,
            claveLicencia,
            correoAsociado,
            contrasenaCorreo,
            estado,
            equipos_asociados,
            licenciaCaducada,
            maxLicencias, // Renombrar a maxLicencias para mayor claridad
        } = req.body;

        // Validaciones
        if (!nombre || !version) {
            return res.status(400).json({ message: 'Nombre y versión son requeridos.' });
        }

        // Crear el nuevo software
        const newSoftware = await Software.create(
            {
                nombre,
                version,
                fecha_adquisicion: fechaAdquisicion || null,
                fecha_caducidad: fechaCaducidad || null,
                tipoLicencia: tipoLicencia || 'mensual',
                claveLicencia: claveLicencia || null,
                correoAsociado: correoAsociado || null,
                contrasenaCorreo: contrasenaCorreo || null,
                estado: estado || 'sin uso',
                licenciaCaducada: licenciaCaducada || false,
                maxDispositivos: maxLicencias || 1, // Asegúrate de que se guarde un valor
            },
            { transaction: t }
        );

        // Verificar que cada equipo existe antes de asociarlo
        if (equipos_asociados && equipos_asociados.length > 0) {
            for (const equipoId of equipos_asociados) {
                const exists = await doesEquipoExist(equipoId);
                if (!exists) {
                    await t.rollback();
                    return res.status(400).json({ message: `El equipo con ID ${equipoId} no existe.` });
                }
            }

            // Crear las asociaciones
            const softwareEquiposData = equipos_asociados.map((equipoId) => ({
                id_software: newSoftware.id_software,
                id_equipos: equipoId,
            }));
            await SoftwareEquipos.bulkCreate(softwareEquiposData, { transaction: t });
        }

        await t.commit();
        res.status(201).json(newSoftware);
    } catch (error) {
        await t.rollback();
        console.error('Error al crear el software:', error);
        res.status(400).json({ message: 'Error al crear el software', error });
    }
};

// Obtener todos los softwares, con los equipos asociados
exports.getSoftwares = async (req, res) => {
    try {
        const { page, limit } = req.query;
        let options = {
            include: [
                {
                    model: SoftwareEquipos,
                    as: 'softwareEquipos',
                    attributes: ['id_equipos', 'fechaAsignacion'],
                },
            ],
        };

        if (page && limit) {
            const offset = (page - 1) * limit;
            options = {
                ...options,
                limit: parseInt(limit),
                offset: parseInt(offset),
            };
        }

        const softwares = await Software.findAndCountAll(options);

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
            include: [{
                model: Software,
                as: 'software', // Asegúrate de que este alias coincide con la asociación
            }],
        });

        if (softwareEquipos.length === 0) {
            return res.status(200).json({ message: 'No hay softwares asociados a este equipo.', data: [] });
        }

        const softwareData = softwareEquipos.map(se => se.software); // Extraer solo el software asociado
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

        const names = softwareNames.map((software) => software.nombre);

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
    const t = await sequelize.transaction();
    try {
        const software = await findSoftwareById(req.params.id);
        if (!software) {
            return res.status(404).json({ message: 'Software no encontrado' });
        }

        await software.update(req.body, { transaction: t });

        const { equipos_asociados } = req.body;
        if (equipos_asociados) {
            await SoftwareEquipos.destroy({
                where: { id_software: software.id_software },
                transaction: t,
            });

            const softwareEquiposData = equipos_asociados.map((equipoId) => ({
                id_software: software.id_software,
                id_equipos: equipoId,
            }));
            await SoftwareEquipos.bulkCreate(softwareEquiposData, { transaction: t });
        }

        await t.commit();
        res.status(200).json(software);
    } catch (error) {
        await t.rollback();
        console.error('Error al actualizar el software:', error);
        res.status(400).json({ message: 'Error al actualizar el software', error });
    }
};

// Eliminar un software por su ID
exports.deleteSoftware = async (req, res) => {
    try {
        const software = await findSoftwareById(req.params.id);
        if (!software) {
            return res.status(404).json({ message: 'Software no encontrado' });
        }
        await software.destroy();
        res.status(200).json({ message: 'Software eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el software:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};
