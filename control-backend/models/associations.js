const Equipo = require('./Equipo');
const Auxiliar = require('./Auxiliar');
const Software = require('./Software');
const SoftwareEquipos = require('./SoftwareEquipos');
const SoftwareLicencias = require('./SoftwareLicencias');
const SoftwareHistorial = require('./SoftwareHistorial');
const SoftwareEquiposHistorial = require('./SoftwareEquiposHistorial');
const SoftwareLicenciasHistorial = require('./SoftwareLicenciasHistorial');

// Definir asociaciones para Software
Software.hasMany(SoftwareEquipos, { foreignKey: 'id_software', as: 'equiposAsociados' });
SoftwareEquipos.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

Software.hasMany(SoftwareLicencias, { foreignKey: 'id_software', as: 'licencias' });
SoftwareLicencias.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

// Asociaciones para SoftwareHistorial
Software.hasMany(SoftwareHistorial, { foreignKey: 'id_software', as: 'historial' });
SoftwareHistorial.belongsTo(Software, { foreignKey: 'id_software', as: 'software' });

// Asociaciones para SoftwareEquiposHistorial
SoftwareEquipos.hasMany(SoftwareEquiposHistorial, { foreignKey: 'id', as: 'historial' });
SoftwareEquiposHistorial.belongsTo(SoftwareEquipos, { foreignKey: 'id', as: 'softwareEquipo' });

// Asociaciones para SoftwareLicenciasHistorial
SoftwareLicencias.hasMany(SoftwareLicenciasHistorial, { foreignKey: 'id_licencia', as: 'historial' });
SoftwareLicenciasHistorial.belongsTo(SoftwareLicencias, { foreignKey: 'id_licencia', as: 'softwareLicencia' });

// Definir asociaciones para Equipo y Auxiliar
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
