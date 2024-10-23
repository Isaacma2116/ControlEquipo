import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar/Sidebar';
import DetailPanel from '../Components/DetailPanel/DetailPanel';

const Home = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        onColaboradorClick={handleColaboradorClick}
        onEquipoClick={handleEquipoClick}
        onSoftwareClick={handleSoftwareClick} // Añadir el manejador para software
      />
      {selectedId && <DetailPanel id={selectedId} tipo={selectedType} />}
    </div>
  );
};

export default Home;
