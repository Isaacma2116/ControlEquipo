const Software = require('../models/Software');

// Crear un nuevo software
exports.createSoftware = async (req, res) => {
    try {
        const newSoftware = await Software.create({
            nombre: req.body.nombre,
            version: req.body.version,
            fecha_adquisicion: req.body.fechaAdquisicion || null,
            fecha_caducidad: req.body.fechaCaducidad || null,
            tipo_licencia: req.body.tipoLicencia || 'mensual',
            clave_licencia: req.body.claveLicencia || null,
            correo_asociado: req.body.correoAsociado || null,
            contrasena_correo: req.body.contrasenaCorreo || null,
            estado: req.body.estado || 'sin uso',
            id_equipos: req.body.id_equipos || null,
            licencia_caducada: req.body.licenciaCaducada || false
        });
        res.status(201).json(newSoftware);
    } catch (error) {
        console.error('Error al crear el software:', error);
        res.status(400).json({ message: 'Error al crear el software', error });
    }
};

// Obtener todos los softwares
exports.getSoftwares = async (req, res) => {
    try {
        const softwares = await Software.findAll();
        res.status(200).json(softwares);
    } catch (error) {
        console.error('Error al obtener los softwares:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Obtener un software por su ID
exports.getSoftware = async (req, res) => {
    try {
        const software = await Software.findByPk(req.params.id);
        if (!software) {
            return res.status(404).json({ message: 'Software no encontrado' });
        }
        res.status(200).json(software);
    } catch (error) {
        console.error('Error al obtener el software:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Obtener los softwares asociados a un equipo por id_equipos
exports.getSoftwaresByEquipo = async (req, res) => {
    try {
        const softwares = await Software.findAll({
            where: { id_equipos: req.params.idEquipo }
        });
        if (softwares.length === 0) {
            return res.status(204).send('No hay softwares asociados a este equipo.');
        }
        res.status(200).json(softwares);
    } catch (error) {
        console.error('Error al obtener los softwares por equipo:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Obtener los nombres de los softwares (usando la columna 'nombre' únicamente)
exports.getSoftwareNames = async (req, res) => {
    try {
        const softwareNames = await Software.findAll({
            attributes: ['nombre'] // Solo obtener la columna 'nombre'
        });
        res.status(200).json(softwareNames);
    } catch (error) {
        console.error('Error al obtener los nombres de los softwares:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

// Actualizar un software por su ID
exports.updateSoftware = async (req, res) => {
    try {
        const software = await Software.findByPk(req.params.id);
        if (!software) {
            return res.status(404).json({ message: 'Software no encontrado' });
        }
        await software.update(req.body);
        res.status(200).json(software);
    } catch (error) {
        console.error('Error al actualizar el software:', error);
        res.status(400).json({ message: 'Error al actualizar el software', error });
    }
};

// Eliminar un software por su ID
exports.deleteSoftware = async (req, res) => {
    try {
        const software = await Software.findByPk(req.params.id);
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
