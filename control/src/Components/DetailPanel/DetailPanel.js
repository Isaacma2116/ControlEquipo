import React from 'react';
import ColaboradorDetail from './Infocompleta/ColaboradorDetail';
import EquipoCompleto from './Infocompleta/EquipoCompleto';

const DetailPanel = ({ id, tipo }) => {
  if (tipo === 'colaborador') {
    return <ColaboradorDetail colaboradorId={id} />;
  } else if (tipo === 'equipo') {
    return <EquipoCompleto idEquipo={id} />;
  }

  return <p>Seleccione un elemento para ver detalles.</p>;
};

export default DetailPanel;
