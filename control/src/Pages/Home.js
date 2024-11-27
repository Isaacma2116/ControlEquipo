import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar/Sidebar';
import DetailPanel from '../Components/DetailPanel/DetailPanel';

const Home = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Manejadores para los diferentes tipos de selección
  const handleColaboradorClick = (id) => {
    setSelectedId(id);
    setSelectedType('colaborador');
  };

  const handleEquipoClick = (id) => {
    setSelectedId(id);
    setSelectedType('equipo');  // Al hacer clic en un equipo, seteamos el tipo como 'equipo'
  };

  const handleSoftwareClick = () => {
    setSelectedId(null);
    setSelectedType('software');
  };

  const handleEquipoAnalysisClick = () => {
    setSelectedId(null);
    setSelectedType('equipo-analysis');
  };

  // Manejador para Historial
  const handleHistorialClick = () => {
    setSelectedId(null);
    setSelectedType('historial');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        onColaboradorClick={handleColaboradorClick}
        onEquipoClick={handleEquipoClick}  // Asegúrate de pasar `handleEquipoClick` aquí
        onSoftwareClick={handleSoftwareClick}
        onEquipoAnalysisClick={handleEquipoAnalysisClick}
        onHistorialClick={handleHistorialClick}
      />
      {selectedType && <DetailPanel id={selectedId} tipo={selectedType} />}
    </div>
  );
};

export default Home;
