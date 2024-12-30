// src/Components/DetailPanel/Infocompleta/EquipoCompleto.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EquipoHistorialModal from './EquipoHistorialModal';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop,
  faTag,
  faShieldAlt,
  faCalendarAlt,
  faMicrochip,
  faTv,
  faBarcode,
  faKey,
  faWrench,
  faExclamationTriangle,
  faEdit,
  faSave,
  faHdd,
  faPlus,
  faMinus,
  faHistory,
  faIdBadge,
  faUser,
  faBuilding,
  faNetworkWired,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import './styles/EquipoCompleto.css';

const EquipoCompleto = ({ idEquipo, onColaboradorClick, onGoToSoftware }) => {
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAuxiliar, setIsEditingAuxiliar] = useState(false);
  const [updatedEquipo, setUpdatedEquipo] = useState({});
  const [colaboradores, setColaboradores] = useState([]);
  const [softwares, setSoftwares] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [historialModalIsOpen, setHistorialModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [editedImage, setEditedImage] = useState(null);

  // Se quitan referencias al modal de "Agregar Software":
  // import Modal from 'react-modal';
  // import SoftwareManagementForm from './Forms/SoftwareManagementForm';
  //
  // const [modalIsOpen, setModalIsOpen] = useState(false);
  // const handleOpenModal = () => { setModalIsOpen(true); };
  // const handleCloseModal = () => { setModalIsOpen(false); };

  useEffect(() => {
    const fetchEquipo = async () => {
      setIsEditing(false);
      setIsEditingAuxiliar(false);
      setHasChanges(false);

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        const equipoData = response.data;

        equipoData.auxiliares = equipoData.auxiliares || [];

        setEquipo(equipoData);
        setUpdatedEquipo(equipoData);

        // Cargar información del colaborador asociado (si existe)
        if (equipoData.idColaborador) {
          try {
            const colaboradorResponse = await axios.get(
              `http://localhost:3550/api/colaboradores/${equipoData.idColaborador}`
            );
            setColaborador(colaboradorResponse.data);
          } catch (colError) {
            console.warn('No se pudo cargar el colaborador asociado:', colError);
          }
        } else {
          setColaborador(null);
        }

        // Cargar lista de colaboradores
        const colaboradoresResponse = await axios.get('http://localhost:3550/api/colaboradores');
        setColaboradores(colaboradoresResponse.data);

        // Cargar softwares asociados a este equipo
        const softwareResponse = await axios.get(
          `http://localhost:3550/api/software/equipo/${idEquipo}`
        );
        setSoftwares(softwareResponse.data);

        // Cargar lista de equipos (útil para auxiliares)
        const equiposResponse = await axios.get('http://localhost:3550/api/equipos');
        setEquipos(equiposResponse.data);

        setError(null);

        console.log('Datos del equipo cargados correctamente:', equipoData);
      } catch (error) {
        console.error('Error al cargar los datos del equipo:', error);
        setError('Hubo un error al cargar los datos del equipo.');
      } finally {
        setLoading(false);
      }
    };

    if (idEquipo) {
      if (hasChanges) {
        Swal.fire({
          title: 'Hay cambios sin guardar',
          text: '¿Estás seguro de que quieres cambiar de equipo y descartar los cambios?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, descartar',
          cancelButtonText: 'No, cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            fetchEquipo();
          }
        });
        return;
      }

      fetchEquipo();
    }

    return () => {
      setEquipo(null);
      setUpdatedEquipo({});
      setColaborador(null);
      setColaboradores([]);
      setSoftwares([]);
      setEquipos([]);
      setError(null);
    };
    // eslint-disable-next-line
  }, [idEquipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación para componentesAdicionales si es necesario (JSON)
    if (name === 'componentesAdicionales') {
      try {
        const parsedValue = JSON.parse(value);
        setUpdatedEquipo((prev) => ({
          ...prev,
          [name]: parsedValue,
        }));
        setHasChanges(true);
      } catch (error) {
        Swal.fire('Error', 'Por favor, ingresa un JSON válido en Componentes Adicionales.', 'error');
      }
    } else {
      setUpdatedEquipo((prev) => ({
        ...prev,
        [name]: value,
      }));
      setHasChanges(true);
    }
  };

  const handleAuxiliarChange = (index, e) => {
    const { name, value } = e.target;

    setUpdatedEquipo((prev) => {
      const newAuxiliares = [...prev.auxiliares];
      newAuxiliares[index] = {
        ...newAuxiliares[index],
        [name]: value || null,
      };
      return {
        ...prev,
        auxiliares: newAuxiliares,
      };
    });

    setHasChanges(true);
  };

  const handleColaboradorChange = (e) => {
    const selectedColaboradorId = e.target.value;
    setUpdatedEquipo((prev) => ({
      ...prev,
      idColaborador: selectedColaboradorId || null,
    }));
    const selectedColaborador = colaboradores.find(
      (col) => col.id === parseInt(selectedColaboradorId)
    );
    setColaborador(selectedColaborador || null);
    setHasChanges(true);
  };

  const handleGoToColaboradorDetail = () => {
    if (equipo && equipo.idColaborador) {
      onColaboradorClick(equipo.idColaborador);
    } else {
      Swal.fire('Información', 'Este equipo no tiene un colaborador asignado.', 'info');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('imagen', file);

      axios
        .put(`http://localhost:3550/api/equipos/${idEquipo}/imagen`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          setEquipo((prev) => ({
            ...prev,
            imagen: response.data.imagen,
          }));
          return axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        })
        .then((response) => {
          const equipoData = response.data;
          setEquipo(equipoData);
          setHasChanges(true);
          Swal.fire('Éxito', 'Imagen actualizada correctamente.', 'success');
        })
        .catch((err) => {
          console.error('Error al subir la imagen:', err);
          setError('Hubo un error al subir la imagen.');
          Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        });
    }
  };

  const addAuxiliar = () => {
    setUpdatedEquipo((prev) => ({
      ...prev,
      auxiliares: [
        ...prev.auxiliares,
        { nombre_auxiliar: '', numero_serie_aux: '', id_equipo: idEquipo },
      ],
    }));
    setHasChanges(true);
  };

  const handleEquipoClick = (newIdEquipo) => {
    if (hasChanges) {
      Swal.fire({
        title: 'Hay cambios sin guardar',
        text: '¿Estás seguro de que quieres cambiar de equipo y descartar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'No, cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          setHasChanges(false);
          setIsEditing(false);
          setIsEditingAuxiliar(false);
          navigate(`/equipos/${newIdEquipo}`);
        }
      });
    } else {
      navigate(`/equipos/${newIdEquipo}`);
    }
  };

  const removeAuxiliar = (index) => {
    setUpdatedEquipo((prev) => {
      const newAuxiliares = prev.auxiliares.filter((_, i) => i !== index);
      return {
        ...prev,
        auxiliares: newAuxiliares,
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const equipoToUpdate = { ...updatedEquipo };

      await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, equipoToUpdate);

      setIsEditing(false);
      setHasChanges(false);
      Swal.fire('Éxito', 'Cambios guardados correctamente.', 'success');
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('Error al guardar los cambios.');
      Swal.fire('Error', 'Hubo un problema al guardar los cambios.', 'error');
    }
  };

  const handleSaveAuxiliar = async () => {
    const invalidAuxiliares = updatedEquipo.auxiliares.filter(
      (aux) => !aux.nombre_auxiliar.trim() || !aux.numero_serie_aux.trim()
    );

    if (invalidAuxiliares.length > 0) {
      Swal.fire('Error', 'Todos los auxiliares deben tener nombre y número de serie.', 'error');
      return;
    }

    try {
      const auxiliaresToUpdate = updatedEquipo.auxiliares.map((auxiliar) => ({
        ...auxiliar,
        id_equipo: auxiliar.id_equipo || idEquipo,
      }));

      await axios.put(
        `http://localhost:3550/api/equipos/${idEquipo}/auxiliares`,
        { auxiliares: auxiliaresToUpdate }
      );

      const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
      setEquipo(response.data);
      setUpdatedEquipo(response.data);
      setIsEditingAuxiliar(false);
      setHasChanges(false);
      Swal.fire('Éxito', 'Auxiliares actualizados correctamente.', 'success');
    } catch (error) {
      console.error('Error al guardar los auxiliares:', error);
      setError('Error al guardar los auxiliares.');
      Swal.fire('Error', 'Hubo un problema al guardar los auxiliares.', 'error');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Hay cambios sin guardar. ¿Quieres cancelar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, continuar',
      }).then((result) => {
        if (result.isConfirmed) {
          setUpdatedEquipo(equipo);
          setIsEditing(false);
          setHasChanges(false);
        }
      });
    } else {
      setUpdatedEquipo(equipo);
      setIsEditing(false);
    }
  };

  const handleCancelAuxiliar = () => {
    if (hasChanges) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Hay cambios sin guardar en auxiliares. ¿Quieres cancelar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, continuar',
      }).then((result) => {
        if (result.isConfirmed) {
          setUpdatedEquipo(equipo);
          setIsEditingAuxiliar(false);
          setHasChanges(false);
        }
      });
    } else {
      setUpdatedEquipo(equipo);
      setIsEditingAuxiliar(false);
    }
  };

  // Quitamos el modal de "Agregar Software" y sus estados,
  // en su lugar llamamos directamente onGoToSoftware().
  //
  // const handleOpenModal = () => { ... };
  // const handleCloseModal = () => { ... };
  // const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleHistorialModalOpen = () => {
    setHistorialModalIsOpen(true);
  };

  const handleHistorialModalClose = () => {
    setHistorialModalIsOpen(false);
  };

  const handleDeleteEquipo = (idEquipo) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción. El equipo será desactivado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3550/api/equipos/${idEquipo}`)
          .then(() => {
            Swal.fire('Desactivado', 'El equipo ha sido desactivado.', 'success');
            navigate('/equipos');
          })
          .catch((err) => {
            console.error('Error al desactivar el equipo:', err);
            if (err.response && err.response.data && err.response.data.message) {
              Swal.fire('Error', err.response.data.message, 'error');
            } else {
              Swal.fire('Error', 'No se pudo desactivar el equipo.', 'error');
            }
          });
      }
    });
  };

  if (loading) {
    return <div className="loading">Cargando datos del equipo...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!equipo) {
    return <div className="no-data">No se encontraron datos del equipo.</div>;
  }

  return (
    <div className="equipo-detalles">

      {/* Header Section: Imagen y Información Básica */}
      <div className="header-section">
        {/* Imagen del Equipo */}
        <div className="equipo-imagen-container">
          {editedImage ? (
            <img
              src={URL.createObjectURL(editedImage)}
              alt="Imagen del equipo"
              className="equipo-imagen"
            />
          ) : equipo.imagen ? (
            <img
              src={equipo.imagen}
              alt="Imagen del equipo"
              className="equipo-imagen"
            />
          ) : (
            <span>No hay imagen disponible</span>
          )}

          {/* Mostrar solo el campo para editar la imagen si estamos en modo edición */}
          {isEditing && (
            <div className="image-upload-container">
              <label htmlFor="image-upload" className="image-upload-label">
                <FontAwesomeIcon icon={faEdit} /> Editar Imagen
              </label>
              <input
                type="file"
                id="image-upload"
                name="imagen"
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
              />
            </div>
          )}
        </div>

        <div className="informacion-section">
          <h2 className="modelo-titulo">
            {isEditing ? (
              <input
                type="text"
                name="modelo"
                value={updatedEquipo.modelo || ''}
                onChange={handleInputChange}
              />
            ) : (
              equipo.modelo || 'Sin modelo especificado'
            )}
          </h2>

          {/* Contenedor de la Información en Dos Columnas */}
          <div className="informacion-contenido">
            {/* Información del Equipo */}
            <div className="informacion-equipo">
              <p>
                <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong> {equipo.id_equipos}
              </p>
              <p>
                <FontAwesomeIcon icon={faLaptop} /> <strong>Tipo de Dispositivo:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="tipoDispositivo"
                    value={updatedEquipo.tipoDispositivo || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.tipoDispositivo
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faMicrochip} /> <strong>Marca:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="marca"
                    value={updatedEquipo.marca || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.marca
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faKey} /> <strong>Contraseña del Equipo:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="contrasenaEquipo"
                    value={updatedEquipo.contrasenaEquipo || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.contrasenaEquipo
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="numeroSerie"
                    value={updatedEquipo.numeroSerie || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.numeroSerie
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faWrench} /> <strong>Tarjeta Madre:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="tarjetaMadre"
                    value={updatedEquipo.tarjetaMadre || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.tarjetaMadre || 'No especificado'
                )}
              </p>

              {/* Nuevo Campo Añadido: Estado Físico */}
              <p>
                <FontAwesomeIcon icon={faShieldAlt} /> <strong>Estado Físico:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="estadoFisico"
                    value={updatedEquipo.estadoFisico || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  equipo.estadoFisico || 'No especificado'
                )}
              </p>
            </div>

            {/* Información del Colaborador */}
            <div className="informacion-colaborador">
              <h3>Colaborador Asignado</h3>
              {isEditing ? (
                <div className="colaborador-edit">
                  <label>Seleccionar Colaborador:</label>
                  <select
                    name="idColaborador"
                    value={updatedEquipo.idColaborador || ''}
                    onChange={handleColaboradorChange}
                  >
                    <option value="">Sin asignar</option>
                    {colaboradores.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ) : colaborador ? (
                <div className="colaborador-info">
                  <p>
                    <FontAwesomeIcon icon={faIdBadge} /> <strong>ID Empleado:</strong>{' '}
                    {colaborador.id_empleado}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong>{' '}
                    {colaborador.nombre}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong>{' '}
                    {colaborador.area || 'No especificado'}
                  </p>
                </div>
              ) : (
                <p>No hay colaborador asignado.</p>
              )}
            </div>
          </div>
        </div>
      </div> {/* Fin de .header-section */}

      {/* Contenedor para Detalles Técnicos y Asignaciones */}
      <div className="info-actions-container">
        <div className="actions-container">
          {/* Botones de Acción */}
          {isEditing ? (
            <>
              <button onClick={handleSave} className="action-button save-button">
                <FontAwesomeIcon icon={faSave} /> Guardar Cambios
              </button>
              <button className="action-button cancel-button" onClick={handleCancel}>
                <FontAwesomeIcon icon={faMinus} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="action-button edit-button"
              >
                <FontAwesomeIcon icon={faEdit} /> Editar
              </button>

              {/* En lugar de abrir un modal, navegamos a la sección "software" */}
              <button
                onClick={() => onGoToSoftware()}
                className="action-button add-button"
              >
                <FontAwesomeIcon icon={faPlus} /> Agregar Software
              </button>

              <button
                onClick={handleHistorialModalOpen}
                className="action-button history-button"
              >
                <FontAwesomeIcon icon={faHistory} /> Ver Historial
              </button>

              <button
                onClick={handleGoToColaboradorDetail}
                className="action-button"
              >
                <FontAwesomeIcon icon={faUser} /> Ver Detalle del Colaborador
              </button>
              <button
                onClick={() => handleDeleteEquipo(equipo.id_equipos)}
                className="action-button delete-button"
              >
                <FontAwesomeIcon icon={faMinus} /> Eliminar Equipo
              </button>
            </>
          )}
        </div>

        {/* Detalles Técnicos */}
        <div className="detalles-tecnicos">
          <h2>Detalles Técnicos y Asignaciones</h2>
          <div className="info-grid">
            <p>
              <FontAwesomeIcon icon={faMicrochip} /> <strong>RAM:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="ram"
                  value={updatedEquipo.ram || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.ram
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faHdd} /> <strong>Disco Duro:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="discoDuro"
                  value={updatedEquipo.discoDuro || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.discoDuro
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faMicrochip} /> <strong>Procesador:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="procesador"
                  value={updatedEquipo.procesador || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.procesador
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faMicrochip} /> <strong>Tarjeta Gráfica:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="tarjetaGrafica"
                  value={updatedEquipo.tarjetaGrafica || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.tarjetaGrafica
              )}
            </p>

            <p>
              <FontAwesomeIcon icon={faWrench} /> <strong>Tarjeta Madre:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="tarjetaMadre"
                  value={updatedEquipo.tarjetaMadre || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.tarjetaMadre || 'No especificado'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faMicrochip} /> <strong>Hostname:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="hostname"
                  value={updatedEquipo.hostname || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.hostname || 'No especificado'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faShieldAlt} /> <strong>Garantía:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="garantia"
                  value={updatedEquipo.garantia || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.garantia || 'No especificada'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faCalendarAlt} /> <strong>Fecha de Compra:</strong>{' '}
              {isEditing ? (
                <input
                  type="date"
                  name="fechaCompra"
                  value={
                    updatedEquipo.fechaCompra
                      ? updatedEquipo.fechaCompra.substring(0, 10)
                      : ''
                  }
                  onChange={handleInputChange}
                />
              ) : equipo.fechaCompra ? (
                new Date(equipo.fechaCompra).toLocaleDateString()
              ) : (
                'No especificada'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faShieldAlt} /> <strong>Activo:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="activo"
                  value={updatedEquipo.activo || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.activo || 'No especificado'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faNetworkWired} /> <strong>MAC:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="mac"
                  value={updatedEquipo.mac || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.mac || 'No especificado'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faWrench} /> <strong>Componentes Adicionales:</strong>{' '}
              {isEditing ? (
                <textarea
                  name="componentesAdicionales"
                  value={
                    updatedEquipo.componentesAdicionales
                      ? JSON.stringify(updatedEquipo.componentesAdicionales, null, 2)
                      : ''
                  }
                  onChange={handleInputChange}
                  placeholder="Ingrese JSON válido"
                />
              ) : equipo.componentesAdicionales ? (
                <pre>{JSON.stringify(equipo.componentesAdicionales, null, 2)}</pre>
              ) : (
                'No especificado'
              )}
            </p>
            <p>
              <FontAwesomeIcon icon={faExclamationTriangle} /> <strong>Detalles de Incidentes:</strong>{' '}
              {isEditing ? (
                <textarea
                  name="detallesIncidentes"
                  value={updatedEquipo.detallesIncidentes || ''}
                  onChange={handleInputChange}
                />
              ) : (
                equipo.detallesIncidentes || 'No especificado'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor para Auxiliares Asociados */}
      <div className="auxiliares-asociados">
        <h2>Auxiliares Asociados</h2>
        {isEditingAuxiliar ? (
          <>
            <div className="auxiliares-grid">
              {updatedEquipo.auxiliares?.map((auxiliar, index) => (
                <div key={index} className="auxiliar-item">
                  <p>
                    <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong>
                    <input
                      type="text"
                      name="nombre_auxiliar"
                      value={auxiliar.nombre_auxiliar || ''}
                      onChange={(e) => handleAuxiliarChange(index, e)}
                      required
                    />
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>
                    <input
                      type="text"
                      name="numero_serie_aux"
                      value={auxiliar.numero_serie_aux || ''}
                      onChange={(e) => handleAuxiliarChange(index, e)}
                      required
                    />
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong>
                    <select
                      name="id_equipo"
                      value={auxiliar.id_equipo || idEquipo}
                      onChange={(e) => handleAuxiliarChange(index, e)}
                    >
                      <option value="">Sin asignar</option>
                      {equipos.map((equipoItem) => (
                        <option key={equipoItem.id_equipos} value={equipoItem.id_equipos}>
                          {equipoItem.id_equipos} - {equipoItem.tipoDispositivo}
                        </option>
                      ))}
                    </select>
                  </p>
                  <button
                    onClick={() => removeAuxiliar(index)}
                    className="remove-auxiliar-button"
                  >
                    <FontAwesomeIcon icon={faMinus} /> Remover
                  </button>
                </div>
              ))}
            </div>
            <div className="auxiliares-actions">
              <button onClick={addAuxiliar} className="add-auxiliar-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Auxiliar
              </button>
              <button onClick={handleSaveAuxiliar} className="save-auxiliar-button">
                <FontAwesomeIcon icon={faSave} /> Guardar Auxiliares
              </button>
              <button className="cancel-button" onClick={handleCancelAuxiliar}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auxiliares-grid">
              {equipo.auxiliares?.length > 0 ? (
                equipo.auxiliares.map((aux, index) => (
                  <div key={index} className="auxiliar-item">
                    <p>
                      <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong> {aux.nombre_auxiliar}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{' '}
                      {aux.numero_serie_aux || 'No especificado'}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong>{' '}
                      {aux.id_equipo || 'Sin asignar'}
                    </p>
                  </div>
                ))
              ) : (
                <p>No hay auxiliares asociados.</p>
              )}
            </div>
            <button onClick={() => setIsEditingAuxiliar(true)} className="edit-auxiliar-button">
              <FontAwesomeIcon icon={faEdit} /> Editar Auxiliares
            </button>
          </>
        )}
      </div>

      {/* Contenedor para Softwares Asociados */}
      <div className="softwares-asociados">
        <h2>Softwares Asociados</h2>
        <div className="software-grid">
          {softwares.length > 0 ? (
            softwares.map((software, index) => (
              <div key={index} className="software-item">
                <p>
                  <strong>Nombre:</strong> {software.nombre}
                </p>
                <p>
                  <strong>Versión:</strong> {software.version}
                </p>
                <p>
                  <strong>Licencia:</strong> {software.tipoLicencia}
                </p>
              </div>
            ))
          ) : (
            <p>No hay softwares asociados.</p>
          )}
        </div>
      </div>

      {/* Se elimina el modal de "Agregar Software", ya que navegamos a otra vista */}
      {/*
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          className="modal"
          overlayClassName="overlay"
        >
          <SoftwareManagementForm idEquipo={idEquipo} onClose={handleCloseModal} />
        </Modal>
      */}

      {/* Modal para Ver Historial */}
      <EquipoHistorialModal
        isOpen={historialModalIsOpen}
        onClose={handleHistorialModalClose}
        idEquipo={idEquipo}
      />
    </div>
  );
};

export default EquipoCompleto;
