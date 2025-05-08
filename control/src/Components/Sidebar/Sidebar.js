import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faUsers,
  faDesktop,
  faMobileAlt,
  faTools,
  faTv,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
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
  onAuxiliaresClick,
}) => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? null : section));
    if (section === 'colaboradores') onColaboradorListClick();
  };

  return (
    <div className="sidebar-container">
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="SysLink Logo" className="logo" />
      </div>

      {/* Menú */}
      <div className="menu">
        <SidebarItem
          icon={faUsers}
          label="Colaboradores"
          isOpen={activeSection === 'colaboradores'}
          onClick={() => toggleSection('colaboradores')}
        />
        <AnimatePresence>
          {activeSection === 'colaboradores' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="submenu"
            >
              <Colaboradores onColaboradorClick={onColaboradorClick} />
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarItem
          icon={faDesktop}
          label="Equipos"
          isOpen={activeSection === 'equipos'}
          onClick={() => toggleSection('equipos')}
        />
        <AnimatePresence>
          {activeSection === 'equipos' && (
            <motion.div className="submenu" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
              <Equipos onEquipoClick={onEquipoClick} />
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarItem
          icon={faMobileAlt}
          label="Celulares"
          isOpen={activeSection === 'celulares'}
          onClick={() => toggleSection('celulares')}
        />
        <AnimatePresence>
          {activeSection === 'celulares' && (
            <motion.div className="submenu" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
              <Celulares onCelularClick={onCelularClick} />
            </motion.div>
          )}
        </AnimatePresence>

        <SidebarItem
          icon={faTools}
          label="Software"
          onClick={onSoftwareClick}
        />

        <SidebarItem
          icon={faDesktop}
          label="Análisis de Equipos"
          onClick={onEquipoAnalysisClick}
        />

        <SidebarItem
          icon={faTv}
          label="Auxiliares"
          onClick={onAuxiliaresClick}
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, isOpen }) => (
  <div className="sidebar-item" onClick={onClick}>
    <div className="item-content">
      <FontAwesomeIcon icon={icon} className="item-icon" />
      <span className="item-label">{label}</span>
    </div>
    {isOpen !== undefined && (
      <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} className="chevron-icon" />
    )}
  </div>
);

export default Sidebar;