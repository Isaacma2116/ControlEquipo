// models/SoftwareLicencias.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajusta la ruta según tu proyecto

class SoftwareLicencias extends Model {}

SoftwareLicencias.init({
    id_licencia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_software: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Software',
            key: 'id_software',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    claveLicencia: {
        type: DataTypes.STRING,
        allowNull: true, // Debe permitir NULL
    },
    correoAsociado: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
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
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize,
    modelName: 'SoftwareLicencias',
    tableName: 'software_licencias',
    timestamps: false, // Si no necesitas createdAt y updatedAt
});

module.exports = SoftwareLicencias;
