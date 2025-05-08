// models/Equipo.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Colaborador = require('./Colaborador'); // Asegúrate de que la ruta es correcta
const Auxiliar = require('./Auxiliar');       // Asegúrate de que la ruta es correcta

const Equipo = sequelize.define(
    'Equipo',
    {
        id_equipos: {
            type: DataTypes.STRING,
            primaryKey: true, // Clave primaria
            allowNull: false,
            unique: true,
        },
        tipoDispositivo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        marca: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        modelo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        numeroSerie: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contrasenaEquipo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ram: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        discoDuro: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tarjetaMadre: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tarjetaGrafica: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        procesador: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        componentesAdicionales: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        estadoFisico: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        detallesIncidentes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        garantia: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fechaCompra: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        activo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sistemaOperativo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mac: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hostname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        idColaborador: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Colaborador, // Relación con el modelo Colaborador
                key: 'id',
            },
        },
        imagen: {
            type: DataTypes.STRING, // Cambiado de BLOB a STRING
            allowNull: true,
        },
        estadoActivo: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1, // Activo por defecto
        },
    },
    {
        tableName: 'equipos',
        timestamps: false, // No usar timestamps automáticos
    }
);

// Asociaciones
Equipo.associate = (models) => {
    // Relación con `Colaborador`
    Equipo.belongsTo(models.Colaborador, {
        foreignKey: 'idColaborador',
        as: 'colaborador',
    });

    // Relación con `Auxiliar`
    Equipo.hasMany(models.Auxiliar, {
        foreignKey: 'id_equipo',
        as: 'auxiliares',
    });
};

module.exports = Equipo;
