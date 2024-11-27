const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SoftwareEquiposHistorial = sequelize.define('SoftwareEquiposHistorial', {
    id_historial: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        allowNull: true,
    },
    estado_asignacion: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
    },
    accion: {
        type: DataTypes.ENUM('insertar', 'editar', 'eliminar'),
        allowNull: false,
    },
    fecha_operacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'software_equipos_historial',
    timestamps: false,
});

module.exports = SoftwareEquiposHistorial;
