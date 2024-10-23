import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode, faCalendarAlt, faKey, faEnvelope, faCheckCircle, faTimesCircle, faCodeBranch, faLock, faUnlock, faClipboardList, faClock
} from '@fortawesome/free-solid-svg-icons';
// Elimina la línea si no tienes un archivo CSS
// import './styles/SoftwareDetail.css'; // Si tienes un archivo CSS, crea el archivo y quita el comentario

const SoftwareDetail = ({ softwareId }) => {
  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`http://localhost:3550/api/software/${softwareId}`)  // Ajusta la URL según tu backend
      .then(response => {
        setSoftware(response.data);
      })
      .catch(error => {
        setError('Error al cargar el software.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [softwareId]);

  if (loading) {
    return <div>Cargando software...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!software) {
    return <div>No se encontró el software.</div>;
  }

  return (
    <div className="software-detail">
      <h2>Detalles del Software</h2>
      <p><FontAwesomeIcon icon={faCode} /> <strong>Nombre:</strong> {software.nombre}</p>
      <p><FontAwesomeIcon icon={faCodeBranch} /> <strong>Versión:</strong> {software.version || 'No especificada'}</p>
      <p><FontAwesomeIcon icon={faKey} /> <strong>Licencia:</strong> {software.licencia || 'No especificada'}</p>
      <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Fecha de Adquisición:</strong> {new Date(software.fecha_adquisicion).toLocaleDateString()}</p>
      <p><FontAwesomeIcon icon={faClock} /> <strong>Fecha de Caducidad:</strong> {software.fecha_caducidad ? new Date(software.fecha_caducidad).toLocaleDateString() : 'No especificada'}</p>
      <p><FontAwesomeIcon icon={faClipboardList} /> <strong>Tipo de Licencia:</strong> {software.tipo_licencia}</p>
      <p><FontAwesomeIcon icon={faKey} /> <strong>Clave de Licencia:</strong> {software.clave_licencia || 'No especificada'}</p>
      <p><FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Asociado:</strong> {software.correo_asociado || 'No asociado'}</p>
      <p><FontAwesomeIcon icon={faLock} /> <strong>Contraseña del Correo:</strong> {software.contrasena_correo || 'No especificada'}</p>
      <p><FontAwesomeIcon icon={faClipboardList} /> <strong>Estado:</strong> {software.estado}</p>
      <p><FontAwesomeIcon icon={faCode} /> <strong>ID Equipos:</strong> {software.id_equipos || 'No asociado'}</p>
      <p><FontAwesomeIcon icon={software.licencia_caducada ? faTimesCircle : faCheckCircle} /> <strong>Licencia Caducada:</strong> {software.licencia_caducada ? 'Sí' : 'No'}</p>
    </div>
  );
};

export default SoftwareDetail;
