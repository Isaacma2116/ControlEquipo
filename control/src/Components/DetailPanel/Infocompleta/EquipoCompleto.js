import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip, faTv, faBarcode, faKey, faWrench, faExclamationTriangle, faEdit, faSave, faHdd, faPlus
} from '@fortawesome/free-solid-svg-icons';

import './styles/EquipoCompleto.css';

const EquipoCompleto = ({ idEquipo }) => {
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colaborador, setColaborador] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedEquipo, setUpdatedEquipo] = useState({}); 
  const [colaboradores, setColaboradores] = useState([]); 
  const [hasChanges, setHasChanges] = useState(false); 

  useEffect(() => {
    const fetchEquipo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        setEquipo(response.data);
        setUpdatedEquipo(response.data); 

        if (response.data.idColaborador) {
          const colaboradorResponse = await axios.get(`http://localhost:3550/api/colaboradores/${response.data.idColaborador}`);
          setColaborador(colaboradorResponse.data);
        }

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
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3550/api/equipos/${idEquipo}`, updatedEquipo);
      setEquipo(updatedEquipo); 
      setIsEditing(false); 
      setHasChanges(false); 
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
    setUpdatedEquipo(equipo); 
    setIsEditing(false); 
    setHasChanges(false); 
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

      {/* Detalles del equipo */}
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
      <p><FontAwesomeIcon icon={faBarcode} /> Número de Serie: {equipo.numeroSerie}</p> 
      <p><FontAwesomeIcon icon={faKey} /> Contraseña del Equipo: {isEditing ? (
        <input type="text" name="contrasenaEquipo" value={updatedEquipo.contrasenaEquipo} onChange={handleInputChange} />
      ) : equipo.contrasenaEquipo}</p>

      {/* Campos de componentes adicionales */}
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
      <p><FontAwesomeIcon icon={faWrench} /> Componentes Adicionales: {isEditing ? (
        <textarea name="componentesAdicionales" value={JSON.stringify(updatedEquipo.componentesAdicionales)} onChange={handleInputChange} />
      ) : JSON.stringify(equipo.componentesAdicionales)}</p>

      {/* Campos adicionales */}
      <p><FontAwesomeIcon icon={faShieldAlt} /> Estado Físico: {isEditing ? (
        <input type="text" name="estadoFisico" value={updatedEquipo.estadoFisico} onChange={handleInputChange} />
      ) : equipo.estadoFisico}</p>
      <p><FontAwesomeIcon icon={faExclamationTriangle} /> Detalles de Incidentes: {isEditing ? (
        <textarea name="detallesIncidentes" value={updatedEquipo.detallesIncidentes} onChange={handleInputChange} />
      ) : equipo.detallesIncidentes}</p>
      <p><FontAwesomeIcon icon={faShieldAlt} /> Garantía: {isEditing ? (
        <input type="text" name="garantia" value={updatedEquipo.garantia} onChange={handleInputChange} />
      ) : equipo.garantia}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> Fecha de Compra: {equipo.fechaCompra}</p> 
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
            <p><FontAwesomeIcon icon={faTv} /> Nombre del Auxiliar: {auxiliar.nombre_auxiliar}</p> 
            <p><FontAwesomeIcon icon={faBarcode} /> Número de Serie: {auxiliar.numeroSerieAux}</p>
          </div>
        ))
      ) : (
        <p>No hay auxiliares asociados.</p>
      )}

      {/* Botón para agregar software */}
      <div className="add-software">
        <button className="add-software-button">
          <FontAwesomeIcon icon={faPlus} /> Agregar Software
        </button>
      </div>
    </div>
  );
};

export default EquipoCompleto;
