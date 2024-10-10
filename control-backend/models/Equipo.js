const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipo = sequelize.define('Equipo', {
    id_equipos: {
        type: DataTypes.STRING,
        primaryKey: true,  // Definir `id_equipos` como clave primaria
        allowNull: false,
        unique: true
    },
    tipoDispositivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    numeroSerie: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contrasenaEquipo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    componentes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    modificaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estadoFisico: {
        type: DataTypes.STRING,
        allowNull: true
    },
    detallesIncidentes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    garantia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fechaCompra: {
        type: DataTypes.DATE,
        allowNull: true
    },
    activo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sistemaOperativo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mac: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hostname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    idColaborador: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    imagen: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    }
}, {
    tableName: 'equipos',
    timestamps: false
});

module.exports = Equipo;
