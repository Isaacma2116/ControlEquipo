import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdBadge, faBuilding, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import './styles/ColaboradorDetail.css';

const ColaboradorDetail = ({ colaboradorId }) => {
  const [colaborador, setColaborador] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3550/api/colaboradores/${colaboradorId}`)
      .then(response => {
        setColaborador(response.data);

        // Construir la URL completa de la imagen si existe
        if (response.data.fotografia) {
          setImageUrl(`http://localhost:3550/uploads/colaboradores/${response.data.fotografia}`);
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });

    // Limpiar URL creada cuando el componente se desmonte
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [colaboradorId, imageUrl]);

  if (!colaborador) return <p>Cargando información del colaborador...</p>;

  return (
    <div className="colaborador-detail">
      <div className="img-container">
        {imageUrl && <img src={imageUrl} alt="Fotografía del colaborador" />}
      </div>
      <p><FontAwesomeIcon icon={faIdBadge} /> <strong>ID Empleado:</strong> {colaborador.id_empleado}</p>
      <p><FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong> {colaborador.nombre}</p>
      <p><FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong> {colaborador.area}</p>
      <p><FontAwesomeIcon icon={faUser} /> <strong>Cargo:</strong> {colaborador.cargo}</p>
      <p><FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Personal:</strong> {colaborador.correo}</p>
      <p><FontAwesomeIcon icon={faPhone} /> <strong>Teléfono Personal:</strong> {colaborador.telefono_personal}</p>
      {colaborador.correo_smex && (
        <p><FontAwesomeIcon icon={faEnvelope} /> <strong>Correo SMex:</strong> {colaborador.correo_smex}</p>
      )}
    </div>
  );
  
};

export default ColaboradorDetail;
