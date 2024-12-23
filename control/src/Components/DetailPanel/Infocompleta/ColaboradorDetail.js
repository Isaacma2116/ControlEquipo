// ColaboradorDetail.jsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faIdBadge,
  faBuilding,
  faEnvelope,
  faPhone,
  faEdit,
  faSave,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './styles/ColaboradorDetail.css';

const ColaboradorDetail = ({ colaboradorId, onEquipoClick }) => {
  const [colaborador, setColaborador] = useState(null);
  const [equipos, setEquipos] = useState([]); // Equipos asociados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({}); // Datos editables del colaborador

  // URL base desde variables de entorno
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550';

  // Función auxiliar para obtener la URL correcta de la imagen
  const getImageUrl = (imagen) => {
    if (!imagen) return '/default-equipo-image.jpg'; // Imagen por defecto

    // Si 'imagen' es una cadena
    if (typeof imagen === 'string') {
      if (/^https?:\/\//i.test(imagen)) {
        return imagen; // URL completa
      }
      // Asegurarse de que hay solo un '/' entre la base y la ruta
      return `${API_BASE_URL}${imagen.startsWith('/') ? '' : '/'}${imagen}`;
    }

    // Si 'imagen' es un objeto con propiedad 'url'
    if (imagen.url && typeof imagen.url === 'string') {
      if (/^https?:\/\//i.test(imagen.url)) {
        return imagen.url; // URL completa
      }
      return `${API_BASE_URL}${imagen.url.startsWith('/') ? '' : '/'}${imagen.url}`;
    }

    // Si 'imagen' no coincide con ninguno de los anteriores, usar la imagen por defecto
    return '/default-equipo-image.jpg';
  };

  // Cargar datos del colaborador
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE_URL}/api/colaboradores/${colaboradorId}/equipos`)
      .then((response) => {
        const data = response.data;
        console.log('Datos del colaborador recibidos:', data); // Registro de datos
        setColaborador(data); // Almacenar datos del colaborador
        setEquipos(data.equipos || []); // Equipos asociados
        setFormData({
          id_empleado: data.id_empleado || '',
          nombre: data.nombre || '',
          area: data.area || '',
          cargo: data.cargo || '',
          correo: data.correo || '',
          correo_smex: data.correo_smex || '',
          telefono_personal: data.telefono_personal || '',
          telefono_smex: data.telefono_smex || '',
          // Agrega otros campos según sea necesario
        }); // Inicializamos formData con los datos del colaborador
      })
      .catch((err) => {
        console.error('Error al cargar los datos del colaborador:', err);
        setError('Error al cargar los datos del colaborador.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [colaboradorId, API_BASE_URL]);

  // Eliminar colaborador
  const handleDelete = () => {
    if (equipos.length > 0) {
      // Mostrar mensaje si tiene equipos asociados
      alert('No puedes eliminar este colaborador porque tiene equipos asociados. Por favor, reasigna los equipos antes de eliminarlo.');
      return;
    }
  
    if (window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      axios
        .delete(`${API_BASE_URL}/api/colaboradores/${colaboradorId}`)
        .then(() => {
          alert('Colaborador eliminado con éxito.');
          window.location.reload();
        })
        .catch((err) => {
          console.error('Error al eliminar el colaborador:', err);
          setError('Error al eliminar el colaborador.');
        });
    }
  };  

  // Manejar cambios en los campos de edición
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Guardar cambios del colaborador
  const handleSaveChanges = () => {
    // Validar los campos si es necesario
    axios
      .put(`${API_BASE_URL}/api/colaboradores/${colaboradorId}`, formData)
      .then(() => {
        setColaborador(formData);
        setIsEditing(false);
        alert('Cambios guardados exitosamente.');
      })
      .catch((err) => {
        console.error('Error al actualizar los datos del colaborador:', err);
        setError('Error al actualizar los datos del colaborador.');
      });
  };

  if (loading) return <div>Cargando información del colaborador...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!colaborador) return <div>No se encontraron los datos del colaborador.</div>;

  return (
    <div className="colaborador-detail">
      <div className="img-container">
        {colaborador.fotografia ? (
          <img
            src={`${API_BASE_URL}/uploads/colaboradores/${colaborador.fotografia}`}
            alt="Fotografía del colaborador"
            className="colaborador-foto"
            onError={(e) => {
              if (!e.target.dataset.hasError) { // Evitar bucles infinitos
                e.target.src = '/default-colaborador-image.jpg';
                e.target.dataset.hasError = true;
              }
            }}
          />
        ) : (
          <img
            src="/default-colaborador-image.jpg"
            alt="Fotografía por defecto"
            className="colaborador-foto"
          />
        )}
      </div>

      {isEditing ? (
        // Formulario de edición
        <div className="edit-form">
          <p>
            <FontAwesomeIcon icon={faIdBadge} /> <strong>ID Empleado:</strong>
            <input
              type="text"
              name="id_empleado"
              value={formData.id_empleado}
              onChange={handleInputChange}
              disabled
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faUser} /> <strong>Cargo:</strong>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Personal:</strong>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo SMEX:</strong>
            <input
              type="email"
              name="correo_smex"
              value={formData.correo_smex}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono Personal:</strong>
            <input
              type="tel"
              name="telefono_personal"
              value={formData.telefono_personal}
              onChange={handleInputChange}
            />
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono SMEX:</strong>
            <input
              type="tel"
              name="telefono_smex"
              value={formData.telefono_smex}
              onChange={handleInputChange}
            />
          </p>
          {/* Agrega más campos de ser necesario */}

          <div className="form-buttons">
            <button onClick={handleSaveChanges} className="save-btn">
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Información del colaborador
        <>
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
            <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo SMEX:</strong> {colaborador.correo_smex || 'No disponible'}
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono Personal:</strong> {colaborador.telefono_personal}
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono SMEX:</strong> {colaborador.telefono_smex || 'No disponible'}
          </p>

          {/* Equipos Asociados */}
          <h2>Equipos Asociados</h2>
          {equipos.length > 0 ? (
            <div className="equipos-grid">
              {equipos.map((equipo) => {
                console.log(`Equipo ID: ${equipo.id_equipos}, imagen:`, equipo.imagen);

                const imageUrl = getImageUrl(equipo.imagen);

                return (
                  <div key={equipo.id_equipos} className="equipo-item">
                    <img
                      src={imageUrl}
                      alt={`Equipo ${equipo.id_equipos} - ${equipo.tipoDispositivo} de marca ${equipo.marca}`}
                      className="equipo-imagen"
                      onClick={() => onEquipoClick(equipo.id_equipos)}
                      onError={(e) => {
                        if (!e.target.dataset.hasError) { // Evitar bucles infinitos
                          e.target.src = '/default-equipo-image.jpg';
                          e.target.dataset.hasError = true;
                        }
                      }}
                      loading="lazy" // Carga diferida para optimizar
                      tabIndex="0" // Para accesibilidad
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          onEquipoClick(equipo.id_equipos);
                        }
                      }}
                    />
                    <div className="equipo-info">
                      <p><strong>Tipo:</strong> {equipo.tipoDispositivo}</p>
                      <p><strong>Marca:</strong> {equipo.marca}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No hay equipos asociados a este colaborador.</p>
          )}

          <div className="button-container">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <FontAwesomeIcon icon={faEdit} /> Editar
            </button>
            <button onClick={handleDelete} className="delete-btn">
              <FontAwesomeIcon icon={faTimes} /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ColaboradorDetail;
