const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/database');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

require('dotenv').config();

app.use(cors()); // Configurar según necesidades específicas si es necesario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3550;

// Sincronización con la base de datos y arranque del servidor
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
    });
}).catch(error => {
    console.error('No se pudo conectar a la base de datos:', error);
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.stack);
    res.status(statusCode).send({ message: err.message || 'Algo salió mal!' });
});
