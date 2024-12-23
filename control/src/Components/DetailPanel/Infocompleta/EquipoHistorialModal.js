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
      setError('Error al obtener el historial del equipo.');
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
      className="modal historial-modal-expanded" // Modal ampliado
      overlayClassName="overlay"
    >
      <div className="modal-header">
        <h2>
          <FontAwesomeIcon icon={faHistory} /> Historial del Equipo
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
          <div className="table-container-expanded">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha de Operación</th>
                  <th>ID Equipo</th>
                  <th>Tipo de Dispositivo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Contraseña</th>
                  <th>RAM</th>
                  <th>Disco Duro</th>
                  <th>Tarjeta Madre</th>
                  <th>Tarjeta Gráfica</th>
                  <th>Procesador</th>
                  <th>Componentes Adicionales</th>
                  <th>Estado Físico</th>
                  <th>Detalles de Incidentes</th>
                  <th>Garantía</th>
                  <th>Fecha de Compra</th>
                  <th>Activo</th>
                  <th>Sistema Operativo</th>
                  <th>MAC</th>
                  <th>Hostname</th>
                  <th>ID Colaborador</th>
                  <th>Operación</th>

                </tr>
              </thead>
              <tbody>
                {historial.map((registro, index) => (
                  <tr key={index}>
                    <td>
                      {registro.fecha_operacion
                        ? new Date(registro.fecha_operacion).toLocaleString()
                        : "No disponible"}
                    </td>
                    <td>{registro.id_equipos || "No disponible"}</td>
                    <td>{registro.tipoDispositivo || "No disponible"}</td>
                    <td>{registro.marca || "No disponible"}</td>
                    <td>{registro.modelo || "No disponible"}</td>
                    <td>{registro.numeroSerie || "No disponible"}</td>
                    <td>{registro.contrasenaEquipo || "No disponible"}</td>
                    <td>{registro.ram || "No disponible"}</td>
                    <td>{registro.discoDuro || "No disponible"}</td>
                    <td>{registro.tarjetaMadre || "No disponible"}</td>
                    <td>{registro.tarjetaGrafica || "No disponible"}</td>
                    <td>{registro.procesador || "No disponible"}</td>
                    <td>
                      {registro.componentesAdicionales
                        ? JSON.stringify(registro.componentesAdicionales, null, 2)
                        : "No disponible"}
                    </td>
                    <td>{registro.estadoFisico || "No disponible"}</td>
                    <td>{registro.detallesIncidentes || "No disponible"}</td>
                    <td>{registro.garantia || "No disponible"}</td>
                    <td>{registro.fechaCompra || "No disponible"}</td>
                    <td>{registro.activo || "No disponible"}</td>
                    <td>{registro.sistemaOperativo || "No disponible"}</td>
                    <td>{registro.mac || "No disponible"}</td>
                    <td>{registro.hostname || "No disponible"}</td>
                    <td>{registro.idColaborador || "No disponible"}</td>
                    <td>{registro.operacion || "No disponible"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No se encontraron registros en el historial del equipo.</p>
        )}
      </div>
    </Modal>

  );
};

export default EquipoHistorialModal;
