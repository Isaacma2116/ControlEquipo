import React from 'react';
import ColaboradorDetail from './Infocompleta/ColaboradorDetail';
import EquipoCompleto from './Infocompleta/EquipoCompleto';
import SoftwareDetail from './Infocompleta/SoftwareDetail';  // Asegúrate de importar correctamente

const DetailPanel = ({ id, tipo }) => {
  if (tipo === 'colaborador') {
    return <ColaboradorDetail colaboradorId={id} />;
  } else if (tipo === 'equipo') {
    return <EquipoCompleto idEquipo={id} />;
  } else if (tipo === 'software') {
    return <SoftwareDetail softwareId={id} />;
  }

  return <p>Seleccione un elemento para ver detalles.</p>;
};

export default DetailPanel;
