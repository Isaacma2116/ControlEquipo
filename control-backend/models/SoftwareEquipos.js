// models/SoftwareEquipos.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SoftwareEquipos extends Model {}

SoftwareEquipos.init({
    id: {
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
    id_equipos: {
        type: DataTypes.STRING,
        allowNull: true, // Permitir NULL para indicar 'Sin Uso'
        references: {
            model: 'Equipo',
            key: 'id_equipos',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Si se elimina un equipo, se desasocia
    },
    id_licencia: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'SoftwareLicencias',
            key: 'id_licencia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Si se elimina una licencia, se desasocia el equipo
    },
    fechaAsignacion: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    estado_asignacion: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
    },
}, {
    sequelize,
    modelName: 'SoftwareEquipos',
    tableName: 'software_equipos',
    timestamps: false,
});

module.exports = SoftwareEquipos;
