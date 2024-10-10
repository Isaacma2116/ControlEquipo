import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './styles/Sidebar.css';
import Colaboradores from './Colaboradores';
import Equipos from './Equipos';

const Sidebar = ({ onColaboradorClick, onEquipoClick }) => {
  const [isColaboradoresVisible, setIsColaboradoresVisible] = useState(false);
  const [isEquiposVisible, setIsEquiposVisible] = useState(false);

  const toggleColaboradoresVisibility = () => {
    setIsColaboradoresVisible(!isColaboradoresVisible);
  };

  const toggleEquiposVisibility = () => {
    setIsEquiposVisible(!isEquiposVisible);
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
    </div>
  );
};

export default Sidebar;
