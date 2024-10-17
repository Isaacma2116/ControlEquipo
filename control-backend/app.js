const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/database');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const authRoutes = require('./routes/authRoutes');
const softwareRoutes = require('./routes/softwareRoutes'); // Asegúrate de incluir el módulo de rutas de software

const app = express();

// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

// Configurar CORS según las necesidades (puedes ajustar los orígenes permitidos)
app.use(cors());

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos para imágenes y otros recursos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/software', softwareRoutes); // Rutas para gestionar software

// Puerto de la aplicación
const PORT = process.env.PORT || 3550;

// Sincronización con la base de datos y arranque del servidor
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
        });
    })
    .catch(error => {
        console.error('No se pudo conectar a la base de datos:', error);
    });

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.stack);
    res.status(statusCode).send({ message: err.message || 'Algo salió mal!' });
});
