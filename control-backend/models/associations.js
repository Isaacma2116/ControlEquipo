const Software = require('./Software'); // Asegúrate de que esta línea esté correcta
const SoftwareEquipos = require('./SoftwareEquipos'); // Verifica esto también

// Define las asociaciones
Software.hasMany(SoftwareEquipos, { foreignKey: 'id_software', as: 'softwareEquipos' });
SoftwareEquipos.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

module.exports = { Software, SoftwareEquipos };
