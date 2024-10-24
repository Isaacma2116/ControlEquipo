const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Software = sequelize.define('Software', {
    id_software: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false // Este campo es obligatorio
    },
    version: {
        type: DataTypes.STRING,
        allowNull: true // Opcional
    },
    fecha_adquisicion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW // Asignar la fecha actual como valor por defecto
    },
    fecha_caducidad: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tipo_licencia: {
        type: DataTypes.ENUM('mensual', 'anual', 'vitalicia'),
        allowNull: true,
        defaultValue: 'mensual' // Valor por defecto para evitar nulos
    },
    clave_licencia: {
        type: DataTypes.STRING,
        allowNull: true // Clave opcional
    },
    correo_asociado: {
        type: DataTypes.STRING,
        allowNull: true // No siempre es necesario
    },
    contrasena_correo: {
        type: DataTypes.STRING,
        allowNull: true // Campo opcional
    },
    estado: {
        type: DataTypes.ENUM('activo', 'sin uso', 'vencido', 'vencido con equipo'),
        allowNull: false // Campo obligatorio, siempre debe tener un estado
    },
    id_equipos: {
        type: DataTypes.STRING(50),  
        allowNull: true // Puede no estar asociado a un equipo
    },
    licencia_caducada: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false // Por defecto, se asume que la licencia no está caducada
    }
}, {
    tableName: 'software',
    timestamps: false // Deshabilitar timestamps si no se utilizan
});

module.exports = Software;
