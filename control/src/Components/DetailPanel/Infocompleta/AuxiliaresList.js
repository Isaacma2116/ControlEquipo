// src/components/AuxiliaresList.js

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop,
  faTag,
  faTv,
  faBarcode,
  faEdit,
  faTrashAlt,
  faFilter,
  faSearch,
  faExchangeAlt,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import './styles/AuxiliaresList.css';

Modal.setAppElement('#root'); // Para accesibilidad en modales

const AuxiliaresList = () => {
  const [auxiliares, setAuxiliares] = useState([]);
  const [filteredAuxiliares, setFilteredAuxiliares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipoDispositivo: '',
    marca: '',
    estadoActivo: '',
  });
  const [reassignModalIsOpen, setReassignModalIsOpen] = useState(false);
  const [selectedAuxiliar, setSelectedAuxiliar] = useState(null);
  const [equipos, setEquipos] = useState([]); // Lista de equipos disponibles
  const [softwares, setSoftwares] = useState([]); // Lista de softwares disponibles
  const [newAuxiliarModalIsOpen, setNewAuxiliarModalIsOpen] = useState(false);
  const [newAuxiliar, setNewAuxiliar] = useState({
    nombre_auxiliar: '',
    numero_serie_aux: '',
    id_equipo: null, // Inicializar en null
  });
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [editAuxiliarData, setEditAuxiliarData] = useState({
    id_auxiliar: '',
    nombre_auxiliar: '',
    numero_serie_aux: '',
    id_equipo: null, // Inicializar en null
  });

  // URL base de la API
  const API_BASE_URL = 'http://localhost:3550/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener la lista de auxiliares activos
        const auxiliaresResponse = await axios.get(`${API_BASE_URL}/auxiliares`);
        setAuxiliares(auxiliaresResponse.data);
        console.log('Auxiliares obtenidos:', auxiliaresResponse.data);

        // 2. Obtener la lista de equipos disponibles
        const equiposResponse = await axios.get(`${API_BASE_URL}/equipos`);
        setEquipos(equiposResponse.data);
        console.log('Equipos obtenidos:', equiposResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Hubo un error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función de debounce para búsqueda
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchTerm(query);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Manejar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Filtrar auxiliares según búsqueda y filtros
  useEffect(() => {
    let filtered = auxiliares.filter((auxiliar) => {
      const term = searchTerm.toLowerCase();
      return (
        auxiliar.nombre_auxiliar.toLowerCase().includes(term) ||
        auxiliar.numero_serie_aux.toLowerCase().includes(term)
      );
    });

    // Aplicar filtros
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((auxiliar) => {
          if (key === 'estadoActivo') {
            return auxiliar.equipo && auxiliar.equipo.estadoActivo === parseInt(filters[key]);
          }
          return auxiliar.equipo && auxiliar.equipo[key] === filters[key];
        });
      }
    });

    setFilteredAuxiliares(filtered);
  }, [searchTerm, filters, auxiliares]);

  // Funciones para el Modal de Reasignación
  const openReassignModal = (auxiliar) => {
    setSelectedAuxiliar(auxiliar);
    setReassignModalIsOpen(true);
  };

  const closeReassignModal = () => {
    setSelectedAuxiliar(null);
    setReassignModalIsOpen(false);
  };

  // Funciones para el Modal de Agregar Nuevo Auxiliar
  const openNewAuxiliarModal = () => {
    setNewAuxiliarModalIsOpen(true);
  };

  const closeNewAuxiliarModal = () => {
    setNewAuxiliarModalIsOpen(false);
    setNewAuxiliar({
      nombre_auxiliar: '',
      numero_serie_aux: '',
      id_equipo: null,
    });
  };

  // Funciones para el Modal de Edición
  const handleEditAuxiliar = (auxiliar) => {
    setEditAuxiliarData({
      id_auxiliar: auxiliar.id_auxiliar,
      nombre_auxiliar: auxiliar.nombre_auxiliar,
      numero_serie_aux: auxiliar.numero_serie_aux,
      id_equipo: auxiliar.id_equipo || null,
    });
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setEditAuxiliarData({
      id_auxiliar: '',
      nombre_auxiliar: '',
      numero_serie_aux: '',
      id_equipo: null,
    });
  };

  // Función para guardar la edición
  const handleSaveEditAuxiliar = () => {
    const { id_auxiliar, nombre_auxiliar, numero_serie_aux, id_equipo } = editAuxiliarData;

    if (!nombre_auxiliar || !numero_serie_aux) {
      Swal.fire('Advertencia', 'Los campos de nombre y número de serie son obligatorios.', 'warning');
      return;
    }

    axios
      .put(`${API_BASE_URL}/auxiliares/${id_auxiliar}`, {
        nombre_auxiliar,
        numero_serie_aux,
        id_equipo: id_equipo, // Puede ser null o un número entero
      })
      .then((response) => {
        const updatedAuxiliares = auxiliares.map((aux) =>
          aux.id_auxiliar === id_auxiliar ? response.data : aux
        );
        setAuxiliares(updatedAuxiliares);
        Swal.fire('Éxito', 'Auxiliar editado correctamente.', 'success');
        closeEditModal();
      })
      .catch((err) => {
        console.error('Error al editar auxiliar:', err);
        Swal.fire('Error', 'No se pudo editar el auxiliar.', 'error');
      });
  };

  // Función para eliminar auxiliar (Soft Delete)
  const handleDeleteAuxiliar = (id_auxiliar) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres eliminar este auxiliar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_BASE_URL}/auxiliares/${id_auxiliar}`)
          .then(() => {
            setAuxiliares(auxiliares.filter((aux) => aux.id_auxiliar !== id_auxiliar));
            Swal.fire('Eliminado', 'El auxiliar ha sido desactivado.', 'success');
          })
          .catch((err) => {
            console.error('Error al eliminar auxiliar:', err);
            Swal.fire('Error', 'No se pudo eliminar el auxiliar.', 'error');
          });
      }
    });
  };

  // Función para reasignar equipo
  const handleReassignEquipo = (id_auxiliar, nuevoEquipo) => {
    if (nuevoEquipo === null) {
      // Confirmar si desea dejar el equipo sin uso
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres dejar este equipo sin uso?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, dejar sin uso',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .put(`${API_BASE_URL}/auxiliares/${id_auxiliar}/reasignar`, { id_equipo: null })
            .then((response) => {
              const updatedAuxiliares = auxiliares.map((aux) =>
                aux.id_auxiliar === id_auxiliar ? response.data : aux
              );
              setAuxiliares(updatedAuxiliares);
              Swal.fire('Reasignado', 'El equipo ha sido dejado sin uso.', 'success');
              closeReassignModal();
            })
            .catch((err) => {
              console.error('Error al reasignar equipo:', err);
              Swal.fire('Error', 'No se pudo reasignar el equipo.', 'error');
            });
        }
      });
    } else {
      // Reasignar a otro equipo
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres reasignar el equipo a este auxiliar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, reasignar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .put(`${API_BASE_URL}/auxiliares/${id_auxiliar}/reasignar`, { id_equipo: nuevoEquipo })
            .then((response) => {
              const updatedAuxiliares = auxiliares.map((aux) =>
                aux.id_auxiliar === id_auxiliar ? response.data : aux
              );
              setAuxiliares(updatedAuxiliares);
              Swal.fire('Reasignado', 'El equipo ha sido reasignado correctamente.', 'success');
              closeReassignModal();
            })
            .catch((err) => {
              console.error('Error al reasignar equipo:', err);
              Swal.fire('Error', 'No se pudo reasignar el equipo.', 'error');
            });
        }
      });
    }
  };

  // Función para agregar nuevo auxiliar
  const handleAddAuxiliar = () => {
    const { nombre_auxiliar, numero_serie_aux, id_equipo } = newAuxiliar;

    if (!nombre_auxiliar || !numero_serie_aux) {
      Swal.fire('Advertencia', 'Los campos de nombre y número de serie son obligatorios.', 'warning');
      return;
    }

    axios
      .post(`${API_BASE_URL}/auxiliares`, {
        nombre_auxiliar,
        numero_serie_aux,
        id_equipo, // Puede ser null o un número entero
      })
      .then((response) => {
        setAuxiliares([...auxiliares, response.data]);
        Swal.fire('Éxito', 'Auxiliar agregado correctamente.', 'success');
        closeNewAuxiliarModal();
      })
      .catch((err) => {
        console.error('Error al agregar auxiliar:', err);
        Swal.fire('Error', 'No se pudo agregar el auxiliar.', 'error');
      });
  };

  // Obtener opciones únicas para filtros
  const getUniqueOptions = (key) => {
    const options = auxiliares
      .filter((auxiliar) => auxiliar.equipo && auxiliar.equipo[key])
      .map((auxiliar) => auxiliar.equipo[key]);
    return [...new Set(options)];
  };

  if (loading) {
    return <div className="loading">Cargando auxiliares...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Opciones para react-select en reasignación
  const selectOptions = [
    { value: null, label: 'Sin Uso' },
    ...equipos.map((equipo) => ({
      value: equipo.id_equipos,
      label: `${equipo.id_equipos} - ${equipo.tipoDispositivo}`,
    })),
  ];

  // Opciones para react-select en agregar auxiliar
  const addSelectOptions = [
    { value: null, label: 'Sin Uso' },
    ...equipos.map((equipo) => ({
      value: equipo.id_equipos,
      label: `${equipo.id_equipos} - ${equipo.tipoDispositivo}`,
    })),
  ];

  // Opciones para react-select en editar auxiliar
  const editSelectOptions = [
    { value: null, label: 'Sin Uso' },
    ...equipos.map((equipo) => ({
      value: equipo.id_equipos,
      label: `${equipo.id_equipos} - ${equipo.tipoDispositivo}`,
    })),
  ];

  return (
    <div className="auxiliares-list-container">
      <h1>Lista de Auxiliares</h1>

      {/* Barra de Búsqueda y Filtros */}
      <div className="controls">
        {/* Búsqueda */}
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de serie..."
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtros como Menú Desplegable */}
        <div className="filter-dropdown">
          <button className="filter-icon-button">
            <FontAwesomeIcon icon={faFilter} size="lg" />
          </button>
          <div className="filter-content">
            <div className="filter-item">
              <label htmlFor="tipoDispositivo">Tipo de Dispositivo:</label>
              <select
                name="tipoDispositivo"
                value={filters.tipoDispositivo}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {getUniqueOptions('tipoDispositivo').map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="marca">Marca:</label>
              <select name="marca" value={filters.marca} onChange={handleFilterChange}>
                <option value="">Todas</option>
                {getUniqueOptions('marca').map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="estadoActivo">Estado del Equipo:</label>
              <select
                name="estadoActivo"
                value={filters.estadoActivo}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ícono para Agregar Nuevo Auxiliar */}
        <div className="add-auxiliar-icon">
          <button className="add-icon-button" onClick={openNewAuxiliarModal}>
            <FontAwesomeIcon icon={faPlus} size="lg" />
          </button>
        </div>
      </div>

      {/* Lista de Auxiliares */}
      <div className="auxiliares-list">
        {filteredAuxiliares.length === 0 ? (
          <p>No se encontraron auxiliares.</p>
        ) : (
          <div className="auxiliares-grid">
            {filteredAuxiliares.map((auxiliar) => (
              <div key={auxiliar.id_auxiliar} className="auxiliar-card">
                <div className="card-header">
                  <h2>
                    <FontAwesomeIcon icon={faTag} /> {auxiliar.id_auxiliar}
                  </h2>
                  <div className="card-actions">
                    <button
                      onClick={() => openReassignModal(auxiliar)}
                      title="Reasignar Equipo"
                      className="action-button"
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} />
                    </button>
                    <button
                      onClick={() => handleEditAuxiliar(auxiliar)}
                      title="Editar"
                      className="action-button"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteAuxiliar(auxiliar.id_auxiliar)}
                      title="Eliminar"
                      className="action-button delete-button"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p>
                    <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong> {auxiliar.nombre_auxiliar}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{' '}
                    {auxiliar.numero_serie_aux}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faLaptop} /> <strong>Equipo Asignado:</strong>{' '}
                    {auxiliar.equipo
                      ? `${auxiliar.equipo.id_equipos} - ${auxiliar.equipo.tipoDispositivo}`
                      : 'Sin Uso'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Reasignar Equipo */}
      <Modal
        isOpen={reassignModalIsOpen}
        onRequestClose={closeReassignModal}
        className="modal"
        overlayClassName="overlay"
      >
        {selectedAuxiliar && (
          <div className="modal-content">
            <h2>Reasignar Equipo a {selectedAuxiliar.nombre_auxiliar}</h2>
            <Select
              name="id_equipo"
              value={
                selectedAuxiliar.id_equipo !== null
                  ? selectOptions.find((option) => option.value === selectedAuxiliar.id_equipo)
                  : selectOptions.find((option) => option.value === null)
              }
              onChange={(selectedOption) => {
                const nuevoEquipo = selectedOption ? selectedOption.value : null;
                handleReassignEquipo(selectedAuxiliar.id_auxiliar, nuevoEquipo);
              }}
              options={selectOptions}
              placeholder="Seleccionar Nuevo Equipo"
              isClearable
            />
            <button onClick={closeReassignModal} className="close-modal-button">
              <FontAwesomeIcon icon={faTimes} /> Cerrar
            </button>
          </div>
        )}
      </Modal>

      {/* Modal para Agregar Nuevo Auxiliar */}
      <Modal
        isOpen={newAuxiliarModalIsOpen}
        onRequestClose={closeNewAuxiliarModal}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-content">
          <h2>Agregar Nuevo Auxiliar</h2>
          <div className="add-auxiliar-form">
            <input
              type="text"
              name="nombre_auxiliar"
              placeholder="Nombre del Auxiliar"
              value={newAuxiliar.nombre_auxiliar}
              onChange={(e) => setNewAuxiliar({ ...newAuxiliar, nombre_auxiliar: e.target.value })}
            />
            <input
              type="text"
              name="numero_serie_aux"
              placeholder="Número de Serie"
              value={newAuxiliar.numero_serie_aux}
              onChange={(e) => setNewAuxiliar({ ...newAuxiliar, numero_serie_aux: e.target.value })}
            />
            <Select
              name="id_equipo"
              value={
                newAuxiliar.id_equipo !== null
                  ? addSelectOptions.find((option) => option.value === newAuxiliar.id_equipo)
                  : null
              }
              onChange={(selectedOption) => {
                const nuevoEquipo = selectedOption ? selectedOption.value : null;
                setNewAuxiliar({ ...newAuxiliar, id_equipo: nuevoEquipo });
              }}
              options={addSelectOptions}
              placeholder="Asignar Equipo"
              isClearable
            />
            <div className="modal-buttons">
              <button onClick={handleAddAuxiliar} className="add-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar
              </button>
              <button onClick={closeNewAuxiliarModal} className="cancel-button">
                <FontAwesomeIcon icon={faTimes} /> Cancelar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal para Editar Auxiliar */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        className="modal"
        overlayClassName="overlay"
      >
        {editAuxiliarData.id_auxiliar && (
          <div className="modal-content">
            <h2>Editar Auxiliar</h2>
            <div className="edit-auxiliar-form">
              <input
                type="text"
                name="nombre_auxiliar"
                placeholder="Nombre del Auxiliar"
                value={editAuxiliarData.nombre_auxiliar}
                onChange={(e) =>
                  setEditAuxiliarData({ ...editAuxiliarData, nombre_auxiliar: e.target.value })
                }
              />
              <input
                type="text"
                name="numero_serie_aux"
                placeholder="Número de Serie"
                value={editAuxiliarData.numero_serie_aux}
                onChange={(e) =>
                  setEditAuxiliarData({ ...editAuxiliarData, numero_serie_aux: e.target.value })
                }
              />
              <Select
                name="id_equipo"
                value={
                  editAuxiliarData.id_equipo !== null
                    ? editSelectOptions.find((option) => option.value === editAuxiliarData.id_equipo)
                    : null
                }
                onChange={(selectedOption) => {
                  const nuevoEquipo = selectedOption ? selectedOption.value : null;
                  setEditAuxiliarData({ ...editAuxiliarData, id_equipo: nuevoEquipo });
                }}
                options={editSelectOptions}
                placeholder="Asignar Nuevo Equipo"
                isClearable
              />
              <div className="modal-buttons">
                <button onClick={handleSaveEditAuxiliar} className="save-button">
                  <FontAwesomeIcon icon={faPlus} /> Guardar
                </button>
                <button onClick={closeEditModal} className="cancel-button">
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuxiliaresList;
