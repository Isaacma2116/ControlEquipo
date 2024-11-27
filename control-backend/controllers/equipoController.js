const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Equipo = require('../models/Equipo');
const Auxiliar = require('../models/Auxiliar');
const EquipoHistorial = require('../models/EquipoHistorial');
const AuxiliarHistorial = require('../models/AuxiliarHistorial');
const path = require('path');
const fs = require('fs');

// Asegurar la existencia de un directorio
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Obtener todos los equipos con auxiliares
exports.getEquipos = async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            include: {
                model: Auxiliar,
                as: 'auxiliares',
            },
        });
        res.status(200).json(equipos);
    } catch (error) {
        console.error('Error al obtener los equipos:', error);
        res.status(500).json({ message: 'Error al obtener los equipos.', error: error.message });
    }
};

// Obtener un equipo por `id_equipos` con auxiliares
exports.getEquipoById = async (req, res) => {
    const { id_equipos } = req.params;
    try {
        const equipo = await Equipo.findOne({
            where: { id_equipos },
            include: {
                model: Auxiliar,
                as: 'auxiliares',
            },
        });
        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }
        res.status(200).json(equipo);
    } catch (error) {
        console.error('Error al obtener el equipo:', error);
        res.status(500).json({ message: 'Error al obtener el equipo.', error: error.message });
    }
};

// Crear un nuevo equipo con auxiliares
exports.createEquipo = async (req, res) => {
    const {
        id_equipos,
        tipoDispositivo,
        marca,
        modelo,
        numeroSerie,
        contrasenaEquipo,
        ram,
        discoDuro,
        tarjetaMadre,
        tarjetaGrafica,
        procesador,
        componentesAdicionales,
        estadoFisico,
        detallesIncidentes,
        garantia,
        fechaCompra,
        activo,
        sistemaOperativo,
        mac,
        hostname,
        auxiliares,
        idColaborador,
    } = req.body;
    const file = req.file;

    if (!id_equipos || !tipoDispositivo || !numeroSerie) {
        return res.status(400).json({ message: 'Faltan datos requeridos: id_equipos, tipoDispositivo, numeroSerie.' });
    }

    const uploadDir = path.join(__dirname, '..', 'uploads', 'equipos');
    ensureDirectoryExists(uploadDir);
    const imagen = file ? `/uploads/equipos/${file.filename}` : null;

    const transaction = await sequelize.transaction();

    try {
        // Parsear `componentesAdicionales`
        let parsedComponentesAdicionales = [];
        if (componentesAdicionales) {
            try {
                parsedComponentesAdicionales = typeof componentesAdicionales === 'string'
                    ? JSON.parse(componentesAdicionales)
                    : componentesAdicionales;
            } catch (error) {
                return res.status(400).json({
                    message: 'El campo "componentesAdicionales" no contiene un JSON válido.',
                    error: error.message,
                });
            }
        }

        // Crear el equipo
        const equipo = await Equipo.create(
            {
                id_equipos,
                tipoDispositivo,
                marca,
                modelo,
                numeroSerie,
                contrasenaEquipo,
                ram,
                discoDuro,
                tarjetaMadre,
                tarjetaGrafica,
                procesador,
                componentesAdicionales: parsedComponentesAdicionales,
                estadoFisico,
                detallesIncidentes,
                garantia,
                fechaCompra,
                activo,
                sistemaOperativo,
                mac,
                hostname,
                idColaborador,
                imagen,
            },
            { transaction }
        );

        // Parsear y crear `auxiliares`
        let parsedAuxiliares = [];
        if (auxiliares) {
            try {
                parsedAuxiliares = Array.isArray(auxiliares) ? auxiliares : JSON.parse(auxiliares);
            } catch (error) {
                return res.status(400).json({
                    message: 'El campo "auxiliares" no contiene un JSON válido.',
                    error: error.message,
                });
            }

            for (const auxiliar of parsedAuxiliares) {
                if (auxiliar.nombre_auxiliar && auxiliar.numero_serie_aux) {
                    await Auxiliar.create(
                        {
                            nombre_auxiliar: auxiliar.nombre_auxiliar,
                            numero_serie_aux: auxiliar.numero_serie_aux,
                            id_equipo: equipo.id_equipos, // Relación con el equipo recién creado
                        },
                        { transaction }
                    );
                } else {
                    return res.status(400).json({
                        message: 'Cada auxiliar debe tener "nombre_auxiliar" y "numero_serie_aux".',
                    });
                }
            }
        }

        // Confirmar transacción
        await transaction.commit();
        res.status(201).json({ message: 'Equipo creado con éxito.', equipo });
    } catch (err) {
        // Revertir transacción si algo falla
        await transaction.rollback();
        console.error('Error al crear el equipo:', err);
        res.status(500).json({ message: 'Error al crear el equipo.', error: err.message });
    }
};


// Actualizar un equipo y sus auxiliares
exports.updateEquipo = async (req, res) => {
    const { id_equipos } = req.params;
    const data = req.body;

    const transaction = await sequelize.transaction();

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        await EquipoHistorial.create(
            {
                ...equipo.toJSON(),
                operacion: 'edicion',
                fecha_operacion: new Date(),
            },
            { transaction }
        );

        if (data.componentesAdicionales) {
            try {
                data.componentesAdicionales = typeof data.componentesAdicionales === 'string'
                    ? JSON.parse(data.componentesAdicionales)
                    : data.componentesAdicionales;
            } catch (error) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'El campo "componentesAdicionales" no contiene un JSON válido.',
                    error: error.message,
                });
            }
        }

        await equipo.update(data, { transaction });

        if (data.auxiliares) {
            let parsedAuxiliares = [];
            try {
                parsedAuxiliares = typeof data.auxiliares === 'string' ? JSON.parse(data.auxiliares) : data.auxiliares;
            } catch (error) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'El campo "auxiliares" no contiene un JSON válido.',
                    error: error.message,
                });
            }

            const auxiliaresActuales = await Auxiliar.findAll({ where: { id_equipo: id_equipos } });
            for (const auxiliar of auxiliaresActuales) {
                await AuxiliarHistorial.create(
                    {
                        ...auxiliar.toJSON(),
                        operacion: 'edicion',
                        fecha_operacion: new Date(),
                    },
                    { transaction }
                );
            }

            await Auxiliar.destroy({ where: { id_equipo: id_equipos }, transaction });
            for (const auxiliar of parsedAuxiliares) {
                if (auxiliar.nombre_auxiliar && auxiliar.numero_serie_aux) {
                    await Auxiliar.create(
                        {
                            nombre_auxiliar: auxiliar.nombre_auxiliar,
                            numero_serie_aux: auxiliar.numero_serie_aux,
                            id_equipo: id_equipos,
                        },
                        { transaction }
                    );
                }
            }
        }

        await transaction.commit();
        res.status(200).json({ message: 'Equipo actualizado con éxito.', equipo });
    } catch (err) {
        await transaction.rollback();
        console.error('Error al actualizar el equipo:', err);
        res.status(500).json({ message: 'Error al actualizar el equipo.', error: err.message });
    }
};

// Eliminar un equipo y sus auxiliares
exports.deleteEquipo = async (req, res) => {
    const { id_equipos } = req.params;

    const transaction = await sequelize.transaction();

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        await EquipoHistorial.create(
            { ...equipo.toJSON(), operacion: 'eliminacion', fecha_operacion: new Date() },
            { transaction }
        );

        const auxiliares = await Auxiliar.findAll({ where: { id_equipo: id_equipos } });
        for (const auxiliar of auxiliares) {
            await AuxiliarHistorial.create(
                { ...auxiliar.toJSON(), operacion: 'eliminacion', fecha_operacion: new Date() },
                { transaction }
            );
        }

        await Auxiliar.destroy({ where: { id_equipo: id_equipos }, transaction });
        await equipo.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Equipo eliminado con éxito.' });
    } catch (err) {
        await transaction.rollback();
        console.error('Error al eliminar el equipo:', err);
        res.status(500).json({ message: 'Error al eliminar el equipo.', error: err.message });
    }
};

// Obtener historial de un equipo
exports.getEquipoHistorial = async (req, res) => {
    const { idEquipo } = req.params;

    try {
        const historial = await EquipoHistorial.findAll({
            where: { id_equipos: idEquipo },
            order: [['fecha_operacion', 'DESC']],
        });

        if (!historial || historial.length === 0) {
            return res.status(200).json({ message: 'No se encontraron registros en el historial.', historial: [] });
        }

        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener el historial del equipo:', error);
        res.status(500).json({ message: 'Error al obtener el historial del equipo.', error: error.message });
    }
};
