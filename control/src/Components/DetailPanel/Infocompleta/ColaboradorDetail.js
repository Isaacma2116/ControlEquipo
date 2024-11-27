import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdBadge, faBuilding, faEnvelope, faPhone, faLaptop } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './styles/ColaboradorDetail.css';
import EquiposAsociados from './Forms/EquiposAsociados'; // Importamos el nuevo componente

const ColaboradorDetail = ({ colaboradorId }) => {
  const [colaborador, setColaborador] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:3550/api/colaboradores/${colaboradorId}/equipos`) // Ajusta la URL según tu backend
      .then((response) => {
        const data = response.data;
        setColaborador(data);
        setEquipos(data.equipos || []);
      })
      .catch((err) => {
        console.error('Error al cargar los datos del colaborador:', err);
        setError('Error al cargar los datos del colaborador.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [colaboradorId]);

  if (loading) {
    return <div>Cargando información del colaborador...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!colaborador) {
    return <div>No se encontraron los datos del colaborador.</div>;
  }

  return (
    <div className="colaborador-detail">
      <div className="img-container">
        {colaborador.fotografia && (
          <img
            src={`http://localhost:3550/uploads/colaboradores/${colaborador.fotografia}`}
            alt="Fotografía del colaborador"
            className="colaborador-foto"
          />
        )}
      </div>
      <p>
        <FontAwesomeIcon icon={faIdBadge} /> <strong>ID Empleado:</strong> {colaborador.id_empleado}
      </p>
      <p>
        <FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong> {colaborador.nombre}
      </p>
      <p>
        <FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong> {colaborador.area}
      </p>
      <p>
        <FontAwesomeIcon icon={faUser} /> <strong>Cargo:</strong> {colaborador.cargo}
      </p>
      <p>
        <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Personal:</strong> {colaborador.correo}
      </p>
      <p>
        <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono Personal:</strong> {colaborador.telefono_personal}
      </p>

      {equipos.length > 0 && (
        <button onClick={() => setShowModal(true)} className="show-modal-btn">
          <FontAwesomeIcon icon={faLaptop} /> Ver Equipos Asociados
        </button>
      )}

      {/* Renderizamos el modal de Equipos Asociados */}
      <EquiposAsociados equipos={equipos} showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default ColaboradorDetail;
