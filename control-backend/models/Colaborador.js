const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Colaborador = sequelize.define('Colaborador', {
  id_empleado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area: {
    type: DataTypes.STRING,
  },
  cargo: {
    type: DataTypes.STRING,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  telefono_personal: {
    type: DataTypes.STRING,
    validate: {
      is: /^\d{10}$/,
    },
  },
  correo_smex: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmailOrNull(value) {
        if (value && value !== '' && !/\S+@\S+\.\S+/.test(value)) {
          throw new Error('El correo SMex debe ser una dirección de correo válida o estar vacío');
        }
        if (value && !value.endsWith('@shonanmexico.com.mx')) {
          throw new Error('El correo debe pertenecer al dominio @shonanmexico.com.mx');
        }
      },
    },
  },
  fotografia: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'colaboradores',
  timestamps: false,
});

module.exports = Colaborador;
