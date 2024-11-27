import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareList.css';
import Modal from 'react-modal';
import SoftwareEditForm from './Forms/SoftwareEditForm';
import SoftwareForm from './Forms/SoftwareForm'; // Formulario para agregar software
import SoftwareHistory from './Forms/SoftwareHistory';
import ExpiryNotifications from './ExpiryNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const SoftwareList = ({ onChangeTipo }) => {
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSoftwareId, setEditSoftwareId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addSoftwareModalIsOpen, setAddSoftwareModalIsOpen] = useState(false);
  const [historyModalIsOpen, setHistoryModalIsOpen] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [expandedLicenses, setExpandedLicenses] = useState(null);
  const [expandedEquipments, setExpandedEquipments] = useState(null);

  useEffect(() => {
    fetchSoftware();
  }, []);

  const fetchSoftware = async () => {
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      setSoftwareList(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar la lista de software');
      setLoading(false);
    }
  };

  const handleEditClick = (software) => {
    setEditSoftwareId(software.id_software);
    setModalIsOpen(true);
  };

  const handleCloseEditModal = () => {
    setModalIsOpen(false);
    fetchSoftware();
  };

  const handleOpenAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(true);
  };

  const handleCloseAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(false);
    fetchSoftware();
  };

  const handleViewHistory = (id) => {
    setSelectedSoftwareId(id);
    setHistoryModalIsOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalIsOpen(false);
    setSelectedSoftwareId(null);
  };

  const handleDeleteClick = async (id_software) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este software?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3550/api/software/${id_software}`);
        fetchSoftware();
      } catch (error) {
        console.error('Error al eliminar el software:', error);
      }
    }
  };

  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  const toggleLicenses = (id) => {
    setExpandedLicenses(expandedLicenses === id ? null : id);
  };

  const toggleEquipments = (id) => {
    setExpandedEquipments(expandedEquipments === id ? null : id);
  };

  if (loading) {
    return <div>Cargando software...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="software-list-container">
      <h1>Lista de Software</h1>

      {/* Componente de notificaciones */}
      <ExpiryNotifications />

      {/* Botón para navegar a nombres agrupados */}
      <button className="add-software-button" onClick={() => onChangeTipo('grouped-names')}>
        Ver Nombres Agrupados
      </button>

      {/* Botón para agregar software */}
      <button className="add-software-button" onClick={handleOpenAddSoftwareModal}>
        Agregar Nuevo Software
      </button>

      {softwareList.length === 0 ? (
        <p>No hay software registrado.</p>
      ) : (
        <div className="software-grid">
          {softwareList.map((software) => (
            <div key={software.id_software} className="software-card">
              <div className="software-header">
                <h3>{software.nombre}</h3>
                <button className="menu-button" onClick={() => toggleMenu(software.id_software)}>
                  <FontAwesomeIcon icon={faCog} />
                </button>
              </div>

              {showMenu === software.id_software && (
                <div className="dropdown-menu">
                  <button onClick={() => handleEditClick(software)}>Editar</button>
                  <button onClick={() => handleDeleteClick(software.id_software)}>Eliminar</button>
                  <button onClick={() => handleViewHistory(software.id_software)}>Historial</button>
                </div>
              )}

              <p>Versión: {software.version}</p>
              <p>Fecha de Adquisición: {software.fecha_adquisicion}</p>
              <p>Fecha de Caducidad: {software.fecha_caducidad || 'N/A'}</p>
              <p>Tipo de Licencia: {software.tipoLicencia}</p>
              <p>Estado: {software.estado}</p>
              <p>Licencia Caducada: {software.licenciaCaducada ? 'Sí' : 'No'}</p>
              <p>Máximo de Licencias: {software.maxDispositivos || 'N/A'}</p>

              {/* Botón para expandir licencias */}
              <button onClick={() => toggleLicenses(software.id_software)}>
                {expandedLicenses === software.id_software ? 'Ocultar Licencias' : 'Ver Licencias'}
              </button>
              {expandedLicenses === software.id_software && (
                <div className="licenses">
                  {software.licencias && software.licencias.length > 0 ? (
                    software.licencias.map((licencia, index) => (
                      <div key={`${licencia.id_licencia || 'licencia'}-${index}`}>
                        <p>Clave de Licencia: {licencia.claveLicencia}</p>
                        <p>Correo Asociado: {licencia.correoAsociado}</p>
                        <p>Estado de Renovación: {licencia.estado_renovacion}</p>
                        <p>Licencia Compartida: {licencia.compartida ? 'Sí' : 'No'}</p>
                      </div>
                    ))
                  ) : (
                    <p>No hay licencias asociadas.</p>
                  )}
                </div>
              )}

              {/* Botón para expandir equipos asociados */}
              <button onClick={() => toggleEquipments(software.id_software)}>
                {expandedEquipments === software.id_software ? 'Ocultar Equipos' : 'Ver Equipos'}
              </button>
              {expandedEquipments === software.id_software && (
                <div className="equipments">
                  {software.equiposAsociados && software.equiposAsociados.length > 0 ? (
                    software.equiposAsociados.map((equipo, index) => (
                      <div key={`${equipo.id || 'equipo'}-${index}`}>
                        <p>ID del Equipo: {equipo.id_equipos}</p>
                        <p>Fecha de Asignación: {equipo.fechaAsignacion}</p>
                        <p>Estado de Asignación: {equipo.estado_asignacion}</p>
                      </div>
                    ))
                  ) : (
                    <p>No hay equipos asociados.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para el formulario de edición */}
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

      {/* Modal para agregar software */}
      <Modal
        isOpen={addSoftwareModalIsOpen}
        onRequestClose={handleCloseAddSoftwareModal}
        contentLabel="Agregar Nuevo Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareForm onClose={handleCloseAddSoftwareModal} />
      </Modal>

      {/* Modal para el historial */}
      <Modal
        isOpen={historyModalIsOpen}
        onRequestClose={handleCloseHistoryModal}
        contentLabel="Historial de Software"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedSoftwareId && (
          <SoftwareHistory
            idSoftware={selectedSoftwareId}
            onClose={handleCloseHistoryModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default SoftwareList;
