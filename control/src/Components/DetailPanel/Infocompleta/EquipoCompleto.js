// EquipoCompleto.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import SoftwareManagementForm from './Forms/SoftwareManagementForm';
import EquipoHistorialModal from './EquipoHistorialModal';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip,
  faTv, faBarcode, faKey, faWrench, faExclamationTriangle,
  faEdit, faSave, faHdd, faPlus, faMinus, faHistory,
  faIdBadge, faUser, faBuilding, faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import './styles/EquipoCompleto.css';

Modal.setAppElement('#root');

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [historialModalIsOpen, setHistorialModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para el menú desplegable
  const [editedImage, setEditedImage] = useState(null);

  useEffect(() => {
    const fetchEquipo = async () => {
      // Cierra edición y reinicia estado de cambios al cambiar de equipo
      setIsEditing(false);
      setIsEditingAuxiliar(false);
      setHasChanges(false);

      setLoading(true); // Indica que está cargando
      try {
        // 1. Obtener los datos del equipo actual
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        const equipoData = response.data;

        // Inicializar valores faltantes en el equipo
        equipoData.auxiliares = equipoData.auxiliares || [];

        setEquipo(equipoData); // Actualiza el estado principal
        setUpdatedEquipo(equipoData); // Sincroniza el estado editable

        // 2. Obtener colaborador asociado (si existe)
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
          setColaborador(null); // Sin colaborador asociado
        }

        // 3. Cargar lista de colaboradores
        const colaboradoresResponse = await axios.get('http://localhost:3550/api/colaboradores');
        setColaboradores(colaboradoresResponse.data);

        // 4. Cargar software asociado al equipo
        const softwareResponse = await axios.get(
          `http://localhost:3550/api/software/equipo/${idEquipo}`
        );
        setSoftwares(softwareResponse.data);

        // 5. Cargar lista de equipos disponibles para reasignar auxiliares
        const equiposResponse = await axios.get('http://localhost:3550/api/equipos');
        setEquipos(equiposResponse.data);

        // Restablecer errores en caso de éxito
        setError(null);

        console.log('Datos del equipo cargados correctamente:', equipoData);
      } catch (error) {
        console.error('Error al cargar los datos del equipo:', error);
        setError('Hubo un error al cargar los datos del equipo.');
      } finally {
        setLoading(false); // Termina la carga
      }
    };

    // Validar si `idEquipo` está disponible antes de ejecutar la función
    if (idEquipo) {
      // Confirmar si hay cambios pendientes antes de cargar el nuevo equipo
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
            fetchEquipo(); // Cargar el nuevo equipo
          }
          // Si el usuario cancela, no hacemos nada
        });
        return; // Evitar que el fetch se ejecute automáticamente
      }

      fetchEquipo();
    }

    // Limpieza opcional
    return () => {
      setEquipo(null);
      setUpdatedEquipo(null);
      setColaborador(null);
      setColaboradores([]);
      setSoftwares([]);
      setEquipos([]);
      setError(null);
    };
  }, [idEquipo]); // Dependencia del `idEquipo`  

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Actualiza el estado de `updatedEquipo` con los cambios realizados
    setUpdatedEquipo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Indica que hay cambios pendientes de guardar
    setHasChanges(true);
  };

  const handleAuxiliarChange = (index, e) => {
    const { name, value } = e.target;

    setUpdatedEquipo((prev) => {
      const newAuxiliares = [...prev.auxiliares];
      newAuxiliares[index] = {
        ...newAuxiliares[index],
        [name]: value || null, // Si el valor es vacío, asignar null para "sin asignar"
      };
      return {
        ...prev,
        auxiliares: newAuxiliares,
      };
    });

    setHasChanges(true);
  };

  const handleColaboradorChange = (e) => {
    const selectedColaboradorId = e.target.value; // ID seleccionado del colaborador
    setUpdatedEquipo((prev) => ({
      ...prev,
      idColaborador: selectedColaboradorId || null, // Si está vacío, asignar null
    }));
    const selectedColaborador = colaboradores.find((col) => col.id === parseInt(selectedColaboradorId));
    setColaborador(selectedColaborador || null);
    setHasChanges(true);
  };

  const handleGoToColaboradorDetail = () => {
    if (equipo && equipo.idColaborador) {
      onColaboradorClick(equipo.idColaborador); // Llama a la función pasada como prop
    } else {
      Swal.fire('Información', 'Este equipo no tiene un colaborador asignado.', 'info');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('imagen', file);

      // Subir la imagen al backend
      axios
        .put(`http://localhost:3550/api/equipos/${idEquipo}/imagen`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          // Actualizar el estado local con la nueva imagen
          setEquipo((prev) => ({
            ...prev,
            imagen: response.data.imagen,  // Suponiendo que la respuesta contiene la nueva URL de la imagen
          }));

          // Recargar los datos completos del equipo para asegurar la consistencia
          return axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        })
        .then((response) => {
          const equipoData = response.data;
          setEquipo(equipoData);  // Actualizar el estado con los datos completos
          setHasChanges(true);  // Marcar que hay cambios pendientes
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
          setHasChanges(false); // Restablecer cambios pendientes
          setIsEditing(false); // Cerrar modo edición
          setIsEditingAuxiliar(false); // Cerrar edición de auxiliares
          navigate(`/equipos/${newIdEquipo}`); // Navegar al nuevo equipo
        }
        // Si el usuario cancela, no hacemos nada
      });
    } else {
      navigate(`/equipos/${newIdEquipo}`); // Navegar al nuevo equipo
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

      // Continuamos guardando los cambios del equipo (incluyendo la imagen ya actualizada)
      await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, equipoToUpdate);

      setIsEditing(false);  // Salir del modo edición
      setHasChanges(false);  // Restablecer indicador de cambios
      Swal.fire('Éxito', 'Cambios guardados correctamente.', 'success');
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('Error al guardar los cambios.');
      Swal.fire('Error', 'Hubo un problema al guardar los cambios.', 'error');
    }
  };

  const handleSaveAuxiliar = async () => {
    try {
      const auxiliaresToUpdate = updatedEquipo.auxiliares.map((auxiliar) => ({
        ...auxiliar,
        id_equipo: auxiliar.id_equipo || idEquipo, // Asegura que id_equipo esté presente
      }));

      await axios.put(
        `http://localhost:3550/api/equipos/${idEquipo}/auxiliares`,
        { auxiliares: auxiliaresToUpdate }
      );

      // Obtener los auxiliares actualizados
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
        // Si el usuario cancela, no hacemos nada
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
          // Revertir a los valores originales
          setUpdatedEquipo(equipo);
          setIsEditingAuxiliar(false); // Salir del modo de edición
          setHasChanges(false); // Restablecer indicador de cambios
        }
        // Si el usuario cancela, no hacemos nada
      });
    } else {
      // Revertir a los valores originales
      setUpdatedEquipo(equipo);
      setIsEditingAuxiliar(false); // Salir del modo de edición
    }
  };

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

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
            navigate('/equipos'); // Redirige a la lista de equipos tras la eliminación
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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

      {/* Contenedor de la Imagen del Equipo */}
      <div className="equipo-imagen-container">
      {editedImage ? (
  <img
    src={URL.createObjectURL(editedImage)}  // Imagen seleccionada localmente
    alt="Imagen del equipo"
    className="equipo-imagen"
  />
) : equipo.imagen ? (
  <img
    src={equipo.imagen}  // Imagen del backend
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
              onChange={handleImageChange}  // Llamamos a la función para manejar el cambio de imagen
              className="image-upload-input"
            />
          </div>
        )}
      </div>

      <h1 className="titulo-principal">
        <FontAwesomeIcon icon={faLaptop} /> Detalles del Equipo
      </h1>

      {/* Botón de Menú Desplegable */}
      <div className="actions-menu">
        <button onClick={toggleMenu} className="menu-button">
          <FontAwesomeIcon icon={faEllipsisV} size="lg" />
        </button>
        {menuOpen && (
          <div className="dropdown-menu">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="dropdown-item">
                  <FontAwesomeIcon icon={faSave} /> Guardar Cambios
                </button>
                <button className="dropdown-item cancel-button" onClick={handleCancel}>
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="dropdown-item">
                <FontAwesomeIcon icon={faEdit} /> Editar
              </button>
            )}
            <button onClick={handleOpenModal} className="dropdown-item">
              <FontAwesomeIcon icon={faPlus} /> Agregar Software
            </button>

            <button onClick={handleHistorialModalOpen} className="dropdown-item">
              <FontAwesomeIcon icon={faHistory} /> Ver Historial
            </button>

            <button onClick={handleGoToColaboradorDetail} className="dropdown-item">
              <FontAwesomeIcon icon={faUser} /> Ver Detalle del Colaborador
            </button>

            <button
              onClick={() => handleDeleteEquipo(equipo.id_equipos)}
              className="dropdown-item delete-button"
            >
              <FontAwesomeIcon icon={faMinus} /> Eliminar Equipo
            </button>
          </div>
        )}
      </div>

      {/* Contenedor para Información Básica */}
      <div className="informacion-basica">
        <h2>Información Básica</h2>
        <div className="info-grid">
          <p>
            <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong> {equipo.id_equipos}
          </p>
          <p>
            <FontAwesomeIcon icon={faLaptop} /> <strong>Tipo de Dispositivo:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="tipoDispositivo"
                value={updatedEquipo.tipoDispositivo}
                onChange={handleInputChange}
              />
            ) : (
              equipo.tipoDispositivo
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Marca:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="marca"
                value={updatedEquipo.marca}
                onChange={handleInputChange}
              />
            ) : (
              equipo.marca
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Modelo:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="modelo"
                value={updatedEquipo.modelo}
                onChange={handleInputChange}
              />
            ) : (
              equipo.modelo
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="numeroSerie"
                value={updatedEquipo.numeroSerie}
                onChange={handleInputChange}
              />
            ) : (
              equipo.numeroSerie
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faKey} /> <strong>Contraseña del Equipo:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="contrasenaEquipo"
                value={updatedEquipo.contrasenaEquipo}
                onChange={handleInputChange}
              />
            ) : (
              equipo.contrasenaEquipo
            )}
          </p>
        </div>
      </div>

      {/* Contenedor para Detalles Técnicos y Asignaciones */}
      <div className="detalles-tecnicos">
        <h2>Detalles Técnicos y Asignaciones</h2>
        <div className="info-grid">
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>RAM:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="ram"
                value={updatedEquipo.ram}
                onChange={handleInputChange}
              />
            ) : (
              equipo.ram
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faHdd} /> <strong>Disco Duro:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="discoDuro"
                value={updatedEquipo.discoDuro}
                onChange={handleInputChange}
              />
            ) : (
              equipo.discoDuro
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Tarjeta Madre:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="tarjetaMadre"
                value={updatedEquipo.tarjetaMadre}
                onChange={handleInputChange}
              />
            ) : (
              equipo.tarjetaMadre
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Tarjeta Gráfica:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="tarjetaGrafica"
                value={updatedEquipo.tarjetaGrafica}
                onChange={handleInputChange}
              />
            ) : (
              equipo.tarjetaGrafica
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Procesador:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="procesador"
                value={updatedEquipo.procesador}
                onChange={handleInputChange}
              />
            ) : (
              equipo.procesador
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faShieldAlt} /> <strong>Estado Físico:</strong>{" "}
            {isEditing ? (
              <select
                name="estadoFisico"
                value={updatedEquipo.estadoFisico || ""}
                onChange={handleInputChange}
                required
              >
                <option value="Excelente (nuevo) y garantía">
                  Excelente (nuevo) y garantía
                </option>
                <option value="Bueno (Pérdida de garantía y raspones)">
                  Bueno (Pérdida de garantía y raspones)
                </option>
                <option value="Regular (Golpes, Rayones grandes)">
                  Regular (Golpes, Rayones grandes)
                </option>
                <option value="Malo (Cambio de piezas y pérdidas)">
                  Malo (Cambio de piezas y pérdidas)
                </option>
                <option value="Urgente (No funciona correctamente)">
                  Urgente (No funciona correctamente)
                </option>
              </select>
            ) : (
              equipo.estadoFisico
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faExclamationTriangle} /> <strong>Detalles de Incidentes:</strong>{" "}
            {isEditing ? (
              <textarea
                name="detallesIncidentes"
                value={updatedEquipo.detallesIncidentes}
                onChange={handleInputChange}
              />
            ) : (
              equipo.detallesIncidentes
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faShieldAlt} /> <strong>Garantía:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="garantia"
                value={updatedEquipo.garantia}
                onChange={handleInputChange}
              />
            ) : (
              equipo.garantia
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faCalendarAlt} /> <strong>Fecha de Compra:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                name="fechaCompra"
                value={updatedEquipo.fechaCompra ? updatedEquipo.fechaCompra.substring(0, 10) : ''}
                onChange={handleInputChange}
              />
            ) : (
              equipo.fechaCompra ? new Date(equipo.fechaCompra).toLocaleDateString() : 'No especificada'
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faShieldAlt} /> <strong>Activo:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="activo"
                value={updatedEquipo.activo}
                onChange={handleInputChange}
              />
            ) : (
              equipo.activo
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Sistema Operativo:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="sistemaOperativo"
                value={updatedEquipo.sistemaOperativo}
                onChange={handleInputChange}
              />
            ) : (
              equipo.sistemaOperativo
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>MAC:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="mac"
                value={updatedEquipo.mac}
                onChange={handleInputChange}
              />
            ) : (
              equipo.mac
            )}
          </p>
          <p>
            <FontAwesomeIcon icon={faMicrochip} /> <strong>Hostname:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="hostname"
                value={updatedEquipo.hostname}
                onChange={handleInputChange}
              />
            ) : (
              equipo.hostname
            )}
          </p>
        </div>
      </div>

      {/* Contenedor para Colaborador Asignado */}
      <div className="colaborador-asignado">
        <h2>Colaborador Asignado</h2>
        {isEditing ? (
          <div className="colaborador-edit">
            <label>Seleccionar Colaborador:</label>
            <select
              name="idColaborador"
              value={updatedEquipo.idColaborador || ""}
              onChange={handleColaboradorChange}
            >
              <option value="">Sin asignar</option>
              {colaboradores.map((col) => (
                <option key={col.id_empleado} value={col.id}>
                  {col.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : colaborador ? (
          <div className="colaborador-info">
            <p>
              <FontAwesomeIcon icon={faIdBadge} /> <strong>ID Empleado:</strong> {colaborador.id_empleado}
            </p>
            <p>
              <FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong> {colaborador.nombre}
            </p>
            <p>
              <FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong>{" "}
              {colaborador.area || "No especificado"}
            </p>
          </div>
        ) : (
          <p>No hay colaborador asignado.</p>
        )}
      </div>

      {/* Contenedor para Auxiliares Asociados */}
      <div className="auxiliares-asociados">
        <h2>Auxiliares Asociados</h2>
        {isEditingAuxiliar ? (
          <>
            {updatedEquipo.auxiliares?.map((auxiliar, index) => (
              <div key={index} className="auxiliar-item">
                <p>
                  <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong>{" "}
                  <input
                    type="text"
                    name="nombre_auxiliar"
                    value={auxiliar.nombre_auxiliar}
                    onChange={(e) => handleAuxiliarChange(index, e)}
                  />
                </p>

                <p>
                  <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong>{" "}
                  <select
                    name="id_equipo"
                    value={auxiliar.id_equipo || idEquipo} // Predeterminado al equipo actual
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
                <button onClick={() => removeAuxiliar(index)} className="remove-auxiliar-button">
                  <FontAwesomeIcon icon={faMinus} /> Remover
                </button>
              </div>
            ))}
            <button onClick={addAuxiliar} className="add-auxiliar-button">
              <FontAwesomeIcon icon={faPlus} /> Agregar Auxiliar
            </button>
            <button onClick={handleSaveAuxiliar} className="save-auxiliar-button">
              <FontAwesomeIcon icon={faSave} /> Guardar Auxiliares
            </button>
            <button className="cancel-button" onClick={handleCancelAuxiliar}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            {equipo.auxiliares?.length > 0 ? (
              equipo.auxiliares.map((aux, index) => (
                <div key={index} className="auxiliar-item">
                  <p>
                    <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong> {aux.nombre_auxiliar}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{" "}
                    {aux.numero_serie_aux || "No especificado"}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faTag} /> <strong>ID Equipo:</strong>{" "}
                    {aux.id_equipo || "Sin asignar"}
                  </p>
                </div>
              ))
            ) : (
              <p>No hay auxiliares asociados.</p>
            )}
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

      {/* Modal para Agregar Software */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareManagementForm idEquipo={idEquipo} onClose={handleCloseModal} />
      </Modal>

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
