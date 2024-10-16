const Equipo = require('../models/Equipo');
const path = require('path');
const fs = require('fs');

// Función para asegurarse de que un directorio exista
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Obtener todos los equipos
exports.getEquipos = async (req, res) => {
    try {
        const equipos = await Equipo.findAll();
        res.json(equipos);
    } catch (error) {
        console.error('Error al obtener los equipos:', error);
        res.status(500).send('Error al obtener los equipos');
    }
};

// Obtener un equipo por `id_equipos`
exports.getEquipoById = async (req, res) => {
    const { id_equipos } = req.params;
    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }
        res.json(equipo);
    } catch (error) {
        console.error('Error al obtener el equipo:', error);
        res.status(500).json({ message: 'Error al obtener el equipo', error: error.message });
    }
};

// Crear un nuevo equipo
exports.createEquipo = async (req, res) => {
    const {
        id_equipos, tipoDispositivo, marca, modelo, numeroSerie, contrasenaEquipo, ram, discoDuro,
        tarjetaMadre, tarjetaGrafica, procesador, componentesAdicionales, estadoFisico, detallesIncidentes,
        garantia, fechaCompra, activo, sistemaOperativo, mac, hostname, auxiliares, idColaborador
    } = req.body;
    const file = req.file;

    if (!id_equipos || !tipoDispositivo || !numeroSerie) {
        return res.status(400).json({ message: 'Faltan datos requeridos: id_equipos, tipoDispositivo, numeroSerie.' });
    }

    const uploadDir = path.join(__dirname, '..', 'uploads', 'equipos');
    ensureDirectoryExists(uploadDir);
    const imagen = file ? `/uploads/equipos/${file.filename}` : null;  // Guardar solo la ruta relativa

    try {
        const equipo = await Equipo.create({
            id_equipos, tipoDispositivo, marca, modelo, numeroSerie, contrasenaEquipo, ram, discoDuro,
            tarjetaMadre, tarjetaGrafica, procesador,
            componentesAdicionales: componentesAdicionales ? JSON.parse(componentesAdicionales) : [],
            estadoFisico, detallesIncidentes, garantia, fechaCompra, activo,
            sistemaOperativo, mac, hostname,
            auxiliares: auxiliares ? JSON.parse(auxiliares) : [],
            idColaborador, imagen  // Usar la ruta relativa
        });

        res.status(201).json({ message: 'Equipo creado con éxito', equipo, imagenUrl: imagen });
    } catch (err) {
        console.error('Error al crear el equipo:', err);
        res.status(500).json({ message: 'Error al crear el equipo', error: err.message });
    }
};

// Actualizar un equipo (usando id_equipos)
exports.updateEquipo = async (req, res) => {
    const { id_equipos } = req.params;
    const data = req.body;
    const file = req.file;

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        if (file) {
            const uploadDir = path.join(__dirname, '..', 'uploads', 'equipos');
            ensureDirectoryExists(uploadDir);

            // Eliminar la imagen anterior si existe
            if (equipo.imagen) {
                const imagePath = path.join(__dirname, '..', equipo.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Eliminar la imagen antigua
                }
            }

            // Almacenar la nueva ruta relativa
            data.imagen = `/uploads/equipos/${file.filename}`;
        }

        // Parsear los campos JSON antes de actualizarlos
        if (data.componentesAdicionales) {
            data.componentesAdicionales = JSON.parse(data.componentesAdicionales);
        }
        if (data.auxiliares) {
            data.auxiliares = JSON.parse(data.auxiliares);
        }

        await equipo.update(data);

        res.status(200).json({ message: 'Equipo actualizado con éxito', equipo });
    } catch (err) {
        console.error('Error al actualizar el equipo:', err);
        res.status(500).json({ message: 'Error al actualizar el equipo', error: err.message });
    }
};

// Eliminar un equipo (usando id_equipos)
exports.deleteEquipo = async (req, res) => {
    const { id_equipos } = req.params;

    try {
        const equipo = await Equipo.findOne({ where: { id_equipos } });
        if (!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Eliminar la imagen asociada si existe
        if (equipo.imagen) {
            const imagePath = path.join(__dirname, '..', equipo.imagen); // Usar la ruta relativa
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await equipo.destroy();

        res.status(200).json({ message: 'Equipo eliminado con éxito' });
    } catch (err) {
        console.error('Error al eliminar el equipo:', err);
        res.status(500).json({ message: 'Error al eliminar el equipo', error: err.message });
    }
};
