// src/components/SoftwareHistory.js

import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './styles/SoftwareHistory.module.css'; // Importar como módulo

// Configuración del modal
Modal.setAppElement('#root');

const SoftwareHistory = ({ isOpen, onClose, idSoftware }) => {
  const [softwareHistorial, setSoftwareHistorial] = useState([]);
  const [licenciasHistorial, setLicenciasHistorial] = useState([]);
  const [equiposHistorial, setEquiposHistorial] = useState([]);
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
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3550/api/software/${idSoftware}/historial`);
      const { softwareHistorial, licenciasHistorial, equiposHistorial } = response.data;

      // Asegurarse de que los datos sean arrays
      setSoftwareHistorial(Array.isArray(softwareHistorial) ? softwareHistorial : []);
      setLicenciasHistorial(Array.isArray(licenciasHistorial) ? licenciasHistorial : []);
      setEquiposHistorial(Array.isArray(equiposHistorial) ? equiposHistorial : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, idSoftware]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Historial del Software"
      className={styles['modal'] + ' ' + styles['historial-modal-expanded']}
      overlayClassName={styles['overlay']}
    >
      <div className={styles['modal-header']}>
        <h2>
          <FontAwesomeIcon icon={faHistory} /> Historial del Software
        </h2>
        <button className={styles['close-button']} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className={styles['modal-content-expanded']}>
        {loading ? (
          <div className={styles['loading']}>
            <p>Cargando historial...</p>
            <div className={styles['spinner']}></div>
          </div>
        ) : error ? (
          <div className={styles['error']}>
            <p>{error}</p>
            <button onClick={fetchHistorial} className={styles['retry-button']}>
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Historial principal del software */}
            <div className={styles['table-container-expanded']}>
              <h3>Información General</h3>
              {softwareHistorial.length > 0 ? (
                <table className={styles['historial-table']}>
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
                    {softwareHistorial.map((registro) => (
                      <tr key={registro.id_historial}>
                        <td>
                          {registro.fecha_operacion
                            ? new Date(registro.fecha_operacion).toLocaleString()
                            : 'No disponible'}
                        </td>
                        <td>{registro.nombre || 'No disponible'}</td>
                        <td>{registro.version || 'No disponible'}</td>
                        <td>{registro.tipoLicencia || 'No disponible'}</td>
                        <td>{registro.accion || 'No disponible'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No se encontraron registros en el historial general.</p>
              )}
            </div>

            {/* Historial de Licencias */}
            <div className={styles['table-container-expanded']}>
              <h3>Historial de Licencias</h3>
              {licenciasHistorial.length > 0 ? (
                <table className={styles['historial-table']}>
                  <thead>
                    <tr>
                      <th>Fecha de Operación</th>
                      <th>Clave de Licencia</th>
                      <th>Correo Asociado</th>
                      <th>Estado de Renovación</th>
                      <th>Compartida</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenciasHistorial.map((licencia) => (
                      <tr key={licencia.id_historial}>
                        <td>
                          {licencia.fecha_operacion
                            ? new Date(licencia.fecha_operacion).toLocaleString()
                            : 'No disponible'}
                        </td>
                        <td>{licencia.claveLicencia || 'No disponible'}</td>
                        <td>{licencia.correoAsociado || 'No disponible'}</td>
                        <td>{licencia.estadoRenovacion || 'No disponible'}</td>
                        <td>{licencia.compartida ? 'Sí' : 'No'}</td>
                        <td>{licencia.accion || 'No disponible'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No se encontraron registros en el historial de licencias.</p>
              )}
            </div>

            {/* Historial de Equipos Asociados */}
            <div className={styles['table-container-expanded']}>
              <h3>Historial de Equipos Asociados</h3>
              {equiposHistorial.length > 0 ? (
                <table className={styles['historial-table']}>
                  <thead>
                    <tr>
                      <th>Fecha de Operación</th>
                      <th>ID Equipo</th>
                      <th>Fecha de Asignación</th>
                      <th>Estado de Asignación</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equiposHistorial.map((equipo) => (
                      <tr key={equipo.id_historial}>
                        <td>
                          {equipo.fecha_operacion
                            ? new Date(equipo.fecha_operacion).toLocaleString()
                            : 'No disponible'}
                        </td>
                        <td>{equipo.id_equipos || 'No disponible'}</td>
                        <td>
                          {equipo.fechaAsignacion
                            ? new Date(equipo.fechaAsignacion).toLocaleDateString()
                            : 'No disponible'}
                        </td>
                        <td>{equipo.estado_asignacion || 'No disponible'}</td>
                        <td>{equipo.accion || 'No disponible'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No se encontraron registros en el historial de equipos asociados.</p>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SoftwareHistory;
