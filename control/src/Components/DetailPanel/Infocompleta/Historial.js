import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './styles/Historial.css';

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Eliminar la función que hacía la solicitud a la API, ya que no existe
  const fetchHistorial = async () => {
    // Solo se simula la carga de datos ahora
    setLoading(false);
    setHistorial([
      { id_historial: 1, tabla: 'software', id_registro: 12, accion: 'Actualización', fecha: new Date(), datos_anteriores: { nombre: 'Antiguo' }, datos_nuevos: { nombre: 'Nuevo' } },
      { id_historial: 2, tabla: 'software_equipos', id_registro: 15, accion: 'Eliminación', fecha: new Date(), datos_anteriores: { equipo: 'Equipo A' }, datos_nuevos: null },
    ]);
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const filteredHistorial = historial.filter((record) =>
    record.tabla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpandedRecord = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="historial-container">
      <div className="search-bar">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar en el historial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <h2>Historial de Cambios</h2>
      {historial.length === 0 && !loading && !error ? (
        <p>No hay registros de historial disponibles.</p>
      ) : (
        filteredHistorial.length === 0 ? (
          <p>No se encontraron resultados para la búsqueda actual.</p>
        ) : (
          filteredHistorial.map((record) => (
            <div key={record.id_historial} className="historial-record">
              <p>
                <strong>Tabla:</strong> {record.tabla} - <strong>ID:</strong> {record.id_registro}
              </p>
              <p><strong>Acción:</strong> {record.accion}</p>
              <p><strong>Fecha:</strong> {new Date(record.fecha).toLocaleString()}</p>
              <button onClick={() => toggleExpandedRecord(record.id_historial)}>
                {expandedRecord === record.id_historial ? 'Ocultar Detalles' : 'Ver Detalles'}
              </button>
              {expandedRecord === record.id_historial && (
                <div className="historial-details">
                  <h5>Datos Anteriores</h5>
                  <pre>{JSON.stringify(record.datos_anteriores, null, 2) || 'No disponibles'}</pre>
                  <h5>Datos Nuevos</h5>
                  <pre>{JSON.stringify(record.datos_nuevos, null, 2) || 'No disponibles'}</pre>
                </div>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
};

export default Historial;
