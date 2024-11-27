const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SoftwareHistorial = sequelize.define('SoftwareHistorial', {
    id_historial: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_software: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('activo', 'sin uso', 'vencido', 'vencido con equipo'),
        allowNull: false,
    },
    licenciaCaducada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    maxDispositivos: {
        type: DataTypes.INTEGER,
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
    tableName: 'software_historial',
    timestamps: false,
});

module.exports = SoftwareHistorial;
