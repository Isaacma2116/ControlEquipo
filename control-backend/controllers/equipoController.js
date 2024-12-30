// controllers/equipoController.js

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

// Obtener todos los equipos con auxiliares (solo activos)
exports.getEquipos = async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            where: { estadoActivo: 1 }, // Solo equipos activos
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

// Obtener un equipo por `id_equipos` con auxiliares (solo si está activo)
exports.getEquipoById = async (req, res) => {
    const { id_equipos } = req.params;

    try {
        const equipo = await Equipo.findOne({
            where: { id_equipos, estadoActivo: 1 }, // Solo equipo activo
            include: {
                model: Auxiliar,
                as: 'auxiliares',
            },
        });

        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado o está inactivo.' });
        }

        // Construir la URL completa de la imagen
        equipo.imagen = equipo.imagen
            ? `${req.protocol}://${req.get('host')}${equipo.imagen}`
            : `${req.protocol}://${req.get('host')}/uploads/equipos/default-equipo.png`;

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

    // Validar campos requeridos
    if (!id_equipos || !tipoDispositivo || !numeroSerie) {
        return res.status(400).json({ message: 'Faltan datos requeridos: id_equipos, tipoDispositivo, numeroSerie.' });
    }

    // Asignar la ruta de la imagen si se subió un archivo, de lo contrario null
    const imagen = file ? `/uploads/equipos/${file.filename}` : null;

    const transaction = await sequelize.transaction();

    try {
        // Manejar `idColaborador`: convertir cadena vacía a null
        let parsedIdColaborador = idColaborador;
        if (parsedIdColaborador === '') {
            parsedIdColaborador = null;
        } else if (parsedIdColaborador) {
            parsedIdColaborador = parseInt(parsedIdColaborador, 10);
            if (isNaN(parsedIdColaborador)) {
                throw new Error('idColaborador debe ser un número entero o null.');
            }
        }

        // Parsear `componentesAdicionales`
        let parsedComponentesAdicionales = [];
        if (componentesAdicionales) {
            try {
                parsedComponentesAdicionales =
                    typeof componentesAdicionales === 'string'
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
                idColaborador: parsedIdColaborador,
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
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            res.status(400).json({ message: 'El colaborador seleccionado no existe.', error: err.message });
        } else if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'El ID del equipo ya existe.', error: err.message });
        } else {
            res.status(500).json({ message: 'Error al crear el equipo.', error: err.message });
        }

        // Si se subió una imagen y hubo un error, eliminar el archivo subido
        if (file && fs.existsSync(path.join(__dirname, '..', imagen))) {
            fs.unlinkSync(path.join(__dirname, '..', imagen));
        }
    }
};

// Actualizar un equipo y sus auxiliares
exports.updateEquipo = async (req, res) => {
    const { id_equipos } = req.params;
    const data = req.body;
    const file = req.file; // Asegúrate de que el archivo esté en `req.file`

    const transaction = await sequelize.transaction();

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        // Si se subió un nuevo archivo de imagen
        let imagen = equipo.imagen; // Imagen actual
        if (file) {
            // Borra la imagen anterior si existe y no es la imagen por defecto
            if (imagen && imagen !== '/uploads/equipos/default-equipo.png') {
                const imagenPath = path.join(__dirname, '..', imagen);
                if (fs.existsSync(imagenPath)) {
                    fs.unlinkSync(imagenPath);
                }
            }
            imagen = `/uploads/equipos/${file.filename}`; // Nueva ruta de imagen
        }

        // Manejar `idColaborador`: convertir cadena vacía a null
        let parsedIdColaborador = data.idColaborador;
        if (parsedIdColaborador === '') {
            parsedIdColaborador = null;
        } else if (parsedIdColaborador) {
            parsedIdColaborador = parseInt(parsedIdColaborador, 10);
            if (isNaN(parsedIdColaborador)) {
                throw new Error('idColaborador debe ser un número entero o null.');
            }
        }

        // Parsear `componentesAdicionales`
        let parsedComponentesAdicionales = equipo.componentesAdicionales; // Mantener los existentes por defecto
        if (data.componentesAdicionales) {
            try {
                parsedComponentesAdicionales =
                    typeof data.componentesAdicionales === 'string'
                        ? JSON.parse(data.componentesAdicionales)
                        : data.componentesAdicionales;
            } catch (error) {
                return res.status(400).json({
                    message: 'El campo "componentesAdicionales" no contiene un JSON válido.',
                    error: error.message,
                });
            }
        }

        // Actualizar los datos del equipo
        await equipo.update(
            {
                ...data,
                idColaborador: parsedIdColaborador,
                imagen: imagen, // Actualiza la imagen con la nueva ruta si se subió un archivo
                componentesAdicionales: parsedComponentesAdicionales,
            },
            { transaction }
        );

        // Actualizar auxiliares si se proporcionan
        if (data.auxiliares) {
            // Parsear `auxiliares`
            let parsedAuxiliares = [];
            try {
                parsedAuxiliares = Array.isArray(data.auxiliares) ? data.auxiliares : JSON.parse(data.auxiliares);
            } catch (error) {
                return res.status(400).json({
                    message: 'El campo "auxiliares" no contiene un JSON válido.',
                    error: error.message,
                });
            }

            // Eliminar auxiliares existentes
            await Auxiliar.destroy({ where: { id_equipo: id_equipos }, transaction });

            // Crear nuevos auxiliares
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
                } else {
                    return res.status(400).json({
                        message: 'Cada auxiliar debe tener "nombre_auxiliar" y "numero_serie_aux".',
                    });
                }
            }
        }

        // **Registrar la edición en el historial**:
        await EquipoHistorial.create(
            {
                ...equipo.toJSON(), // Incluye los campos actuales del equipo
                operacion: 'actualizacion',
                fecha_operacion: new Date(),
            },
            { transaction }
        );

        // Confirmar transacción
        await transaction.commit();
        res.status(200).json({ message: 'Equipo actualizado con éxito.', equipo });
    } catch (err) {
        // Revertir transacción si algo falla
        await transaction.rollback();
        console.error('Error al actualizar el equipo:', err);
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            res.status(400).json({ message: 'El colaborador seleccionado no existe.', error: err.message });
        } else {
            res.status(500).json({ message: 'Error al actualizar el equipo.', error: err.message });
        }

        // Si se subió una imagen y hubo un error, eliminar el archivo subido
        if (file) {
            const imagenPath = path.join(__dirname, '..', `/uploads/equipos/${file.filename}`);
            if (fs.existsSync(imagenPath)) {
                fs.unlinkSync(imagenPath);
            }
        }
    }
};

// Controlador para la actualización de la imagen
// controllers/equipoController.js

exports.updateEquipoImagen = async (req, res) => {
    const { id_equipos } = req.params;
    const file = req.file; // Asegúrate de que el archivo esté en `req.file`

    try {
        if (!file) {
            return res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
        }

        // Obtener el equipo por ID
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            // Eliminar el archivo subido si el equipo no existe
            fs.unlinkSync(file.path);
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        // Verificar que 'imagen' es una cadena de texto
        if (typeof equipo.imagen !== 'string') {
            console.error('El campo "imagen" no es una cadena de texto:', equipo.imagen);
            // Opcional: eliminar el archivo subido para evitar basura
            fs.unlinkSync(file.path);
            return res.status(500).json({ message: 'Error interno del servidor: imagen inválida.' });
        }

        // Asignar la ruta de la nueva imagen
        const imagenPath = `/uploads/equipos/${file.filename}`;

        // Eliminar la imagen anterior si existe y no es la imagen por defecto
        if (equipo.imagen && equipo.imagen !== '/uploads/equipos/default-equipo.png') {
            const rutaImagenAnterior = path.join(__dirname, '..', equipo.imagen);
            if (fs.existsSync(rutaImagenAnterior)) {
                fs.unlinkSync(rutaImagenAnterior);
            }
        }

        // Actualizar la imagen en la base de datos
        await equipo.update({ imagen: imagenPath });

        // Registrar la actualización en el historial
        await EquipoHistorial.create(
            {
                id_equipos: equipo.id_equipos,
                operacion: 'actualizacion_imagen',
                fecha_operacion: new Date(),
            }
        );

        // Devolver la nueva URL de la imagen
        res.status(200).json({ imagen: imagenPath });
    } catch (err) {
        console.error('Error al actualizar la imagen:', err);

        // Si se subió un archivo y hubo un error después, eliminar el archivo para evitar basura
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error al eliminar el archivo subido tras un fallo:', unlinkErr);
                }
            });
        }

        res.status(500).json({ message: 'Error al actualizar la imagen.', error: err.message });
    }
};

// Eliminar (desactivar) un equipo y sus auxiliares
exports.deleteEquipo = async (req, res) => {
    const { id_equipos } = req.params;

    // Iniciar una transacción para garantizar consistencia
    const transaction = await sequelize.transaction();

    try {
        // Buscar el equipo por ID y asegurarse de que está activo
        const equipo = await Equipo.findOne({
            where: { id_equipos, estadoActivo: 1 },
            include: { model: Auxiliar, as: 'auxiliares' },
            transaction,
        });

        if (!equipo) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Equipo no encontrado o ya está inactivo.' });
        }

        // Verificar si el equipo tiene auxiliares asociados
        if (equipo.auxiliares && equipo.auxiliares.length > 0) {
            await transaction.rollback();
            return res.status(400).json({
                message:
                    'No puedes eliminar este equipo porque tiene auxiliares asociados. Por favor, reasigna o elimina los auxiliares antes de desactivar el equipo.',
            });
        }

        // Realizar eliminación suave: actualizar `estadoActivo` a 0
        equipo.estadoActivo = 0;
        await equipo.save({ transaction });

        // Registrar la desactivación en el historial
        await EquipoHistorial.create(
            {
                ...equipo.toJSON(),
                operacion: 'desactivacion', // Tipo de operación
                fecha_operacion: new Date(), // Fecha y hora de la operación
            },
            { transaction }
        );

        // Confirmar la transacción
        await transaction.commit();

        // Responder al cliente con éxito
        res.status(200).json({ message: 'Equipo desactivado correctamente.' });
    } catch (err) {
        // Revertir transacción en caso de error
        await transaction.rollback();
        console.error('Error al desactivar el equipo:', err);
        res.status(500).json({ message: 'Error al desactivar el equipo.', error: err.message });
    }
};

// Obtener historial de un equipo
exports.getEquipoHistorial = async (req, res) => {
    const { id_equipos } = req.params;

    try {
        const historial = await EquipoHistorial.findAll({
            where: { id_equipos },
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

// Actualizar auxiliares de un equipo
exports.updateAuxiliares = async (req, res) => {
    const { id_equipos } = req.params;
    const { auxiliares } = req.body;

    console.log('Datos recibidos:', { id_equipos, auxiliares });

    if (!id_equipos) {
        return res.status(400).json({ message: 'ID del equipo es requerido.' });
    }

    if (!Array.isArray(auxiliares)) {
        return res.status(400).json({ message: 'El campo "auxiliares" debe ser un array.' });
    }

    const transaction = await sequelize.transaction();

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos }, transaction });
        if (!equipo) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        // Validar que todos los id_equipo en auxiliares existan y estén activos
        for (const auxiliar of auxiliares) {
            if (auxiliar.id_equipo) {
                const equipoAsignado = await Equipo.findOne({
                    where: { id_equipos: auxiliar.id_equipo, estadoActivo: 1 },
                    transaction,
                });
                if (!equipoAsignado) {
                    await transaction.rollback();
                    return res
                        .status(400)
                        .json({ message: `El equipo con ID ${auxiliar.id_equipo} no existe o está inactivo.` });
                }
            }

            // Validar campos obligatorios
            if (!auxiliar.nombre_auxiliar || !auxiliar.numero_serie_aux) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Cada auxiliar debe tener "nombre_auxiliar" y "numero_serie_aux".',
                });
            }
        }

        // Eliminar los auxiliares actuales del equipo
        await Auxiliar.destroy({ where: { id_equipo: id_equipos }, transaction });

        // Crear nuevos auxiliares para el equipo
        for (const auxiliar of auxiliares) {
            await Auxiliar.create(
                {
                    nombre_auxiliar: auxiliar.nombre_auxiliar,
                    numero_serie_aux: auxiliar.numero_serie_aux,
                    id_equipo: auxiliar.id_equipo || id_equipos,
                },
                { transaction }
            );
        }

        // Registrar la actualización en el historial
        await EquipoHistorial.create(
            {
                id_equipos: id_equipos,
                operacion: 'actualizacion_auxiliares',
                fecha_operacion: new Date(),
            },
            { transaction }
        );

        // Confirmar transacción
        await transaction.commit();

        // Obtener los nuevos auxiliares y enviarlos en la respuesta
        const updatedAuxiliares = await Auxiliar.findAll({ where: { id_equipo: id_equipos } });

        res.status(200).json({ message: 'Auxiliares actualizados correctamente.', auxiliares: updatedAuxiliares });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar auxiliares:', error);
        res.status(500).json({ message: 'Error al actualizar auxiliares.', error: error.message });
    }
};
