import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SoftwareHistory.css';

const SoftwareHistory = ({ idSoftware, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (idSoftware) {
      fetchHistory();
    }
  }, [idSoftware]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3550/api/software/${idSoftware}/historial`);
      if (response.data && Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
        setError('La respuesta del servidor no es válida');
      }
      setLoading(false);
    } catch (error) {
      setError('Error al cargar el historial');
      setLoading(false);
    }
  };

  return (
    <div className="software-history">
      <div className="history-header">
        <h2>Historial de Software</h2>
        <button onClick={onClose} className="close-button">Cerrar</button>
      </div>
      {loading && <p>Cargando historial...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="history-list">
          {history.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Fecha Operación</th>
                  <th>Acción</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.fecha_operacion).toLocaleString()}</td>
                    <td>{record.accion}</td>
                    <td>
                      {Object.entries(record)
                        .filter(([key]) => !['id_historial', 'id_software', 'accion', 'fecha_operacion'].includes(key))
                        .map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {value || 'N/A'}
                          </div>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay registros en el historial.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SoftwareHistory;
