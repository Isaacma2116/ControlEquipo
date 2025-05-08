import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faBarcode, faTrash, faEdit, faSave, faTimes, faEnvelope, faKey, faCogs, faCalendar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './styles/CelularDetail.css';

const CelularDetail = ({ celularId }) => {
  const [celular, setCelular] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:3550/api/celulares/${celularId}`)
      .then((response) => {
        const data = response.data;
        setCelular(data);
        setFormData(data); // Inicializamos formData con los datos del celular
      })
      .catch((err) => {
        console.error('Error al cargar los datos del celular:', err);
        setError('Error al cargar los datos del celular.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [celularId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    axios
      .put(`http://localhost:3550/api/celulares/${celularId}`, formData)
      .then(() => {
        setCelular(formData);
        setIsEditing(false);
      })
      .catch((err) => {
        console.error('Error al actualizar los datos del celular:', err);
        setError('Error al actualizar los datos del celular.');
      });
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar este celular?')) {
      axios
        .delete(`http://localhost:3550/api/celulares/${celularId}`)
        .then(() => {
          alert('Celular eliminado correctamente.');
          window.location.reload();
        })
        .catch((err) => {
          console.error('Error al eliminar el celular:', err);
          setError('Error al eliminar el celular.');
        });
    }
  };

  if (loading) {
    return <div>Cargando información del celular...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!celular) {
    return <div>No se encontraron los datos del celular.</div>;
  }

  return (
    <div className="celular-detail">
      {isEditing ? (
        <div className="edit-form">
          {[
            { label: 'IMEI', icon: faBarcode, name: 'imei', disabled: true },
            { label: 'Marca', icon: faMobileAlt, name: 'marca' },
            { label: 'Modelo', icon: faMobileAlt, name: 'modelo' },
            { label: 'Número de Serie', icon: faBarcode, name: 'numeroDeSerie' },
            { label: 'Color', icon: faMobileAlt, name: 'color' },
            { label: 'Contraseña o PIN', icon: faKey, name: 'contrasena_o_pin' },
            { label: 'Correo Asociado', icon: faEnvelope, name: 'correoAsociado' },
            { label: 'Contraseña del Correo', icon: faKey, name: 'contrasenaDelCorreo' },
            { label: 'Componentes del Celular', icon: faCogs, name: 'componentesDelCelular' },
            { label: 'Renovación del Equipo', icon: faCalendar, name: 'renovacionDelEquipo', type: 'date' },
          ].map(({ label, icon, name, type, disabled }) => (
            <p key={name}>
              <FontAwesomeIcon icon={icon} /> <strong>{label}:</strong>
              <input
                type={type || 'text'}
                name={name}
                value={formData[name] || ''}
                onChange={handleInputChange}
                disabled={disabled}
              />
            </p>
          ))}
          <button onClick={handleSaveChanges} className="save-btn">
            <FontAwesomeIcon icon={faSave} /> Guardar Cambios
          </button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn">
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
        </div>
      ) : (
        <>
          {[
            { label: 'IMEI', icon: faBarcode, value: celular.imei },
            { label: 'Marca', icon: faMobileAlt, value: celular.marca },
            { label: 'Modelo', icon: faMobileAlt, value: celular.modelo },
            { label: 'Número de Serie', icon: faBarcode, value: celular.numeroDeSerie },
            { label: 'Color', icon: faMobileAlt, value: celular.color },
            { label: 'Contraseña o PIN', icon: faKey, value: celular.contrasena_o_pin },
            { label: 'Correo Asociado', icon: faEnvelope, value: celular.correoAsociado },
            { label: 'Contraseña del Correo', icon: faKey, value: celular.contrasenaDelCorreo },
            { label: 'Componentes del Celular', icon: faCogs, value: celular.componentesDelCelular },
            { label: 'Renovación del Equipo', icon: faCalendar, value: celular.renovacionDelEquipo },
          ].map(({ label, icon, value }) => (
            <p key={label}>
              <FontAwesomeIcon icon={icon} /> <strong>{label}:</strong> {value || 'No disponible'}
            </p>
          ))}
          <div className="button-container">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <FontAwesomeIcon icon={faEdit} /> Editar
            </button>
            <button onClick={handleDelete} className="delete-btn">
              <FontAwesomeIcon icon={faTrash} /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CelularDetail;
