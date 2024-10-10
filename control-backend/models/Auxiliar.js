const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Equipo = require('./Equipo');  // Importamos el modelo Equipo

const Auxiliar = sequelize.define('Auxiliar', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_auxiliar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero_serie_aux: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_equipos: {
        type: DataTypes.INTEGER,
        references: {
            model: Equipo,  // Hace referencia al modelo Equipo
            key: 'id'
        },
        allowNull: false
    }
}, {
    tableName: 'auxiliares',
    timestamps: false
});

Auxiliar.belongsTo(Equipo, { foreignKey: 'id_equipos', as: 'equipo' });
Equipo.hasMany(Auxiliar, { foreignKey: 'id_equipos', as: 'auxiliares' });

module.exports = Auxiliar;
