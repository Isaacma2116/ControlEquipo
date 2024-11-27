const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipoHistorial = sequelize.define('EquipoHistorial', {
    id_historial: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_equipos: {
        type: DataTypes.STRING,
    },
    tipoDispositivo: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    numeroSerie: DataTypes.STRING,
    contrasenaEquipo: DataTypes.STRING,
    ram: DataTypes.STRING,
    discoDuro: DataTypes.STRING,
    tarjetaMadre: DataTypes.STRING,
    tarjetaGrafica: DataTypes.STRING,
    procesador: DataTypes.STRING,
    componentesAdicionales: DataTypes.JSON,
    estadoFisico: DataTypes.STRING,
    detallesIncidentes: DataTypes.TEXT,
    garantia: DataTypes.STRING,
    fechaCompra: DataTypes.DATE,
    activo: DataTypes.STRING,
    sistemaOperativo: DataTypes.STRING,
    mac: DataTypes.STRING,
    hostname: DataTypes.STRING,
    idColaborador: DataTypes.INTEGER,
    imagen: DataTypes.STRING,
    operacion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha_operacion: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'equipos_historial',
    timestamps: false,
});

module.exports = EquipoHistorial;