import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip, faHdd, faTv, faBarcode, faKey, faWrench, faTools, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './styles/EquipoCompleto.css';

const EquipoCompleto = ({ idEquipo }) => {
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colaborador, setColaborador] = useState(null); // Estado para los datos del colaborador

  useEffect(() => {
    const fetchEquipo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}`);
        setEquipo(response.data);

        // Fetch detalles del colaborador basado en `idColaborador`
        if (response.data.idColaborador) {
          const colaboradorResponse = await axios.get(`http://localhost:3550/api/colaboradores/${response.data.idColaborador}`);
          setColaborador(colaboradorResponse.data);  // Guardar los detalles del colaborador
        }

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
      <p><FontAwesomeIcon icon={faTag} /> ID Equipo: {equipo.id_equipos}</p>
      <p><FontAwesomeIcon icon={faLaptop} /> Tipo de Dispositivo: {equipo.tipoDispositivo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Marca: {equipo.marca}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Modelo: {equipo.modelo}</p>
      <p><FontAwesomeIcon icon={faBarcode} /> Número de Serie: {equipo.numeroSerie}</p>
      <p><FontAwesomeIcon icon={faKey} /> Contraseña del Equipo: {equipo.contrasenaEquipo}</p>
      <p><FontAwesomeIcon icon={faTools} /> Componentes: {equipo.componentes}</p>
      <p><FontAwesomeIcon icon={faWrench} /> Modificaciones: {equipo.modificaciones}</p>
      <p><FontAwesomeIcon icon={faShieldAlt} /> Estado Físico: {equipo.estadoFisico}</p>
      <p><FontAwesomeIcon icon={faExclamationTriangle} /> Detalles de Incidentes: {equipo.detallesIncidentes}</p>
      <p><FontAwesomeIcon icon={faShieldAlt} /> Garantía: {equipo.garantia}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> Fecha de Compra: {equipo.fechaCompra}</p>
      <p><FontAwesomeIcon icon={faShieldAlt} /> Activo: {equipo.activo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Sistema Operativo: {equipo.sistemaOperativo}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Dirección MAC: {equipo.mac}</p>
      <p><FontAwesomeIcon icon={faMicrochip} /> Hostname: {equipo.hostname}</p>

      {/* Detalles del colaborador */}
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

      {/* Pantallas asociadas */}
      <h2>Pantallas Asociadas</h2>
      {equipo.pantallas && equipo.pantallas.length > 0 ? (
        equipo.pantallas.map((pantalla, index) => (
          <div key={index}>
            <p><FontAwesomeIcon icon={faTv} /> Tipo de Pantalla: {pantalla.tipoPantalla}</p>
            <p><FontAwesomeIcon icon={faBarcode} /> Serial: {pantalla.serialPantalla}</p>
          </div>
        ))
      ) : (
        <p>No hay pantallas asociadas.</p>
      )}

      {/* Auxiliares asociados */}
      <h2>Auxiliares Asociados</h2>
      {equipo.auxiliares && equipo.auxiliares.length > 0 ? (
        equipo.auxiliares.map((auxiliar, index) => (
          <div key={index}>
            <p><FontAwesomeIcon icon={faTv} /> Nombre del Auxiliar: {auxiliar.nombreAuxiliar}</p>
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
