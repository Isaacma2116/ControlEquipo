const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auxiliar = sequelize.define('Auxiliar', {
  id_auxiliar: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_equipo: {
    type: DataTypes.STRING,
    allowNull: true, // Permitir null para "Sin Uso"
    references: {
      model: 'equipos',
      key: 'id_equipos',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Cambiar a SET NULL para dejar "Sin Uso"
  },
  nombre_auxiliar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero_serie_aux: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estadoActivo: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1, // Por defecto, todos los auxiliares estarán activos
  },
}, {
  tableName: 'auxiliares',
  timestamps: false,
});

// Exportar el modelo
module.exports = Auxiliar;
