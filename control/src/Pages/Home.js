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
    setSelectedType('equipo');
  };

  const handleSoftwareClick = (id) => {
    setSelectedId(id);
    setSelectedType('software');
  };

  // Manejador para Equipo Analysis
  const handleEquipoAnalysisClick = () => {
    setSelectedId(null);  // Si no necesitas un ID específico
    setSelectedType('equipo-analysis');  // Cambia el tipo para mostrar el análisis
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        onColaboradorClick={handleColaboradorClick}
        onEquipoClick={handleEquipoClick}
        onSoftwareClick={handleSoftwareClick}
        onEquipoAnalysisClick={handleEquipoAnalysisClick}  // Asegúrate de pasar esta función al Sidebar
      />
      {selectedType && <DetailPanel id={selectedId} tipo={selectedType} />}
    </div>
  );
};

export default Home;
