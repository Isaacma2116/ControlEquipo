const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const sequelize = require('./config/database');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const authRoutes = require('./routes/authRoutes');
const softwareRoutes = require('./routes/softwareRoutes');
const { Software } = require('./models/associations');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Dirección del frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
});

// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

// Configurar CORS
app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos para imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/software', softwareRoutes);

// Emite una notificación de software próximo a caducar
const notifyExpiringSoftware = async () => {
    try {
        const today = new Date();
        const soonDate = new Date(today);
        soonDate.setDate(today.getDate() + 30);

        const expiringSoftware = await Software.findAll({
            where: {
                fecha_caducidad: {
                    [sequelize.Op.and]: {
                        [sequelize.Op.not]: null,
                        [sequelize.Op.lte]: soonDate,
                    },
                },
            },
        });

        if (expiringSoftware.length > 0) {
            io.emit('expiring-software-notification', expiringSoftware);
        }
    } catch (error) {
        console.error('Error al verificar software próximo a caducar:', error);
    }
};

// Ejecuta la función de notificación cada hora
setInterval(notifyExpiringSoftware, 3600000); // Cada hora

// Eventos de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('request-software-historial', async (softwareId) => {
        try {
            const historial = await sequelize.query(
                `SELECT * FROM software_historial WHERE id_software = ? ORDER BY fecha DESC`,
                { replacements: [softwareId], type: sequelize.QueryTypes.SELECT }
            );
            socket.emit('software-historial-response', historial);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            socket.emit('software-historial-error', { message: 'Error al obtener historial' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Puerto de la aplicación
const PORT = process.env.PORT || 3550;

// Sincronización con la base de datos y arranque del servidor
sequelize
    .sync({ force: false }) // Evita sobrescribir tablas en desarrollo
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('No se pudo conectar a la base de datos:', error);
    });

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(`[ERROR] ${err.message}`, {
        path: req.path,
        stack: err.stack,
    });
    res.status(statusCode).json({ message: err.message || 'Error interno del servidor' });
});
