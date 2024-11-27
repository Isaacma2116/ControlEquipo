const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo SoftwareEquipos
const SoftwareEquipos = sequelize.define('SoftwareEquipos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_software: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_equipos: {
        type: DataTypes.STRING,  // Asegura que es STRING para aceptar valores como 'j71'
        allowNull: false,
    },
    fechaAsignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'software_equipos',
    timestamps: false,
});

module.exports = SoftwareEquipos;
