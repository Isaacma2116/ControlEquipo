const LicenciasEquipos = sequelize.define('LicenciasEquipos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_licencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_equipo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado_asignacion: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
    },
    fecha_asignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'licencias_equipos',
    timestamps: false,
});

module.exports = LicenciasEquipos;
