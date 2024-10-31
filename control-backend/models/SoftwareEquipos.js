const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        type: DataTypes.STRING,
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
