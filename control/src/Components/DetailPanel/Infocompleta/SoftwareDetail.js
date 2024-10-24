import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faFileAlt, faCalendarAlt, faKey, faEnvelope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';


const SoftwareDetail = ({ softwareId }) => {
  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reiniciar los estados en cada carga del software
    setSoftware(null);
    setLoading(true);
    setError(null);

    // Solicitud para obtener los datos del software
    axios.get(`http://localhost:3550/api/software/${softwareId}`)
      .then(response => {
        setSoftware(response.data);
      })
      .catch(error => {
        setError('Error al cargar los datos del software.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [softwareId]);

  // Mostrar un mensaje de carga si los datos aún no están disponibles
  if (loading) {
    return <div>Cargando información del software...</div>;
  }

  // Mostrar un mensaje de error si algo salió mal
  if (error) {
    return <div>{error}</div>;
  }

  // Verificar si no se encontró el software
  if (!software) {
    return <div>No se encontraron los datos del software.</div>;
  }

  return (
    <div className="software-detail">
      <h2>Detalles del Software</h2>
      <p><FontAwesomeIcon icon={faFileAlt} /> <strong>Nombre:</strong> {software.nombre}</p>
      <p><FontAwesomeIcon icon={faFileAlt} /> <strong>Versión:</strong> {software.version}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Fecha de Adquisición:</strong> {software.fecha_adquisicion ? new Date(software.fecha_adquisicion).toLocaleDateString() : 'N/A'}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Fecha de Caducidad:</strong> {software.fecha_caducidad ? new Date(software.fecha_caducidad).toLocaleDateString() : 'N/A'}</p>
      <p><FontAwesomeIcon icon={faKey} /> <strong>Tipo de Licencia:</strong> {software.tipo_licencia}</p>
      <p><FontAwesomeIcon icon={faKey} /> <strong>Clave de Licencia:</strong> {software.clave_licencia || 'N/A'}</p>
      <p><FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Asociado:</strong> {software.correo_asociado || 'N/A'}</p>
      <p><FontAwesomeIcon icon={faKey} /> <strong>Contraseña del Correo:</strong> {software.contrasena_correo || 'N/A'}</p>
      <p><FontAwesomeIcon icon={faExclamationTriangle} /> <strong>Licencia Caducada:</strong> {software.licencia_caducada ? 'Sí' : 'No'}</p>
      <p><FontAwesomeIcon icon={faLaptop} /> <strong>ID del Equipo:</strong> {software.id_equipos}</p>
    </div>
  );
};

export default SoftwareDetail;
