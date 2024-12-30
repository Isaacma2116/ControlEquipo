// models/SoftwareHistorial.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SoftwareHistorial extends Model {}

SoftwareHistorial.init({
  // Clave primaria de la tabla de historial
  id_historial: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Referencia al software original
  id_software: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Campos "espejo" de Software
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
    defaultValue: 1,
  },
  // Campos adicionales solicitados
  fecha_operacion: {
    type: DataTypes.DATE, // o DataTypes.DATE(3) si quieres milisegundos
    allowNull: false,
  },
  accion: {
    type: DataTypes.ENUM('insertar', 'editar', 'borrar'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'SoftwareHistorial',
  tableName: 'software_historial',
  timestamps: false,
});

module.exports = SoftwareHistorial;
