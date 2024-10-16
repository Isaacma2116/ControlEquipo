import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faIdBadge, faBuilding, faEnvelope, faPhone, faLaptop
} from '@fortawesome/free-solid-svg-icons';
import './styles/ColaboradorDetail.css';  // Asegúrate de que la ruta al archivo CSS es correcta

const ColaboradorDetail = ({ colaboradorId }) => {
  const [colaborador, setColaborador] = useState(null);
  const [equipos, setEquipos] = useState([]);  // Estado para los equipos asociados
  const [showEquipos, setShowEquipos] = useState(false);  // Controla la visibilidad de los equipos
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [error, setError] = useState(null);  // Estado para manejar errores

  useEffect(() => {
    // Reiniciar los estados en cada carga del colaborador
    setColaborador(null);
    setEquipos([]);
    setShowEquipos(false);
    setLoading(true);
    setError(null);

    // Solicitud para obtener los datos del colaborador
    axios.get(`http://localhost:3550/api/colaboradores/${colaboradorId}`)
      .then(response => {
        const data = response.data;

        // Verifica si el colaborador tiene equipos y asigna los estados correctamente
        setColaborador(data);
        setEquipos(data.equipos || []);  // Asegurarse de que siempre sea un array
      })
      .catch(error => {
        setError('Error al cargar los datos del colaborador.');
      })
      .finally(() => {
        setLoading(false);  // Finalizar la carga independientemente del resultado
      });
  }, [colaboradorId]);

  // Mostrar un mensaje de carga si los datos aún no están disponibles
  if (loading) {
    return <div>Cargando información del colaborador...</div>;
  }

  // Mostrar un mensaje de error si algo salió mal
  if (error) {
    return <div>{error}</div>;
  }

  // Verificar si no se encontró el colaborador
  if (!colaborador) {
    return <div>No se encontraron los datos del colaborador.</div>;
  }

  return (
    <div className="colaborador-detail">
      <div className="img-container">
        {colaborador.fotografia && (
          <img src={`http://localhost:3550/uploads/colaboradores/${colaborador.fotografia}`} alt="Fotografía del colaborador" />
        )}
      </div>
      <p><FontAwesomeIcon icon={faIdBadge} /> ID Empleado: {colaborador.id_empleado}</p>
      <p><FontAwesomeIcon icon={faUser} /> Nombre: {colaborador.nombre}</p>
      <p><FontAwesomeIcon icon={faBuilding} /> Área: {colaborador.area}</p>
      <p><FontAwesomeIcon icon={faUser} /> Cargo: {colaborador.cargo}</p>
      <p><FontAwesomeIcon icon={faEnvelope} /> Correo Personal: {colaborador.correo}</p>
      <p><FontAwesomeIcon icon={faPhone} /> Teléfono Personal: {colaborador.telefono_personal}</p>

      {/* Botón para mostrar/ocultar equipos solo si existen */}
      {equipos.length > 0 && (
        <button onClick={() => setShowEquipos(!showEquipos)}>
          <FontAwesomeIcon icon={faLaptop} /> {showEquipos ? 'Ocultar Equipos' : 'Ver Equipos'}
        </button>
      )}

      {/* Lista de equipos asociados si se han cargado */}
      {showEquipos && equipos.length > 0 && (
        <div className="equipos-list">
          <h2>Equipos Asociados</h2>
          {equipos.map(equipo => (
            <div key={equipo.id_equipos} className="equipo-info">
              {equipo.imagen && (
                <img src={`http://localhost:3550/uploads/equipos/${equipo.imagen}`} alt={`Equipo ${equipo.nombre}`} />
              )}
              <p><strong>ID:</strong> {equipo.id_equipos}</p>
              <p><strong>Nombre:</strong> {equipo.nombre}</p>
            </div>
          ))}
        </div>
      )}

      {/* Si no hay equipos */}
      {equipos.length === 0 && <p>No hay equipos asociados.</p>}
    </div>
  );
};

export default ColaboradorDetail;
