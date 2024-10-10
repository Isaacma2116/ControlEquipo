const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Equipo = require('./Equipo');  // Importamos el modelo Equipo

const Pantalla = sequelize.define('Pantalla', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_pantalla: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_pantalla: {
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
    tableName: 'pantallas',
    timestamps: false
});

Pantalla.belongsTo(Equipo, { foreignKey: 'id_equipos', as: 'equipo' });
Equipo.hasMany(Pantalla, { foreignKey: 'id_equipos', as: 'pantallas' });

module.exports = Pantalla;
