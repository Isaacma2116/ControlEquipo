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
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from './styles/ColaboradorDetail.module.css'; // Importar como módulo CSS

const ColaboradorDetail = ({ colaboradorId, onEquipoClick }) => {
  const [colaborador, setColaborador] = useState(null);
  const [equipos, setEquipos] = useState([]); // Equipos asociados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({}); // Datos editables del colaborador
  const [imageFile, setImageFile] = useState(null); // Archivo de imagen seleccionado

  // URL base desde variables de entorno
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550';

  // Cargar datos del colaborador
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE_URL}/api/colaboradores/${colaboradorId}/equipos`)
      .then((response) => {
        const data = response.data;
        console.log('Datos del colaborador recibidos:', data);
        setColaborador(data);
        setEquipos(data.equipos || []);
        setFormData({
          id_empleado: data.id_empleado || '',
          nombre: data.nombre || '',
          area: data.area || '',
          cargo: data.cargo || '',
          correo: data.correo || '',
          correo_smex: data.correo_smex || '',
          telefono_personal: data.telefono_personal || '',
          telefono_smex: data.telefono_smex || '',
        });
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

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Guardar cambios del colaborador
  const handleSaveChanges = async () => {
    try {
      // Crear un objeto FormData para enviar los datos y la imagen
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (imageFile) {
        formDataToSend.append('fotografia', imageFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/colaboradores/${colaboradorId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Actualizar el estado con los nuevos datos del colaborador
      setColaborador(response.data.data);
      setEquipos(response.data.data.equipos || []);
      setIsEditing(false);
      setImageFile(null);
      alert('Cambios guardados exitosamente.');
    } catch (err) {
      console.error('Error al actualizar los datos del colaborador:', err);
      if (err.response && err.response.status === 404) {
        setError('Colaborador no encontrado.');
      } else {
        setError('Error al actualizar los datos del colaborador.');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Cargando información del colaborador...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!colaborador) return <div className={styles.noData}>No se encontraron los datos del colaborador.</div>;

  return (
    <div className={styles.colaboradorDetail}>
      {isEditing ? (
        // Formulario de edición
        <div className={styles.editForm}>
          {/* Campo para editar la imagen con vista previa */}
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faImage} /> <strong>Fotografía:</strong>
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imageFile && (
              <div className={styles.imgPreview}>
                <p>Imagen seleccionada:</p>
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Vista previa"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>

          {/* Campos de edición */}
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faUser} /> <strong>Nombre:</strong>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faBuilding} /> <strong>Área:</strong>
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faUser} /> <strong>Cargo:</strong>
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo Personal:</strong>
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo SMEX:</strong>
            </label>
            <input
              type="email"
              name="correo_smex"
              value={formData.correo_smex}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono Personal:</strong>
            </label>
            <input
              type="tel"
              name="telefono_personal"
              value={formData.telefono_personal}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faPhone} /> <strong>Teléfono SMEX:</strong>
            </label>
            <input
              type="tel"
              name="telefono_smex"
              value={formData.telefono_smex}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formButtons}>
            <button onClick={handleSaveChanges} className={styles.saveBtn}>
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Información del colaborador
        <>
          <div className={styles.colaboradorInfo}>
            <div className={styles.imgContainer}>
              <img
                src={`${API_BASE_URL}/uploads/colaboradores/${colaborador.fotografia || 'default.png'}?t=${new Date().getTime()}`}
                alt={`Foto de ${colaborador.nombre || 'Colaborador'}`}
                className={styles.colaboradorImage}
              />
            </div>
            <div className={styles.infoDetails}>
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
            </div>
          </div>

          {/* Equipos Asociados */}
          <h2 className={styles.sectionTitle}>Equipos Asociados</h2>
          {equipos.length > 0 ? (
            <div className={styles.equiposGrid}>
              {equipos.map((equipo) => (
                <div key={equipo.id_equipos} className={styles.equipoItem}>
                  <div
                    className={styles.equipoId}
                    onClick={() => onEquipoClick(equipo.id_equipos)}
                    tabIndex="0"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onEquipoClick(equipo.id_equipos);
                      }
                    }}
                  >
                    {equipo.id_equipos}
                  </div>
                  <div className={styles.equipoInfo}>
                    <p><strong>Tipo:</strong> {equipo.tipoDispositivo}</p>
                    <p><strong>Marca:</strong> {equipo.marca}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noEquipos}>No hay equipos asociados a este colaborador.</p>
          )}

          <div className={styles.buttonContainer}>
            <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <FontAwesomeIcon icon={faEdit} /> Editar
            </button>
            <button onClick={handleDelete} className={styles.deleteBtn}>
              <FontAwesomeIcon icon={faTimes} /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ColaboradorDetail;
