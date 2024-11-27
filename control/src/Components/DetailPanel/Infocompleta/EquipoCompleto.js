import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import Modal from 'react-modal';
import SoftwareManagementForm from './Forms/SoftwareManagementForm'; 
import EquipoHistorialModal from './EquipoHistorialModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip, faTv, faBarcode, faKey, faWrench, faExclamationTriangle, faEdit, faSave, faHdd, faPlus, faMinus, faHistory
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import './styles/EquipoCompleto.css';

Modal.setAppElement('#root');

const EquipoCompleto = ({ idEquipo }) => {
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

  useEffect(() => {
    const fetchEquipo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        const equipoData = response.data;

        if (!equipoData.auxiliares) {
          equipoData.auxiliares = [];
        }

        setEquipo(equipoData);
        setUpdatedEquipo(equipoData);

        if (equipoData.idColaborador) {
          const colaboradorResponse = await axios.get(`http://localhost:3550/api/colaboradores/${equipoData.idColaborador}`);
          setColaborador(colaboradorResponse.data);
        }

        const colaboradoresResponse = await axios.get('http://localhost:3550/api/colaboradores');
        setColaboradores(colaboradoresResponse.data);

        const softwareResponse = await axios.get(`http://localhost:3550/api/software/equipo/${idEquipo}`);
        setSoftwares(softwareResponse.data);

        setError(null);
      } catch (error) {
        console.error('Error al cargar los datos del equipo o los softwares:', error);
        setError('Error al cargar los datos del equipo o los softwares.');
      } finally {
        setLoading(false);
      }
    };

    if (idEquipo) {
      fetchEquipo();
    }
  }, [idEquipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEquipo((prev) => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleAuxiliarChange = (index, e) => {
    const { name, value } = e.target;
    setUpdatedEquipo((prev) => {
      const newAuxiliares = [...prev.auxiliares];
      newAuxiliares[index] = {
        ...newAuxiliares[index],
        [name]: value,
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
      idColaborador: selectedColaboradorId
    }));
    setColaborador(colaboradores.find((col) => col.id_empleado === parseInt(selectedColaboradorId)));
    setHasChanges(true);
  };

  const addAuxiliar = () => {
    setUpdatedEquipo((prev) => ({
      ...prev,
      auxiliares: [
        ...prev.auxiliares,
        { id_equipo: idEquipo, nombre_auxiliar: '', numero_serie_aux: '' }
      ]
    }));
    setHasChanges(true);
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

        // Validar que componentesAdicionales sea un JSON válido o inicializar como array vacío
        if (equipoToUpdate.componentesAdicionales) {
            if (typeof equipoToUpdate.componentesAdicionales === 'string') {
                try {
                    JSON.parse(equipoToUpdate.componentesAdicionales);
                } catch (error) {
                    console.warn('componentesAdicionales no es un JSON válido. Inicializando como array vacío.');
                    equipoToUpdate.componentesAdicionales = JSON.stringify([]);
                }
            }
        } else {
            equipoToUpdate.componentesAdicionales = JSON.stringify([]);
        }

        await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, equipoToUpdate);
        setEquipo(equipoToUpdate); // Actualizar el estado
        setIsEditing(false); // Salir del modo de edición
        setHasChanges(false); // Restablecer indicador de cambios
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
        setError('Error al guardar los cambios.');
    }
};


  const handleSaveAuxiliar = async () => {
    try {
      await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, { auxiliares: updatedEquipo.auxiliares });
      setEquipo(updatedEquipo);
      setIsEditingAuxiliar(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error al guardar los cambios en auxiliares:', error);
      setError('Error al guardar los cambios en auxiliares.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm("Hay cambios sin guardar. ¿Estás seguro de que quieres cancelar?");
      if (!confirmCancel) {
        return;
      }
    }
    setUpdatedEquipo(equipo);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancelAuxiliar = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm("Hay cambios sin guardar en auxiliares. ¿Estás seguro de que quieres cancelar?");
      if (!confirmCancel) {
        return;
      }
    }
    setUpdatedEquipo(equipo);
    setIsEditingAuxiliar(false);
    setHasChanges(false);
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

  if (loading) {
    return <div>Cargando datos del equipo...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!equipo) {
    return <div>No se encontraron datos del equipo.</div>;
  }

  return (
    <div className="equipo-detalles">
      <h1>
        <FontAwesomeIcon icon={faLaptop} /> Detalles del Equipo
      </h1>
  
      {/* Botones de acciones */}
      <div className="actions">
        {isEditing ? (
          <>
            <button onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>
            <FontAwesomeIcon icon={faEdit} /> Editar
          </button>
        )}
        <button onClick={handleOpenModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Software
        </button>
        <button onClick={handleHistorialModalOpen}>
          <FontAwesomeIcon icon={faHistory} /> Ver Historial
        </button>
      </div>
  
      {/* Información general del equipo */}
      <h2>Información General</h2>
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
    {equipo.numeroSerie}
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
      <input
        type="text"
        name="estadoFisico"
        value={updatedEquipo.estadoFisico}
        onChange={handleInputChange}
      />
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
    {equipo.fechaCompra}
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

  
      {/* Colaborador asignado */}
      <h2>Colaborador Asignado</h2>
      {isEditing ? (
        <div>
          <label>Seleccionar Colaborador:</label>
          <select
            name="idColaborador"
            value={updatedEquipo.idColaborador || ""}
            onChange={handleColaboradorChange}
          >
            <option value="">Sin asignar</option>
            {colaboradores.map((col) => (
              <option key={col.id_empleado} value={col.id_empleado}>
                {col.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : colaborador ? (
        <div>
          <p>
            <FontAwesomeIcon icon={faTag} /> <strong>ID Empleado:</strong>{" "}
            {colaborador.id_empleado}
          </p>
          <p>
            <FontAwesomeIcon icon={faTag} /> <strong>Nombre:</strong>{" "}
            {colaborador.nombre}
          </p>
        </div>
      ) : (
        <p>No hay colaborador asignado.</p>
      )}
  
      {/* Auxiliares */}
      <h2>Auxiliares Asociados</h2>
      {isEditingAuxiliar ? (
        <>
          {updatedEquipo.auxiliares?.map((auxiliar, index) => (
            <div key={index}>
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
                <FontAwesomeIcon icon={faBarcode} /> <strong>Número de Serie:</strong>{" "}
                <input
                  type="text"
                  name="numero_serie_aux"
                  value={auxiliar.numero_serie_aux}
                  onChange={(e) => handleAuxiliarChange(index, e)}
                />
              </p>
              <button onClick={() => removeAuxiliar(index)}>
                <FontAwesomeIcon icon={faMinus} /> Remover
              </button>
            </div>
          ))}
          <button onClick={addAuxiliar}>
            <FontAwesomeIcon icon={faPlus} /> Agregar Auxiliar
          </button>
          <button onClick={handleSaveAuxiliar}>
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
              <p key={index}>
                <FontAwesomeIcon icon={faTv} /> <strong>Nombre:</strong> {aux.nombre_auxiliar}
              </p>
            ))
          ) : (
            <p>No hay auxiliares asociados.</p>
          )}
          <button onClick={() => setIsEditingAuxiliar(true)}>
            <FontAwesomeIcon icon={faEdit} /> Editar Auxiliares
          </button>
        </>
      )}
  
      {/* Softwares */}
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
  
      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareManagementForm idEquipo={idEquipo} onClose={handleCloseModal} />
      </Modal>
  
      {/* Historial */}
      <EquipoHistorialModal
        isOpen={historialModalIsOpen}
        onClose={handleHistorialModalClose}
        idEquipo={idEquipo}
      />
    </div>
  );
  
  
};

export default EquipoCompleto;
