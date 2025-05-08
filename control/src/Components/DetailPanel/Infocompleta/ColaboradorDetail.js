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
import styles from './styles/ColaboradorDetail.module.css';

const ColaboradorDetail = ({ colaboradorId, onEquipoClick }) => {
  const [colaborador, setColaborador] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550';

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE_URL}/api/colaboradores/${colaboradorId}/equipos`)
      .then((response) => {
        const data = response.data;
        setColaborador(data);
        setEquipos(data.equipos || []);
        setFormData({
          id_empleado: data.id_empleado || '',
          nombre: data.nombre || '',
          area: data.area || '',
          cargo: data.cargo || '',
          correo: data.correo || '',
          correo_corporativo: data.correo_smex || '', // Renombrado
          telefono_personal: data.telefono_personal || '',
          telefono_corporativo: data.telefono_smex || '', // Renombrado
        });
      })
      .catch(() => {
        setError('Error al cargar los datos del colaborador.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [colaboradorId, API_BASE_URL]);

  const handleDelete = () => {
    if (equipos.length > 0) {
      alert('No puedes eliminar este colaborador porque tiene equipos asociados.');
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      axios
        .delete(`${API_BASE_URL}/api/colaboradores/${colaboradorId}`)
        .then(() => {
          alert('Colaborador eliminado con éxito.');
          window.location.reload();
        })
        .catch(() => {
          setError('Error al eliminar el colaborador.');
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    try {
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

      setColaborador(response.data.data);
      setEquipos(response.data.data.equipos || []);
      setIsEditing(false);
      setImageFile(null);
      alert('Cambios guardados exitosamente.');
    } catch {
      setError('Error al actualizar los datos del colaborador.');
    }
  };

  if (loading) return <div className={styles.loading}>Cargando información del colaborador...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!colaborador) return <div className={styles.noData}>No se encontraron los datos del colaborador.</div>;

  return (
    <div className={styles.colaboradorDetail}>
      {isEditing ? (
        <div className={styles.editSection}>
          <h2 className={styles.sectionTitle}>Editar Colaborador</h2>
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faImage} /> Fotografía:
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imageFile && (
              <div className={styles.imgPreview}>
                <img src={URL.createObjectURL(imageFile)} alt="Vista previa" />
              </div>
            )}
          </div>
          {Object.keys(formData).map((key) => (
            <div className={styles.formGroup} key={key}>
              <label>
                <strong>{key.replace('_', ' ').toUpperCase()}:</strong>
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className={styles.formButtons}>
            <button onClick={handleSaveChanges} className={styles.saveBtn}>
              <FontAwesomeIcon icon={faSave} /> Guardar
            </button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.infoSection}>
            <div className={styles.colaboradorPhoto}>
              <img
                src={`${API_BASE_URL}/uploads/colaboradores/${colaborador.fotografia || 'default.png'}`}
                alt="Foto"
              />
            </div>
            <div className={styles.colaboradorDetails}>
              {Object.keys(formData).map((key) => (
                <p key={key}>
                  <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {colaborador[key]}
                </p>
              ))}
            </div>
          </div>
          <div className={styles.equiposSection}>
            <h2>Equipos Asociados</h2>
            {equipos.length > 0 ? (
              equipos.map((equipo) => (
                <div key={equipo.id_equipos} className={styles.equipoCard}>
                  <p>
                    <strong>Tipo:</strong> {equipo.tipoDispositivo}
                  </p>
                  <p>
                    <strong>Marca:</strong> {equipo.marca}
                  </p>
                </div>
              ))
            ) : (
              <p>No hay equipos asociados.</p>
            )}
          </div>
          <div className={styles.actionsSection}>
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