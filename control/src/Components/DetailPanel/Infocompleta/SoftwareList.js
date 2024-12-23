// src/Components/DetailPanel/Infocompleta/SoftwareList.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/SoftwareList.css';
import Modal from 'react-modal';
import SoftwareEditForm from './Forms/SoftwareEditForm';
import SoftwareForm from './Forms/SoftwareForm';
import SoftwareHistory from './Forms/SoftwareHistory';
import ExpiryNotifications from './ExpiryNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faSort,
  faSortUp,
  faSortDown,
  faFilter,
  faPlus,
  faSearch,
  faTimes,
  faCertificate,
  faTools,
} from '@fortawesome/free-solid-svg-icons';
import DataAnalysis from './Forms/DataAnalysis';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { debounce } from 'lodash';
import Swal from 'sweetalert2'; // Importamos SweetAlert2 para mejores confirmaciones

// Configura el elemento root para los modales
Modal.setAppElement('#root');

// Definimos el componente
const SoftwareList = ({ onChangeTipo }) => {
  const [softwareList, setSoftwareList] = useState([]);
  const [filteredSoftwareList, setFilteredSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manejo de modales
  const [editSoftwareId, setEditSoftwareId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addSoftwareModalIsOpen, setAddSoftwareModalIsOpen] = useState(false);
  const [historyModalIsOpen, setHistoryModalIsOpen] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);

  // Manejo de menús desplegables
  const [showMenu, setShowMenu] = useState(null);
  const [expandedLicenses, setExpandedLicenses] = useState(null);
  const [expandedEquipments, setExpandedEquipments] = useState(null);

  // Estado para mostrar/ocultar análisis de datos
  const [showDataAnalysis, setShowDataAnalysis] = useState(false);

  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null); // Para enfocar o limpiar el campo de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
    menuOpen: false,
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchSoftware();
  }, []);

  // Efecto para filtrar y ordenar cada vez que cambie la búsqueda, la lista o el orden
  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, softwareList, sortConfig]);

  // **1. OBTENER LISTA DE SOFTWARE DESDE LA API**
  const fetchSoftware = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      if (Array.isArray(response.data)) {
        setSoftwareList(response.data);
        setFilteredSoftwareList(response.data);
      } else {
        setSoftwareList([]);
        setFilteredSoftwareList([]);
      }
    } catch (error) {
      console.error('Error al cargar la lista de software:', error);
      setError('No hay registros de software o ocurrió un error al cargar.');
    } finally {
      setLoading(false);
    }
  };

  // **2. FILTRAR Y ORDENAR LA LISTA**
  const handleFilterAndSort = () => {
    let filtered = [...softwareList];

    // Filtrado por nombre, versión o tipo de licencia
    const term = searchTerm.trim().toLowerCase();
    if (term !== '') {
      filtered = filtered.filter((software) => {
        const { nombre, version, tipoLicencia } = software;
        const combinedString = `${nombre} ${version} ${tipoLicencia}`.toLowerCase();
        return combinedString.includes(term);
      });
    }

    // Ordenamiento por la clave seleccionada
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredSoftwareList(filtered);
    setCurrentPage(1); // Reinicia la paginación al cambiar filtros/orden
  };

  // **3. MANEJADORES DE MODALES**
  const handleEditClick = (software) => {
    setEditSoftwareId(software.id_software);
    setModalIsOpen(true);
  };

  const handleCloseEditModal = () => {
    setModalIsOpen(false);
    fetchSoftware();
    toast.success('Software actualizado exitosamente.');
  };

  const handleOpenAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(true);
  };

  const handleCloseAddSoftwareModal = () => {
    setAddSoftwareModalIsOpen(false);
    fetchSoftware();
    toast.success('Nuevo software agregado exitosamente.');
  };

  const handleViewHistory = (id) => {
    setSelectedSoftwareId(id);
    setHistoryModalIsOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalIsOpen(false);
    setSelectedSoftwareId(null);
  };

  // **4. ELIMINAR SOFTWARE (con SweetAlert2)**
  const handleDeleteClick = async (id_software) => {
    toast.dismiss(); // Cierra cualquier toast previo

    Swal.fire({
      title: '¿Eliminar este software?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3550/api/software/${id_software}`);
          fetchSoftware();
          toast.success('Software eliminado exitosamente.');
        } catch (error) {
          console.error('Error al eliminar el software:', error);
          toast.error('Error al eliminar el software. Por favor, intenta nuevamente.');
        }
      }
    });
  };

  // **5. MANEJAR MENÚS Y PANELES DESPLEGABLES**
  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  const toggleLicenses = (id) => {
    setExpandedLicenses(expandedLicenses === id ? null : id);
  };

  const toggleEquipments = (id) => {
    setExpandedEquipments(expandedEquipments === id ? null : id);
  };

  const toggleDataAnalysis = () => {
    setShowDataAnalysis((prev) => !prev);
  };

  // **6. BÚSQUEDA CON DEBOUNCE**
  const handleSearchChange = debounce((e) => {
    setSearchTerm(e.target.value);
  }, 300);

  // **7. ORDENAMIENTO**
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction, menuOpen: sortConfig.menuOpen });
  };

  // **8. LIMPIAR EL CAMPO DE BÚSQUEDA**
  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
      searchInputRef.current.focus();
    }
  };

  // **9. PAGINACIÓN**
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSoftwareList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSoftwareList.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="software-list-container">
      <h1>Lista de Software</h1>

      {/* Notificaciones de licencias próximas a expirar */}
      <ExpiryNotifications />

      {/* Botones principales */}
      <div className="button-group">
        <button
          className="add-software-button"
          onClick={() => onChangeTipo('grouped-names')}
          title="Ver Nombres Agrupados"
        >
          <FontAwesomeIcon icon={faFilter} /> Ver Nombres Agrupados
        </button>

        <button
          className="add-software-button"
          onClick={handleOpenAddSoftwareModal}
          title="Agregar Nuevo Software"
        >
          <FontAwesomeIcon icon={faPlus} /> Agregar Nuevo Software
        </button>

        <button
          className="add-software-button"
          onClick={() => {
            setSelectedSoftwareId(null);
            setHistoryModalIsOpen(true);
          }}
          title="Ver Historial General"
        >
          <FontAwesomeIcon icon={faCog} /> Ver Historial General
        </button>

        <button
          className="add-software-button"
          onClick={toggleDataAnalysis}
          title="Análisis de Datos"
        >
          {showDataAnalysis ? (
            <>
              <FontAwesomeIcon icon={faSortDown} /> Ocultar Análisis
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSortUp} /> Mostrar Análisis
            </>
          )}
        </button>
      </div>

      {/* Buscador de Software */}
      <div className="search-container">
        <div className="search-bar-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nombre, versión o licencia..."
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm.trim() !== '' && (
            <button className="clear-button" onClick={clearSearch} title="Limpiar búsqueda">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Menú de Ordenamiento Desplegable */}
      <div className="sort-container">
        <button
          className="sort-menu-button"
          onClick={() => setSortConfig({ ...sortConfig, menuOpen: !sortConfig.menuOpen })}
          title="Ordenar Software"
        >
          <FontAwesomeIcon icon={faSort} />
        </button>

        {sortConfig.menuOpen && (
          <div className="sort-dropdown">
            <button onClick={() => handleSort('nombre')} className="sort-option">
              Nombre{' '}
              {sortConfig.key === 'nombre' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} />
              )}
            </button>
            <button onClick={() => handleSort('version')} className="sort-option">
              Versión{' '}
              {sortConfig.key === 'version' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} />
              )}
            </button>
            <button onClick={() => handleSort('fecha_adquisicion')} className="sort-option">
              Fecha de Adquisición{' '}
              {sortConfig.key === 'fecha_adquisicion' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSortUp : faSortDown} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Análisis de Datos (opcional) */}
      {showDataAnalysis && <DataAnalysis softwareList={softwareList} />}

      {/* Mensaje de Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Contenido Principal */}
      {loading ? (
        // **Skeleton Loading** o indicador de carga
        <div className="loading-skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : (
        <>
          {filteredSoftwareList.length === 0 ? (
            <p className="no-records">No hay software registrado.</p>
          ) : (
            <>
              {/* Grid de Tarjetas */}
              <div className="software-grid">
                {currentItems.map((software) => {
                  // Estilos condicionales para software caducado
                  const cardClass = software.licenciaCaducada
                    ? 'software-card expired'
                    : 'software-card';

                  return (
                    <div key={software.id_software} className={cardClass}>
                      <div className="software-header">
                        <h3>{software.nombre}</h3>
                        <button
                          className="menu-button"
                          onClick={() => toggleMenu(software.id_software)}
                          title="Opciones"
                        >
                          <FontAwesomeIcon icon={faCog} />
                        </button>
                        {showMenu === software.id_software && (
                          <div className="dropdown-menu">
                            <button onClick={() => handleEditClick(software)} className="dropdown-item">
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(software.id_software)}
                              className="dropdown-item"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => handleViewHistory(software.id_software)}
                              className="dropdown-item"
                            >
                              Historial
                            </button>
                          </div>
                        )}
                      </div>

                      <p>
                        <strong>Versión:</strong> {software.version || 'N/A'}
                      </p>
                      <p>
                        <strong>Fecha de Adquisición:</strong>{' '}
                        {software.fecha_adquisicion
                          ? new Date(software.fecha_adquisicion).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Fecha de Caducidad:</strong>{' '}
                        {software.fecha_caducidad
                          ? new Date(software.fecha_caducidad).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Tipo de Licencia:</strong> {software.tipoLicencia || 'N/A'}
                      </p>
                      <p>
                        <strong>Estado:</strong> {software.estado || 'N/A'}
                      </p>
                      <p>
                        <strong>Licencia Caducada:</strong>{' '}
                        {software.licenciaCaducada ? (
                          <span className="badge expired">
                            <FontAwesomeIcon icon={faCertificate} /> Sí
                          </span>
                        ) : (
                          <span className="badge active">
                            <FontAwesomeIcon icon={faCertificate} /> No
                          </span>
                        )}
                      </p>
                      <p>
                        <strong>Máximo de Dispositivos:</strong>{' '}
                        {software.maxDispositivos || 'N/A'}
                      </p>

                      {/* Licencias asociadas */}
                      <button
                        onClick={() => toggleLicenses(software.id_software)}
                        className="toggle-button"
                        title="Ver Licencias"
                      >
                        <FontAwesomeIcon icon={faCertificate} />{' '}
                        {expandedLicenses === software.id_software ? 'Ocultar Licencias' : 'Ver Licencias'}
                      </button>
                      {expandedLicenses === software.id_software && (
                        <div className="licenses">
                          <h3>
                            <FontAwesomeIcon icon={faCertificate} /> Licencias
                          </h3>
                          {software.licencias && software.licencias.length > 0 ? (
                            software.licencias.map((licencia, index) => (
                              <div key={`${licencia.id_licencia}-${index}`} className="license-item">
                                <p>
                                  <strong>Clave de Licencia:</strong>{' '}
                                  {licencia.claveLicencia || 'N/A'}
                                </p>
                                <p>
                                  <strong>Correo Asociado:</strong>{' '}
                                  {licencia.correoAsociado || 'N/A'}
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
                        className="toggle-button"
                        title="Ver Equipos"
                      >
                        <FontAwesomeIcon icon={faTools} />{' '}
                        {expandedEquipments === software.id_software ? 'Ocultar Equipos' : 'Ver Equipos'}
                      </button>
                      {expandedEquipments === software.id_software && (
                        <div className="equipments">
                          <h3>
                            <FontAwesomeIcon icon={faTools} /> Equipos
                          </h3>
                          {software.equiposAsociados && software.equiposAsociados.length > 0 ? (
                            software.equiposAsociados.map((equipo, index) => (
                              <div key={`${equipo.id_equipos}-${index}`} className="equipment-item">
                                <p>
                                  <strong>ID del Equipo:</strong>{' '}
                                  {equipo.id_equipos || 'N/A'}
                                </p>
                                <p>
                                  <strong>Fecha de Asignación:</strong>{' '}
                                  {equipo.fechaAsignacion
                                    ? new Date(equipo.fechaAsignacion).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                                <p>
                                  <strong>Estado de Asignación:</strong>{' '}
                                  {equipo.estado_asignacion || 'N/A'}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p>No hay equipos asociados.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <span className="items-count">
                    Mostrando {currentItems.length} de {filteredSoftwareList.length} resultados
                  </span>

                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                    title="Página Anterior"
                  >
                    Anterior
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                      title={`Ir a la página ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                    title="Página Siguiente"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MODALES */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseEditModal}
        contentLabel="Formulario de Edición de Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareEditForm idSoftware={editSoftwareId} onClose={handleCloseEditModal} onSave={fetchSoftware} />
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
          isOpen={historyModalIsOpen}
          onClose={handleCloseHistoryModal}
          idSoftware={selectedSoftwareId}
        />
      </Modal>

      {/* Contenedor de Notificaciones */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default SoftwareList;
