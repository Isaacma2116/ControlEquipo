// src/Components/DetailPanel/DetailPanel.js

import React, { useEffect, useState } from 'react';
import ColaboradorList from './Infocompleta/ColaboradorList';
import ColaboradorDetail from './Infocompleta/ColaboradorDetail';
import EquipoCompleto from './Infocompleta/EquipoCompleto';
import EquiposAsociados from './Infocompleta/Forms/EquiposAsociados';
import SoftwareList from './Infocompleta/SoftwareList';
import EquipoAnalysis from './Infocompleta/EquipoAnalysis';
import Historial from './Infocompleta/Historial';
import GroupedNames from './Infocompleta/GroupedNames';
import CelularDetail from './Infocompleta/CelularDetail';
import AuxiliaresList from './Infocompleta/AuxiliaresList'; // Importar AuxiliaresList
import './DetailPanel.css';

const DetailPanel = ({ id: initialId, tipo: initialTipo, onShowHistorial }) => {
  const [id, setId] = useState(initialId || null); // ID del elemento seleccionado
  const [tipo, setTipo] = useState(initialTipo || 'colaborador-list'); // Tipo de vista seleccionada
  const [history, setHistory] = useState([]); // Historial interno de navegación
  const [currentIndex, setCurrentIndex] = useState(0); // Índice actual en el historial
  const [equiposAsociados, setEquiposAsociados] = useState([]); // Equipos asociados cargados
  const [loading, setLoading] = useState(false); // Indicador de carga

  useEffect(() => {
    setTipo(initialTipo || 'colaborador-list');
    setId(initialId || null);
    setHistory([{ tipo: initialTipo || 'colaborador-list', id: initialId }]);
    setCurrentIndex(0);
  }, [initialTipo, initialId]);

  // Navegación entre secciones
  const navigateTo = (newTipo, newId = null) => {
    if (!newTipo) return; // Evita navegación inválida
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ tipo: newTipo, id: newId });
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setTipo(newTipo);
    setId(newId);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const prev = history[currentIndex - 1];
      setTipo(prev.tipo);
      setId(prev.id);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const next = history[currentIndex + 1];
      setTipo(next.tipo);
      setId(next.id);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Manejador para mostrar detalles de un colaborador
  const handleViewColaboradorDetail = (colaboradorId) => {
    navigateTo('colaborador', colaboradorId);
  };

  // Manejador para mostrar detalles de un equipo
  const handleEquipoClick = (idEquipo) => {
    navigateTo('equipo', idEquipo);
  };

  // Cargar equipos asociados (ejemplo simulado)
  const handleObtenerEquiposAsociados = async () => {
    setLoading(true);
    try {
      const equipos = [
        { id_equipos: 1, tipoDispositivo: 'Laptop', marca: 'HP', modelo: 'EliteBook' },
        { id_equipos: 2, tipoDispositivo: 'Monitor', marca: 'Dell', modelo: 'P2419H' },
      ];
      setEquiposAsociados(equipos);
      navigateTo('equipos-asociados');
    } catch (error) {
      console.error('Error al cargar los equipos asociados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lista de tipos válidos para renderizar
  const validTipos = [
    'colaborador-list',
    'colaborador',
    'equipo',
    'equipos-asociados',
    'software',
    'equipo-analysis',
    'historial',
    'grouped-names',
    'celular',
    'auxiliares', // Agregar 'auxiliares' como tipo válido
  ];

  if (!validTipos.includes(tipo)) {
    return <p>No se ha seleccionado ningún elemento.</p>;
  }

  return (
    <div className="detail-panel">
      {/* Botones de Navegación */}
      <div className="navigation-buttons">
        {currentIndex > 0 && (
          <button onClick={goBack} className="nav-button">
            ← Regresar
          </button>
        )}
        {currentIndex < history.length - 1 && (
          <button onClick={goForward} className="nav-button">
            Avanzar →
          </button>
        )}
      </div>

      {/* Renderización de Componentes según 'tipo' */}
      {(() => {
        switch (tipo) {
          case 'colaborador-list':
            return <ColaboradorList onViewDetail={handleViewColaboradorDetail} />;

          case 'colaborador':
            return (
              <ColaboradorDetail
                colaboradorId={id}
                onEquipoClick={handleEquipoClick}
              />
            );

          case 'equipo':
            return (
              <EquipoCompleto
                idEquipo={id}
                onColaboradorClick={(colaboradorId) => navigateTo('colaborador', colaboradorId)}
                onGoToSoftware={() => navigateTo('software')}
              />
            );

          case 'equipos-asociados':
            return loading ? (
              <p>Cargando equipos asociados...</p>
            ) : (
              <EquiposAsociados equipos={equiposAsociados} onEquipoClick={handleEquipoClick} />
            );

          case 'software':
            return <SoftwareList onChangeTipo={setTipo} />;

          case 'equipo-analysis':
            return <EquipoAnalysis />;

          case 'historial':
            return <Historial />;

          // AQUÍ ESTÁ EL CAMBIO IMPORTANTE:
          case 'grouped-names':
            // Pasamos la prop 'onChangeTipo' para que el botón "Regresar" funcione
            return <GroupedNames onChangeTipo={setTipo} />;

          case 'celular':
            return <CelularDetail celularId={id} />;

          case 'auxiliares':
            return <AuxiliaresList onChangeTipo={setTipo} />;

          default:
            return <p>Seleccione un elemento para ver detalles.</p>;
        }
      })()}
    </div>
  );
};

export default DetailPanel;
