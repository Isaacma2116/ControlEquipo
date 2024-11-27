import React, { useState, useEffect } from 'react';
import ColaboradorDetail from './Infocompleta/ColaboradorDetail';
import EquipoCompleto from './Infocompleta/EquipoCompleto';
import EquiposAsociados from './Infocompleta/Forms/EquiposAsociados';
import SoftwareList from './Infocompleta/SoftwareList';
import EquipoAnalysis from './Infocompleta/EquipoAnalysis';
import Historial from './Infocompleta/Historial';
import GroupedNames from './Infocompleta/GroupedNames';

const DetailPanel = ({ id, tipo: initialTipo, onShowHistorial }) => {
  const [tipo, setTipo] = useState(initialTipo || ''); // Estado para manejar el tipo
  const [equiposAsociados, setEquiposAsociados] = useState([]); // Lista de equipos asociados para el modal

  useEffect(() => {
    setTipo(initialTipo || '');
  }, [initialTipo]);

  // Simulación de obtener equipos asociados
  const handleObtenerEquiposAsociados = () => {
    const equipos = [
      { id_equipos: 1, tipoDispositivo: 'Laptop', marca: 'HP', modelo: 'EliteBook' },
      { id_equipos: 2, tipoDispositivo: 'Monitor', marca: 'Dell', modelo: 'P2419H' }
    ];
    setEquiposAsociados(equipos);
    setTipo('equipos-asociados');
  };

  // Función para manejar clic en un equipo
  const handleEquipoClick = (idEquipo) => {
    console.log(`Clicked equipo con ID: ${idEquipo}`);
    // Aquí puedes añadir lógica para cambiar el contenido
    setTipo('equipo'); // Cambiar el tipo para mostrar la información completa del equipo
  };

  if (!id && tipo !== 'equipo-analysis' && tipo !== 'software' && tipo !== 'historial' && tipo !== 'grouped-names' && tipo !== 'equipos-asociados') {
    return <p>No se ha seleccionado ningún elemento.</p>;
  }

  // Renderizado del componente correspondiente
  if (tipo === 'colaborador') {
    return <ColaboradorDetail colaboradorId={id} />;
  } else if (tipo === 'equipo') {
    return <EquipoCompleto idEquipo={id} onShowHistorial={onShowHistorial} />;
  } else if (tipo === 'equipos-asociados') {
    console.log("handleEquipoClick in DetailPanel:", handleEquipoClick); // Asegúrate de que la función esté definida
    return (
      <EquiposAsociados
        equipos={equiposAsociados}
        showModal={true}
        setShowModal={() => setTipo('')} // Función para cerrar el modal
        onEquipoClick={handleEquipoClick} // Pasar la función handleEquipoClick como prop
      />
    );
  } else if (tipo === 'software') {
    return <SoftwareList onChangeTipo={setTipo} />;
  } else if (tipo === 'equipo-analysis') {
    return <EquipoAnalysis />;
  } else if (tipo === 'historial') {
    return <Historial />;
  } else if (tipo === 'grouped-names') {
    return <GroupedNames />;
  }

  return <p>Seleccione un elemento para ver detalles.</p>;
};

export default DetailPanel;
