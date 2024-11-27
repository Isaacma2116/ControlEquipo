const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SoftwareLicenciasHistorial = sequelize.define('SoftwareLicenciasHistorial', {
    id_historial: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_licencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        allowNull: false,
        defaultValue: false,
    },
    estado_renovacion: {
        type: DataTypes.ENUM('activa', 'caducada'),
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
    tableName: 'software_licencias_historial',
    timestamps: false,
});

module.exports = SoftwareLicenciasHistorial;
