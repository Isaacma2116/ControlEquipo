// src/Pages/Home.js

import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar/Sidebar'; // Importa el Sidebar para la navegación
import DetailPanel from '../Components/DetailPanel/DetailPanel'; // Importa el DetailPanel para mostrar detalles
import './styles/Home.css';

const Home = () => {
  // Estado para almacenar el ID y tipo seleccionado
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('colaborador-list'); // Valor inicial predeterminado

  // Manejadores para cambiar el tipo de vista y el ID de acuerdo a lo que se selecciona en la barra lateral
  const handleColaboradorClick = (id) => {
    setSelectedId(id); // Establece el ID del colaborador seleccionado
    setSelectedType('colaborador'); // Establece el tipo de vista como 'colaborador'
  };

  const handleEquipoClick = (id) => {
    setSelectedId(id); // Establece el ID del equipo seleccionado
    setSelectedType('equipo'); // Establece el tipo de vista como 'equipo'
  };

  const handleColaboradorListClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('colaborador-list'); // Cambia la vista a la lista de colaboradores
  };

  const handleCelularClick = (id) => {
    setSelectedId(id); // Establece el ID del celular seleccionado
    setSelectedType('celular'); // Establece el tipo de vista como 'celular'
  };

  const handleCelularListClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('celular-list'); // Cambia la vista a la lista de celulares
  };

  const handleSoftwareClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('software'); // Cambia la vista a la lista de software
  };

  const handleEquipoAnalysisClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('equipo-analysis'); // Cambia la vista a análisis de equipos
  };

  const handleHistorialClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('historial'); // Cambia la vista a historial
  };

  const handleEquiposAsociadosClick = () => {
    setSelectedId(null); // No es necesario un ID específico para esta vista
    setSelectedType('equipos-asociados'); // Cambia la vista a los equipos asociados
  };

  const handleAuxiliaresClick = () => {
    setSelectedId(null); // Resetea el ID seleccionado
    setSelectedType('auxiliares'); // Cambia la vista a Auxiliares
  };

  return (
    <div className="home-container">
      <Sidebar
        onColaboradorClick={handleColaboradorClick}
        onColaboradorListClick={handleColaboradorListClick}
        onEquipoClick={handleEquipoClick} // Asegúrate de pasar la función aquí
        onCelularClick={handleCelularClick}
        onCelularListClick={handleCelularListClick}
        onSoftwareClick={handleSoftwareClick}
        onEquipoAnalysisClick={handleEquipoAnalysisClick}
        onHistorialClick={handleHistorialClick}
        onEquiposAsociadosClick={handleEquiposAsociadosClick}
        onAuxiliaresClick={handleAuxiliaresClick} // Nuevo manejador
      />
      <DetailPanel
        id={selectedId}
        tipo={selectedType}
        onShowHistorial={handleHistorialClick} // Opcional, dependiendo de tu implementación
      />
    </div>
  );
};

export default Home;
