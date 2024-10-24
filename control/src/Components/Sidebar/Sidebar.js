import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './styles/Sidebar.css';
import Colaboradores from './Colaboradores';
import Equipos from './Equipos';
import Celulares from './Celulares'; // Importa el componente de Celulares
import Software from './Software'; // Importa el componente de Software

const Sidebar = ({ onColaboradorClick, onEquipoClick, onCelularClick, onSoftwareClick, onEquipoAnalysisClick }) => {
  const [isColaboradoresVisible, setIsColaboradoresVisible] = useState(false);
  const [isEquiposVisible, setIsEquiposVisible] = useState(false);
  const [isCelularesVisible, setIsCelularesVisible] = useState(false); // Estado para la visibilidad de Celulares
  const [isSoftwareVisible, setIsSoftwareVisible] = useState(false); // Estado para la visibilidad de Software
  const [isEquipoAnalysisVisible, setIsEquipoAnalysisVisible] = useState(false); // Estado para la visibilidad de EquipoAnalysis

  const toggleColaboradoresVisibility = () => {
    setIsColaboradoresVisible(!isColaboradoresVisible);
  };

  const toggleEquiposVisibility = () => {
    setIsEquiposVisible(!isEquiposVisible);
  };

  const toggleCelularesVisibility = () => {
    setIsCelularesVisible(!isCelularesVisible);
  };

  const toggleSoftwareVisibility = () => {
    setIsSoftwareVisible(!isSoftwareVisible);
  };

  const handleEquipoAnalysisClick = () => {
    onEquipoAnalysisClick(); // Aquí llamamos directamente la función sin lista
  };

  return (
    <div className="sidebar">
      <h1>Menú</h1>

      {/* Sección de Colaboradores */}
      <div className="menu-item" onClick={toggleColaboradoresVisibility}>
        <h2>
          Colaboradores {isColaboradoresVisible ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
        </h2>
      </div>
      {isColaboradoresVisible && <Colaboradores onColaboradorClick={onColaboradorClick} />}

      {/* Sección de Equipos */}
      <div className="menu-item" onClick={toggleEquiposVisibility}>
        <h2>
          Equipos {isEquiposVisible ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
        </h2>
      </div>
      {isEquiposVisible && <Equipos onEquipoClick={onEquipoClick} />}

      {/* Sección de Celulares */}
      <div className="menu-item" onClick={toggleCelularesVisibility}>
        <h2>
          Celulares {isCelularesVisible ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
        </h2>
      </div>
      {isCelularesVisible && <Celulares onCelularClick={onCelularClick} />}

      {/* Sección de Software */}
      <div className="menu-item" onClick={toggleSoftwareVisibility}>
        <h2>
          Software {isSoftwareVisible ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
        </h2>
      </div>
      {isSoftwareVisible && <Software onSoftwareClick={onSoftwareClick} />}

      {/* Sección de EquipoAnalysis */}
      <div className="menu-item" onClick={handleEquipoAnalysisClick}>
        <h2>
          Análisis de Equipos
        </h2>
      </div>
    </div>
  );
};

export default Sidebar;
