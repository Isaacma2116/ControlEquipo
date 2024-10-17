const Software = require('../models/Software'); // Asegúrate de que el modelo esté correctamente importado
const sequelize = require('sequelize'); // Asegúrate de tener 'sequelize' disponible si no lo tienes ya

// Crear un nuevo software
exports.createSoftware = async (req, res) => {
    try {
        const newSoftware = await Software.create(req.body);
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
        if (softwares.length === 0) {
            return res.status(204).send('No hay softwares registrados aún');
        }
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

// Obtener los nombres de software y el número de veces registrados
exports.getSoftwareNames = async (req, res) => {
    try {
        const softwareNames = await Software.findAll({
            attributes: [
                'nombre',
                [sequelize.fn('COUNT', sequelize.col('nombre')), 'count']
            ],
            group: ['nombre']
        });
        if (softwareNames.length === 0) {
            return res.status(204).send('No hay nombres de software registrados aún.');
        }
        res.status(200).json(softwareNames);
    } catch (error) {
        console.error('Error al obtener los nombres de software:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};
