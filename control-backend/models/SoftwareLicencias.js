const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo SoftwareLicencias
const SoftwareLicencias = sequelize.define('SoftwareLicencias', {
    id_licencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_software: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    compartida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'software_licencias',
    timestamps: false,
});

module.exports = SoftwareLicencias;
