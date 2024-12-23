import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles/SoftwareHistory.css';

// Configuración del modal
Modal.setAppElement('#root');

const SoftwareHistory = ({ isOpen, onClose, idSoftware }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el historial de software
  const fetchHistorial = async () => {
    if (!idSoftware) {
      console.error('ID del software inválido:', idSoftware);
      setError('ID del software no es válido.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:3550/api/software/${idSoftware}/historial`);
      const historialData = response.data;

      if (Array.isArray(historialData)) {
        setHistorial(historialData);
        setError(null);
      } else {
        setHistorial([]);
        setError('El formato de los datos del historial es inválido.');
      }
    } catch (err) {
      console.error('Error al obtener el historial del software:', err);
      setError('Error al obtener el historial del software.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchHistorial();
    }
  }, [isOpen, idSoftware]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Historial del Software"
      className="modal historial-modal-expanded"
      overlayClassName="overlay"
    >
      <div className="modal-header">
        <h2>
          <FontAwesomeIcon icon={faHistory} /> Historial del Software
        </h2>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="modal-content-expanded">
        {loading ? (
          <div className="loading">
            <p>Cargando historial...</p>
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchHistorial} className="retry-button">
              Reintentar
            </button>
          </div>
        ) : historial.length > 0 ? (
          <>
            {/* Historial principal del software */}
            <div className="table-container-expanded">
              <h3>Información General</h3>
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha de Operación</th>
                    <th>Nombre</th>
                    <th>Versión</th>
                    <th>Tipo de Licencia</th>
                    <th>Operación</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((registro, index) => (
                    <tr key={index}>
                      <td>
                        {registro.fecha_operacion
                          ? new Date(registro.fecha_operacion).toLocaleString()
                          : 'No disponible'}
                      </td>
                      <td>{registro.nombre || 'No disponible'}</td>
                      <td>{registro.version || 'No disponible'}</td>
                      <td>{registro.tipoLicencia || 'No disponible'}</td>
                      <td>{registro.operacion || 'No disponible'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Licencias asociadas */}
            <div className="table-container-expanded">
              <h3>Historial de Licencias</h3>
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Clave de Licencia</th>
                    <th>Correo Asociado</th>
                    <th>Estado de Renovación</th>
                    <th>Compartida</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.flatMap((registro) =>
                    registro.licencias?.map((licencia, index) => (
                      <tr key={`${registro.idSoftware}-${index}`}>
                        <td>{licencia.claveLicencia || 'No disponible'}</td>
                        <td>{licencia.correoAsociado || 'No disponible'}</td>
                        <td>{licencia.estadoRenovacion || 'No disponible'}</td>
                        <td>{licencia.compartida ? 'Sí' : 'No'}</td>
                      </tr>
                    )) || []
                  )}
                </tbody>
              </table>
            </div>

            {/* Equipos asociados */}
            <div className="table-container-expanded">
              <h3>Historial de Equipos Asociados</h3>
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>ID Equipo</th>
                    <th>Fecha de Asignación</th>
                    <th>Estado de Asignación</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.flatMap((registro) =>
                    registro.equiposAsociados?.map((equipo, index) => (
                      <tr key={`${registro.idSoftware}-${index}`}>
                        <td>{equipo.id_equipos || 'No disponible'}</td>
                        <td>
                          {equipo.fechaAsignacion
                            ? new Date(equipo.fechaAsignacion).toLocaleDateString()
                            : 'No disponible'}
                        </td>
                        <td>{equipo.estado_asignacion || 'No disponible'}</td>
                      </tr>
                    )) || []
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No se encontraron registros en el historial del software.</p>
        )}
      </div>
    </Modal>
  );
};

export default SoftwareHistory;
