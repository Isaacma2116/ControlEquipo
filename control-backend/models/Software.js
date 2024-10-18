const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de ajustar la ruta si es necesario

const Software = sequelize.define('Software', {
    id_software: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    version: {
        type: DataTypes.STRING,
        allowNull: true
    },
    licencia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_adquisicion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW // Asigna la fecha actual por defecto si no se proporciona
    },
    fecha_caducidad: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tipo_licencia: {
        type: DataTypes.ENUM('mensual', 'anual', 'vitalicia'),
        allowNull: true
    },
    clave_licencia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    correo_asociado: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contrasena_correo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('activo', 'sin uso', 'vencido', 'vencido con equipo'),
        allowNull: false
    },
    id_equipos: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    licencia_caducada: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: 'software', // Nombre de la tabla en minúsculas, si es necesario
    timestamps: false // Desactiva si no tienes columnas de timestamps
});

module.exports = Software;
