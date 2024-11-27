const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de importar la instancia de sequelize
const Equipo = require('./Equipo'); // Importar el modelo Equipo si es necesario para las relaciones

// Definir el modelo Auxiliar
const Auxiliar = sequelize.define('Auxiliar', {
    id_auxiliar: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_equipo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Equipo, // Relación con el modelo Equipo
            key: 'id_equipos'
        }
    },
    nombre_auxiliar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero_serie_aux: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'auxiliares',
    timestamps: false // No usar timestamps automáticos
});

// Definir la relación con `Equipo` si es necesario
Auxiliar.associate = (models) => {
    Auxiliar.belongsTo(models.Equipo, {
        foreignKey: 'id_equipo',
        as: 'equipo'
    });
};

module.exports = Auxiliar;
