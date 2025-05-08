const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Equipo = require('./Equipo');

const Colaborador = sequelize.define(
  'Colaborador',
  {
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
        is: /^\d{10}$/, // Validación para un número de 10 dígitos
      },
    },
    telefono_smex: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\d{10}$/, // Validación para un número de 10 dígitos
      },
    },
    correo_smex: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidDomain(value) {
          if (value && !value.endsWith('@shonanmexico.com.mx')) {
            throw new Error(
              'El correo debe pertenecer al dominio @shonanmexico.com.mx'
            );
          }
        },
      },
    },
    fotografia: {
      type: DataTypes.STRING,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Por defecto, los colaboradores están activos
    },
  },
  {
    tableName: 'colaboradores',
    timestamps: false,
  }
);

// Relaciones
Colaborador.hasMany(Equipo, {
  as: 'equipos',
  foreignKey: 'idColaborador',
});

module.exports = Colaborador;
