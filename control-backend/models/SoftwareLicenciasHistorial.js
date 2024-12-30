// models/SoftwareLicenciasHistorial.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de que la ruta es correcta

class SoftwareLicenciasHistorial extends Model {}

SoftwareLicenciasHistorial.init(
  {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_licencia_original: {
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
    },
    estado_renovacion: {
      type: DataTypes.ENUM('activa', 'caducada'),
      allowNull: false,
      defaultValue: 'activa', // Valor predeterminado
    },
    fecha_operacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accion: {
      type: DataTypes.ENUM('insertar', 'editar', 'borrar'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SoftwareLicenciasHistorial',
    tableName: 'software_licencias_historial',
    timestamps: false,
  }
);

module.exports = SoftwareLicenciasHistorial;
