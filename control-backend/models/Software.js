const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Software = sequelize.define('Software', {
    id_software: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    version: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha_adquisicion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fecha_caducidad: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    tipoLicencia: {
        type: DataTypes.ENUM('mensual', 'anual', 'vitalicia'),
        allowNull: true,
        defaultValue: 'mensual',
    },
    claveLicencia: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    correoAsociado: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contrasenaCorreo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('sin uso', 'activo', 'vencido con equipo'),
        allowNull: false,
    },
    licenciaCaducada: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    maxDispositivos: {
        type: DataTypes.INTEGER,
        allowNull: false, // El valor no puede ser nulo
        defaultValue: 1,  // Puedes cambiar o eliminar este valor por defecto
    },
}, {
    tableName: 'software',
    timestamps: false,
});

module.exports = Software;
