import React from 'react';
import ColaboradorDetail from './Infocompleta/ColaboradorDetail';
import EquipoCompleto from './Infocompleta/EquipoCompleto';
import SoftwareList from './Infocompleta/SoftwareList'; // Cambiar a SoftwareList para mostrar todos los software
import EquipoAnalysis from './Infocompleta/EquipoAnalysis';  // Asegúrate de importar correctamente

const DetailPanel = ({ id, tipo }) => {
  // Verificar si no hay un ID y no se trata de equipo-analysis
  if (!id && tipo !== 'equipo-analysis' && tipo !== 'software') {
    return <p>No se ha seleccionado ningún elemento.</p>;
  }

  if (tipo === 'colaborador') {
    return <ColaboradorDetail colaboradorId={id} />;
  } else if (tipo === 'equipo') {
    return <EquipoCompleto idEquipo={id} />;
  } else if (tipo === 'software') {
    // Mostrar la lista de software si tipo es 'software'
    return <SoftwareList />;
  } else if (tipo === 'equipo-analysis') {
    return <EquipoAnalysis />;
  }

  return <p>Seleccione un elemento para ver detalles.</p>;
};

export default DetailPanel;
