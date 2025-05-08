// models/SoftwareEquiposHistorial.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SoftwareEquiposHistorial extends Model {}

SoftwareEquiposHistorial.init({
  // Clave primaria independiente para la tabla de historial
  id_historial: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Referencia al registro original de software_equipos
  id_software_equipo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Campos "espejo" de SoftwareEquipos
  id_software: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_equipos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_licencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fechaAsignacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estado_asignacion: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
  },
  // Campos adicionales solicitados
  fecha_operacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  accion: {
    type: DataTypes.ENUM('insertar', 'editar', 'borrar'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'SoftwareEquiposHistorial',
  tableName: 'software_equipos_historial',
  timestamps: false,
});

module.exports = SoftwareEquiposHistorial;
