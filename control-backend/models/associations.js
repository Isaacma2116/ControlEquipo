// models/associations.js

const Software = require('./Software');
const SoftwareEquipos = require('./SoftwareEquipos');
const SoftwareLicencias = require('./SoftwareLicencias');
const SoftwareHistorial = require('./SoftwareHistorial');
const SoftwareEquiposHistorial = require('./SoftwareEquiposHistorial');
const SoftwareLicenciasHistorial = require('./SoftwareLicenciasHistorial');
const Equipo = require('./Equipo');
const Auxiliar = require('./Auxiliar');

// Asegúrate de que todos los modelos estén correctamente importados
// y que cada uno extiende de Sequelize.Model

// Definir asociaciones para Software
Software.hasMany(SoftwareEquipos, { foreignKey: 'id_software', as: 'equiposAsociados' });
SoftwareEquipos.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

Software.hasMany(SoftwareLicencias, { foreignKey: 'id_software', as: 'licencias' });
SoftwareLicencias.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

Software.hasMany(SoftwareHistorial, { foreignKey: 'id_software', as: 'historial' });
SoftwareHistorial.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

// Asociaciones para SoftwareLicenciasHistorial
SoftwareLicencias.hasMany(SoftwareLicenciasHistorial, { foreignKey: 'id_licencia_original', as: 'historial' });
SoftwareLicenciasHistorial.belongsTo(SoftwareLicencias, { foreignKey: 'id_licencia_original', as: 'softwareLicencia' });

// Asociaciones para SoftwareEquiposHistorial
SoftwareEquipos.hasMany(SoftwareEquiposHistorial, { foreignKey: 'id_software_equipo', as: 'historial' });
SoftwareEquiposHistorial.belongsTo(SoftwareEquipos, { foreignKey: 'id_software_equipo', as: 'softwareEquipo' });

// Asociaciones para Equipo y SoftwareEquipos
Equipo.hasMany(SoftwareEquipos, { foreignKey: 'id_equipos', as: 'softwareEquipos' });
SoftwareEquipos.belongsTo(Equipo, { foreignKey: 'id_equipos', as: 'equipo' });

// Asociaciones para Equipo y Auxiliar
Equipo.hasMany(Auxiliar, { foreignKey: 'id_equipo', as: 'auxiliares' });
Auxiliar.belongsTo(Equipo, { foreignKey: 'id_equipo', as: 'equipo' });

module.exports = {
  Software,
  SoftwareEquipos,
  SoftwareLicencias,
  SoftwareHistorial,
  SoftwareEquiposHistorial,
  SoftwareLicenciasHistorial,
  Equipo,
  Auxiliar,
};
