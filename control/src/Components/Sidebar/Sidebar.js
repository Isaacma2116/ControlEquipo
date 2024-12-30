// src/Components/Sidebar/Sidebar.js

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faBars,
  faUsers,
  faDesktop,
  faMobileAlt,
  faTools,
  faTv,
} from '@fortawesome/free-solid-svg-icons';
import './styles/Sidebar.css';
import Colaboradores from './Colaboradores';
import Equipos from './Equipos';
import Celulares from './Celulares';

const Sidebar = ({
  onColaboradorClick,
  onColaboradorListClick,
  onEquipoClick,
  onCelularClick,
  onSoftwareClick,
  onEquipoAnalysisClick,
  onAuxiliaresClick, // Nueva función para manejar auxiliares
}) => {
  const [isColaboradoresVisible, setIsColaboradoresVisible] = useState(false);
  const [isEquiposVisible, setIsEquiposVisible] = useState(false);
  const [isCelularesVisible, setIsCelularesVisible] = useState(false);

  // Alternar visibilidad de Colaboradores
  const toggleColaboradoresVisibility = () => {
    setIsColaboradoresVisible(!isColaboradoresVisible);
  };

  // Alternar visibilidad de Equipos
  const toggleEquiposVisibility = () => {
    setIsEquiposVisible(!isEquiposVisible);
  };

  // Alternar visibilidad de Celulares
  const toggleCelularesVisibility = () => {
    setIsCelularesVisible(!isCelularesVisible);
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="SysLink Logo" className="logo" />
      </div>

      {/* Colaboradores */}
      <div
        className="menu-item"
        onClick={() => {
          toggleColaboradoresVisibility();
          onColaboradorListClick();
        }}
      >
        <h2>
          <FontAwesomeIcon icon={faUsers} className="menu-icon" /> Colaboradores
          {isColaboradoresVisible ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} />
          )}
        </h2>
      </div>
      {isColaboradoresVisible && <Colaboradores onColaboradorClick={onColaboradorClick} />}

      {/* Equipos */}
      <div className="menu-item" onClick={toggleEquiposVisibility}>
        <h2>
          <FontAwesomeIcon icon={faDesktop} className="menu-icon" /> Equipos
          {isEquiposVisible ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} />
          )}
        </h2>
      </div>
      {isEquiposVisible && <Equipos onEquipoClick={onEquipoClick} />}

      {/* Celulares */}
      <div className="menu-item" onClick={toggleCelularesVisibility}>
        <h2>
          <FontAwesomeIcon icon={faMobileAlt} className="menu-icon" /> Celulares
          {isCelularesVisible ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} />
          )}
        </h2>
      </div>
      {isCelularesVisible && <Celulares onCelularClick={onCelularClick} />}

      {/* Software */}
      <div className="menu-item" onClick={onSoftwareClick}>
        <h2>
          <FontAwesomeIcon icon={faTools} className="menu-icon" /> Software
          <FontAwesomeIcon icon={faChevronRight} />
        </h2>
      </div>

      {/* Análisis de Equipos */}
      <div className="menu-item" onClick={onEquipoAnalysisClick}>
        <h2>
          <FontAwesomeIcon icon={faDesktop} className="menu-icon" /> Análisis de Equipos
        </h2>
      </div>

      {/* Auxiliares */}
      <div className="menu-item" onClick={onAuxiliaresClick}>
        <h2>
          <FontAwesomeIcon icon={faTv} className="menu-icon" /> Auxiliares
          <FontAwesomeIcon icon={faChevronRight} />
        </h2>
      </div>
    </div>
  );
};

export default Sidebar;
