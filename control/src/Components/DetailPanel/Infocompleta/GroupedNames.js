// src/Components/DetailPanel/Infocompleta/GroupedNames.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import SoftwareEditForm from './Forms/SoftwareEditForm';
import SoftwareForm from './Forms/SoftwareForm';
import SoftwareHistory from './Forms/SoftwareHistory';
import GroupedNamesAnalysis from './Forms/GroupedNamesAnalysis';
import './styles/SoftwareList.css';
import './styles/GroupedNames.css';

const GroupedNames = ({ onChangeTipo = () => {} }) => {
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSoftwareId, setEditSoftwareId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addSoftwareModalIsOpen, setAddSoftwareModalIsOpen] = useState(false);
  const [historyModalIsOpen, setHistoryModalIsOpen] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);
  const [groupedNames, setGroupedNames] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSoftware, setExpandedSoftware] = useState({});
  const [expandedLicenses, setExpandedLicenses] = useState({});
  const [expandedEquipments, setExpandedEquipments] = useState({});

  useEffect(() => {
    Modal.setAppElement('#root'); // Para accesibilidad con React Modal
    fetchSoftware();
  }, []);

  // Consulta a la API para obtener la lista de software (ajusta la ruta a la real)
  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      const softwareList = response.data;
      setSoftwareList(softwareList);
      setGroupedNames(groupSimilarNames(softwareList));
    } catch (err) {
      console.error('Error al cargar la lista de software:', err);
      setError('Error al cargar la lista de software');
    } finally {
      setLoading(false);
    }
  };

  // Función para agrupar nombres parecidos (simplemente agrupa por nombre exacto normalizado)
  const groupSimilarNames = (softwareList) => {
    const groups = [];
    const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, '');

    softwareList.forEach((software) => {
      if (!software.nombre) return;
      const normalized = normalizeName(software.nombre);

      let foundGroup = false;
      for (const group of groups) {
        if (group.some((item) => normalized === normalizeName(item.nombre))) {
          group.push(software);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([software]);
      }
    });

    return groups;
  };

  const toggleGroupExpansion = (index) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSoftwareExpansion = (id) => {
    setExpandedSoftware((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleLicenses = (id) => {
    setExpandedLicenses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleEquipments = (id) => {
    setExpandedEquipments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  // Evento para editar software
  const handleEditClick = (software) => {
    setEditSoftwareId(software.id_software);
    setModalIsOpen(true);
  };

  const handleCloseEditModal = () => {
    setModalIsOpen(false);
    fetchSoftware();
  };

  // Agregar nuevo software
  const handleOpenAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(true);
  };

  const handleCloseAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(false);
    fetchSoftware();
  };

  // Eliminar software (confirmación nativa)
  const handleDeleteClick = async (id_software) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este software?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3550/api/software/${id_software}`);
        fetchSoftware();
      } catch (err) {
        console.error('Error al eliminar el software:', err);
      }
    }
  };

  // Historial
  const handleViewHistory = (id) => {
    setSelectedSoftwareId(id);
    setHistoryModalIsOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalIsOpen(false);
    setSelectedSoftwareId(null);
  };

  // Si está cargando, mostramos un texto de carga
  if (loading) {
    return <div>Cargando software...</div>;
  }

  // Si hubo un error, lo mostramos
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="software-list-container">
      <h1>Nombres Agrupados</h1>

      {/*
        IMPORTANTE: Aquí invocamos la prop 'onChangeTipo' 
        para que cuando hagamos clic en "Regresar", 
        podamos cambiar la vista en DetailPanel.
      */}
      <button
        className="back-button"
        onClick={() => onChangeTipo('software')}
      >
        Regresar a Lista de Software
      </button>

      <button
        className="add-software-button"
        onClick={handleOpenAddSoftwareModal}
      >
        Agregar Nuevo Software
      </button>

      {groupedNames.length === 0 ? (
        <p>No hay nombres agrupados disponibles.</p>
      ) : (
        groupedNames.map((group, index) => (
          <div key={`group-${index}`} className="software-card">
            <div
              className="group-header"
              onClick={() => toggleGroupExpansion(index)}
            >
              <h3>{group[0].nombre}</h3>
              <FontAwesomeIcon
                icon={expandedGroups[index] ? faChevronUp : faChevronDown}
                className="toggle-icon"
              />
            </div>

            {expandedGroups[index] && (
              <div className="group-details">
                {/* Componente de análisis dentro del grupo */}
                <GroupedNamesAnalysis group={group} />

                {group.map((software) => (
                  <div
                    key={software.id_software}
                    className="software-details"
                  >
                    <div className="software-header">
                      <div
                        className="software-summary"
                        onClick={() => toggleSoftwareExpansion(software.id_software)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            toggleSoftwareExpansion(software.id_software);
                          }
                        }}
                      >
                        <h4>{software.nombre}</h4>
                        <p>Versión: {software.version || 'N/A'}</p>
                      </div>

                      <button
                        className="menu-button"
                        onClick={() => toggleMenu(software.id_software)}
                      >
                        <FontAwesomeIcon icon={faCog} />
                      </button>

                      {showMenu === software.id_software && (
                        <div className="dropdown-menu">
                          <button onClick={() => handleEditClick(software)}>
                            Editar
                          </button>
                          <button onClick={() => handleDeleteClick(software.id_software)}>
                            Eliminar
                          </button>
                          <button onClick={() => handleViewHistory(software.id_software)}>
                            Historial
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Detalles adicionales */}
                    {expandedSoftware[software.id_software] && (
                      <div className="software-extra-details">
                        <p>Fecha de Adquisición: {software.fecha_adquisicion}</p>
                        <p>Fecha de Caducidad: {software.fecha_caducidad || 'N/A'}</p>
                        <p>Tipo de Licencia: {software.tipoLicencia}</p>
                        <p>Estado: {software.estado}</p>
                        <p>Licencia Caducada: {software.licenciaCaducada ? 'Sí' : 'No'}</p>
                        <p>Máximo de Licencias: {software.maxDispositivos || 'N/A'}</p>

                        {/* Licencias asociadas */}
                        <button
                          onClick={() => toggleLicenses(software.id_software)}
                        >
                          {expandedLicenses[software.id_software]
                            ? 'Ocultar Licencias'
                            : 'Ver Licencias'}
                        </button>
                        {expandedLicenses[software.id_software] && (
                          <div className="licenses">
                            {software.licencias && software.licencias.length > 0 ? (
                              software.licencias.map((licencia, idx) => (
                                <div key={`${licencia.id_licencia}-${idx}`} className="license-item">
                                  <p>
                                    <strong>Clave de Licencia:</strong>{' '}
                                    {licencia.claveLicencia}
                                  </p>
                                  <p>
                                    <strong>Correo Asociado:</strong>{' '}
                                    {licencia.correoAsociado}
                                  </p>
                                  <p>
                                    <strong>Estado de Renovación:</strong>{' '}
                                    {licencia.estadoRenovacion}
                                  </p>
                                  <p>
                                    <strong>Licencia Compartida:</strong>{' '}
                                    {licencia.compartida ? 'Sí' : 'No'}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p>No hay licencias asociadas.</p>
                            )}
                          </div>
                        )}

                        {/* Equipos asociados */}
                        <button
                          onClick={() => toggleEquipments(software.id_software)}
                        >
                          {expandedEquipments[software.id_software]
                            ? 'Ocultar Equipos'
                            : 'Ver Equipos'}
                        </button>
                        {expandedEquipments[software.id_software] && (
                          <div className="equipments">
                            {software.equiposAsociados &&
                            software.equiposAsociados.length > 0 ? (
                              software.equiposAsociados.map((equipo, idx) => (
                                <div
                                  key={`${equipo.id_equipos}-${idx}`}
                                  className="equipment-item"
                                >
                                  <p>
                                    <strong>ID del Equipo:</strong>{' '}
                                    {equipo.id_equipos}
                                  </p>
                                  <p>
                                    <strong>Fecha de Asignación:</strong>{' '}
                                    {equipo.fechaAsignacion}
                                  </p>
                                  <p>
                                    <strong>Estado de Asignación:</strong>{' '}
                                    {equipo.estado_asignacion}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p>No hay equipos asociados.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modales */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseEditModal}
        contentLabel="Formulario de Edición de Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareEditForm
          idSoftware={editSoftwareId}
          onClose={handleCloseEditModal}
          onSave={fetchSoftware}
        />
      </Modal>

      <Modal
        isOpen={addSoftwareModalIsOpen}
        onRequestClose={handleCloseAddSoftwareModal}
        contentLabel="Agregar Nuevo Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareForm onClose={handleCloseAddSoftwareModal} />
      </Modal>

      <Modal
        isOpen={historyModalIsOpen}
        onRequestClose={handleCloseHistoryModal}
        contentLabel="Historial de Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareHistory
          idSoftware={selectedSoftwareId}
          onClose={handleCloseHistoryModal}
        />
      </Modal>
    </div>
  );
};

export default GroupedNames;
