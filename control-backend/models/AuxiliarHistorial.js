const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import sequelize instance

const AuxiliarHistorial = sequelize.define('AuxiliarHistorial', {
  id_auxiliar_historial: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_auxiliar: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_auxiliar: {
    type: DataTypes.STRING,
  },
  numero_serie_aux: {
    type: DataTypes.STRING,
  },
  id_equipo: {
    type: DataTypes.STRING,
  },
  operacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_operacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = AuxiliarHistorial;
