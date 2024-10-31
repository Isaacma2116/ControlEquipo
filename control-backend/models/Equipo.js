const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Colaborador = require('./Colaborador'); // Asegúrate de que el modelo Colaborador esté definido correctamente

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
    ram: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discoDuro: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tarjetaMadre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tarjetaGrafica: {
        type: DataTypes.STRING,
        allowNull: true
    },
    procesador: {
        type: DataTypes.STRING,
        allowNull: true
    },
    componentesAdicionales: {
        type: DataTypes.JSON,
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
    auxiliares: {
        type: DataTypes.JSON,
        allowNull: true
    },
    idColaborador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Colaborador, // Relación con la tabla de `Colaborador`
            key: 'id'
        }
    },
    imagen: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    }
}, {
    tableName: 'equipos',
    timestamps: false // No usar timestamps automáticos
});

// Definir la relación con `Colaborador`
Equipo.associate = (models) => {
    Equipo.belongsTo(models.Colaborador, {
        foreignKey: 'idColaborador',
        as: 'colaborador'
    });
};

module.exports = Equipo;
