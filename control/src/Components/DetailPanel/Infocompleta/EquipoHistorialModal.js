import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles/EquipoHistorialModal.css';

// Configurar Modal
Modal.setAppElement('#root');

const EquipoHistorialModal = ({ isOpen, onClose, idEquipo }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el historial
  const fetchHistorial = async () => {
    if (!idEquipo) {
      console.error('ID del equipo inválido:', idEquipo);
      setError('ID del equipo no es válido.');
      setLoading(false);
      return;
    }

    console.log(`Obteniendo historial para idEquipo: ${idEquipo}`);
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:3550/api/equipos/${idEquipo}/historial`);
      const historialData = response.data;

      // Verificar si el historial es un array
      if (Array.isArray(historialData)) {
        setHistorial(historialData);
        setError(null);
      } else {
        setHistorial([]);
        setError('El formato de los datos del historial es inválido.');
      }
    } catch (err) {
      console.error('Error al obtener el historial del equipo:', err);

      if (err.message.includes('Network Error')) {
        setError('No se pudo conectar al servidor. Por favor, verifica tu conexión.');
      } else if (err.response && err.response.status === 404) {
        setError('No se encontraron registros en el historial para este equipo.');
      } else {
        setError('Error inesperado al obtener el historial del equipo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      fetchHistorial();
    }
  }, [isOpen, idEquipo]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Historial del Equipo"
      className="modal historial-modal"
      overlayClassName="overlay"
    >
      <div className="modal-header">
        <h2><FontAwesomeIcon icon={faHistory} /> Historial del Equipo</h2>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} /> Cerrar
        </button>
      </div>
      <div className="modal-content">
        {loading ? (
          <div className="loading">
            <p>Cargando historial...</p>
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchHistorial} className="retry-button">Reintentar</button>
          </div>
        ) : historial.length > 0 ? (
          <table className="historial-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Operación</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((registro, index) => (
                <tr key={index}>
                  <td>{new Date(registro.fecha_operacion).toLocaleDateString()}</td>
                  <td>{new Date(registro.fecha_operacion).toLocaleTimeString()}</td>
                  <td>{registro.operacion}</td>
                  <td>
                    <details>
                      <summary>Ver detalles</summary>
                      <div>
                        <p><strong>ID Equipo:</strong> {registro.id_equipos}</p>
                        <p><strong>Tipo de Dispositivo:</strong> {registro.tipoDispositivo}</p>
                        <p><strong>Marca:</strong> {registro.marca}</p>
                        <p><strong>Modelo:</strong> {registro.modelo}</p>
                        <p><strong>Número de Serie:</strong> {registro.numeroSerie}</p>
                        <p><strong>Contraseña del Equipo:</strong> {registro.contrasenaEquipo}</p>
                        <p><strong>RAM:</strong> {registro.ram}</p>
                        <p><strong>Disco Duro:</strong> {registro.discoDuro}</p>
                        <p><strong>Tarjeta Madre:</strong> {registro.tarjetaMadre}</p>
                        <p><strong>Tarjeta Gráfica:</strong> {registro.tarjetaGrafica}</p>
                        <p><strong>Procesador:</strong> {registro.procesador}</p>
                        <p><strong>Componentes Adicionales:</strong> {registro.componentesAdicionales}</p>
                        <p><strong>Estado Físico:</strong> {registro.estadoFisico}</p>
                        <p><strong>Detalles de Incidentes:</strong> {registro.detallesIncidentes}</p>
                        <p><strong>Garantía:</strong> {registro.garantia}</p>
                        <p><strong>Fecha de Compra:</strong> {registro.fechaCompra}</p>
                        <p><strong>Activo:</strong> {registro.activo}</p>
                        <p><strong>Sistema Operativo:</strong> {registro.sistemaOperativo}</p>
                        <p><strong>MAC:</strong> {registro.mac}</p>
                        <p><strong>Hostname:</strong> {registro.hostname}</p>
                        <p><strong>ID Colaborador:</strong> {registro.idColaborador}</p>
                        <p><strong>Imagen:</strong> {registro.imagen ? <a href={registro.imagen} target="_blank" rel="noopener noreferrer">Ver imagen</a> : 'No disponible'}</p>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No se encontraron registros en el historial del equipo.</p>
        )}
      </div>
    </Modal>
  );
};

export default EquipoHistorialModal;
