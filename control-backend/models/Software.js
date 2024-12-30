const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Software extends Model {}

Software.init({
    id_software: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.ENUM('activo', 'sin uso', 'vencido', 'vencido con equipo', 'inactivo'),
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
    estadoActivo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1, // 1 indica que el software está activo
    },
}, {
    sequelize,
    modelName: 'Software',
    tableName: 'software',
    timestamps: false,
});

module.exports = Software;
