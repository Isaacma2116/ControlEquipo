import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip, faTv, faBarcode, faKey, faWrench, faTools, faExclamationTriangle, faEdit, faSave, faHdd
} from '@fortawesome/free-solid-svg-icons';

import './styles/EquipoCompleto.css';

const EquipoCompleto = ({ idEquipo }) => {
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colaborador, setColaborador] = useState(null); // Estado para los datos del colaborador
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar el modo de edición
  const [updatedEquipo, setUpdatedEquipo] = useState({}); // Estado para almacenar los cambios
  const [colaboradores, setColaboradores] = useState([]); // Estado para almacenar la lista de colaboradores
  const [hasChanges, setHasChanges] = useState(false); // Estado para detectar cambios en el formulario

  useEffect(() => {
    const fetchEquipo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        setEquipo(response.data);
        setUpdatedEquipo(response.data); // Inicializamos con los datos obtenidos

        // Fetch detalles del colaborador basado en `idColaborador`
        if (response.data.idColaborador) {
          const colaboradorResponse = await axios.get(`http://localhost:3550/api/colaboradores/${response.data.idColaborador}`);
          console.log("Colaborador response: ", colaboradorResponse.data); // Verificar si la API devuelve el colaborador
          setColaborador(colaboradorResponse.data);  // Guardar los detalles del colaborador
        }

        // Cargar la lista de todos los colaboradores
        const colaboradoresResponse = await axios.get('http://localhost:3550/api/colaboradores');
        setColaboradores(colaboradoresResponse.data);

        setError(null);
      } catch (error) {
        console.error('Error al cargar los datos del equipo:', error);
        setError('Error al cargar los datos del equipo.');
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
    setHasChanges(true); // Marca que hay cambios
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, updatedEquipo);
      setEquipo(updatedEquipo); // Actualizamos los datos con los cambios guardados
      setIsEditing(false); // Volvemos al modo "ver"
      setHasChanges(false); // Restablecemos el estado de cambios
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('Error al guardar los cambios.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm("Hay cambios sin guardar. ¿Estás seguro de que quieres cancelar?");
      if (!confirmCancel) {
        return;
      }
    }
    setUpdatedEquipo(equipo); // Restablece los datos originales del equipo
    setIsEditing(false); // Vuelve al modo de solo lectura
    setHasChanges(false); // Restablece el estado de cambios
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
      <h1><FontAwesomeIcon icon={faLaptop} /> Detalles del Equipo</h1>
      
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
      </div>

      <p><FontAwesomeIcon icon={faTag} /> ID Equipo: {equipo.id_equipos}</p>
      <p><FontAwesomeIcon icon={faLaptop} /> Tipo de Dispositivo: {isEditing ? (
        <input type="text" name="tipoDispositivo" value={updatedEquipo.tipoDispositivo} onChange={handleInputChange} />
      ) : equipo.tipoDispositivo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Marca: {isEditing ? (
        <input type="text" name="marca" value={updatedEquipo.marca} onChange={handleInputChange} />
      ) : equipo.marca}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Modelo: {isEditing ? (
        <input type="text" name="modelo" value={updatedEquipo.modelo} onChange={handleInputChange} />
      ) : equipo.modelo}</p>
      <p><FontAwesomeIcon icon={faBarcode} /> Número de Serie: {equipo.numeroSerie}</p> {/* Este campo no es editable */}
      <p><FontAwesomeIcon icon={faKey} /> Contraseña del Equipo: {isEditing ? (
        <input type="text" name="contrasenaEquipo" value={updatedEquipo.contrasenaEquipo} onChange={handleInputChange} />
      ) : equipo.contrasenaEquipo}</p>

      {/* Nuevos campos de componentes */}
      <p><FontAwesomeIcon icon={faMicrochip} /> RAM: {isEditing ? (
        <input type="text" name="ram" value={updatedEquipo.ram} onChange={handleInputChange} />
      ) : equipo.ram}</p>
      <p><FontAwesomeIcon icon={faHdd} /> Disco Duro: {isEditing ? (
        <input type="text" name="discoDuro" value={updatedEquipo.discoDuro} onChange={handleInputChange} />
      ) : equipo.discoDuro}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Tarjeta Madre: {isEditing ? (
        <input type="text" name="tarjetaMadre" value={updatedEquipo.tarjetaMadre} onChange={handleInputChange} />
      ) : equipo.tarjetaMadre}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Tarjeta Gráfica: {isEditing ? (
        <input type="text" name="tarjetaGrafica" value={updatedEquipo.tarjetaGrafica} onChange={handleInputChange} />
      ) : equipo.tarjetaGrafica}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Procesador: {isEditing ? (
        <input type="text" name="procesador" value={updatedEquipo.procesador} onChange={handleInputChange} />
      ) : equipo.procesador}</p>

      {/* Campo de modificaciones */}
      <p><FontAwesomeIcon icon={faWrench} /> Modificaciones: {isEditing ? (
        <textarea name="modificaciones" value={updatedEquipo.modificaciones} onChange={handleInputChange} />
      ) : equipo.modificaciones}</p>

      <p><FontAwesomeIcon icon={faShieldAlt} /> Estado Físico: {isEditing ? (
        <input type="text" name="estadoFisico" value={updatedEquipo.estadoFisico} onChange={handleInputChange} />
      ) : equipo.estadoFisico}</p>

      {/* Detalles de Incidentes */}
      <p><FontAwesomeIcon icon={faExclamationTriangle} /> Detalles de Incidentes: {isEditing ? (
        <textarea name="detallesIncidentes" value={updatedEquipo.detallesIncidentes} onChange={handleInputChange} />
      ) : equipo.detallesIncidentes}</p>

      {/* Otros detalles */}
      <p><FontAwesomeIcon icon={faShieldAlt} /> Garantía: {isEditing ? (
        <input type="text" name="garantia" value={updatedEquipo.garantia} onChange={handleInputChange} />
      ) : equipo.garantia}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> Fecha de Compra: {equipo.fechaCompra}</p> {/* No editable */}
      <p><FontAwesomeIcon icon={faShieldAlt} /> Activo: {isEditing ? (
        <input type="text" name="activo" value={updatedEquipo.activo} onChange={handleInputChange} />
      ) : equipo.activo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Sistema Operativo: {isEditing ? (
        <input type="text" name="sistemaOperativo" value={updatedEquipo.sistemaOperativo} onChange={handleInputChange} />
      ) : equipo.sistemaOperativo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Dirección MAC: {isEditing ? (
        <input type="text" name="mac" value={updatedEquipo.mac} onChange={handleInputChange} />
      ) : equipo.mac}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Hostname: {isEditing ? (
        <input type="text" name="hostname" value={updatedEquipo.hostname} onChange={handleInputChange} />
      ) : equipo.hostname}</p>

      {/* Detalles del colaborador */}
      <p> Colaborador Asignado</p>
      {colaborador && (
        <>
          <p><FontAwesomeIcon icon={faTag} /> ID Empleado: {colaborador.id_empleado}</p>
          <p><FontAwesomeIcon icon={faTag} /> Nombre del Colaborador: {colaborador.nombre}</p>
        </>
      )}

      {/* Imagen del equipo */}
      {equipo.imagen && (
        <img
          src={`http://localhost:3550${equipo.imagen}`}
          alt="Imagen del equipo"
          style={{ width: '150px' }}
        />
      )}

      {/* Auxiliares asociados */}
      <h2>Auxiliares Asociados</h2>
      {equipo.auxiliares && equipo.auxiliares.length > 0 ? (
        equipo.auxiliares.map((auxiliar, index) => (
          <div key={index}>
            <p><FontAwesomeIcon icon={faTv} /> Nombre del Auxiliar: {auxiliar.nombre_auxiliar}</p> {/* Cambiado a nombre_auxiliar */}
            <p><FontAwesomeIcon icon={faBarcode} /> Número de Serie: {auxiliar.numeroSerieAux}</p>
          </div>
        ))
      ) : (
        <p>No hay auxiliares asociados.</p>
      )}
    </div>
  );
};

export default EquipoCompleto;
