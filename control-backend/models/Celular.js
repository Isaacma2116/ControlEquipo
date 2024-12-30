const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Colaborador = require('./Colaborador'); // Importamos el modelo de Colaborador

const Celular = sequelize.define(
  'Celular',
  {
    idmovil: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    imei: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [15, 20], // El IMEI debe tener entre 15 y 20 caracteres
        isNumeric: true,
      },
    },
    numeroDeSerie: { // Campo añadido
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // El número de serie debe ser único
      validate: {
        len: [1, 100], // Longitud mínima y máxima opcional
      },
    },
    contrasena_o_pin: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    correoAsociado: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    contrasenaDelCorreo: {
      type: DataTypes.STRING(100),
      allowNull: true, // Permitir valores nulos si no es obligatorio
    },
    componentesDelCelular: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    renovacionDelEquipo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idColaborador: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir valores nulos
      references: {
        model: Colaborador,
        key: 'id',
      },
    },
  },
  {
    tableName: 'celulares',
    timestamps: false, // Deshabilita las marcas de tiempo (createdAt, updatedAt)
  }
);

// Relaciones
Celular.belongsTo(Colaborador, {
  as: 'colaborador',
  foreignKey: 'idColaborador',
});

module.exports = Celular;
