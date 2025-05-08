import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './styles/ColaboradorForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdBadge, faBuilding, faEnvelope, faPhone, faFileImage } from '@fortawesome/free-solid-svg-icons';

const ColaboradorForm = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    idEmpleado: '',
    nombreEmpleado: '',
    area: '',
    cargo: '',
    correoPersonal: '',
    telefonoPersonal: '',
    correoSmex: '',
    telefonoSmex: '', // Nuevo campo agregado
    fotografia: null,
  });

  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setIsModified(true);
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData((prevData) => ({ ...prevData, fotografia: e.target.files[0] }));
    setIsModified(true);
  }, []);

  const validateForm = useCallback(() => {
    const formErrors = {};

    if (!formData.idEmpleado) formErrors.idEmpleado = 'El ID del empleado es obligatorio.';
    if (!formData.nombreEmpleado) formErrors.nombreEmpleado = 'El nombre del empleado es obligatorio.';
    if (!formData.correoPersonal) {
      formErrors.correoPersonal = 'El correo personal es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.correoPersonal)) {
      formErrors.correoPersonal = 'El correo personal no tiene un formato válido.';
    }
    if (!formData.telefonoPersonal) {
      formErrors.telefonoPersonal = 'El teléfono personal es obligatorio.';
    } else if (!/^\d{10}$/.test(formData.telefonoPersonal)) {
      formErrors.telefonoPersonal = 'El teléfono personal debe tener 10 dígitos.';
    }
    if (formData.correoSmex && !formData.correoSmex.endsWith('@shonanmexico.com.mx')) {
      formErrors.correoSmex = 'El correo SMex debe pertenecer al dominio @shonanmexico.com.mx.';
    }
    if (formData.telefonoSmex && !/^\d{10}$/.test(formData.telefonoSmex)) {
      formErrors.telefonoSmex = 'El teléfono SMex debe tener 10 dígitos.';
    }
    if (!formData.fotografia) {
      formErrors.fotografia = 'La fotografía es obligatoria.';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      idEmpleado: '',
      nombreEmpleado: '',
      area: '',
      cargo: '',
      correoPersonal: '',
      telefonoPersonal: '',
      correoSmex: '',
      telefonoSmex: '', // Resetea el nuevo campo
      fotografia: null,
    });
    setErrors({});
    setIsModified(false);
  }, []);

  const handleFormClose = useCallback(() => {
    if (isModified) {
      const confirmClose = window.confirm(
        'Tienes cambios sin guardar. Si cierras ahora, se perderán. ¿Seguro que deseas cerrar?'
      );
      if (!confirmClose) return;
    }
    resetForm();
    handleClose();
  }, [isModified, handleClose, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('id_empleado', formData.idEmpleado);
      formDataToSend.append('nombre', formData.nombreEmpleado);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('cargo', formData.cargo);
      formDataToSend.append('correo', formData.correoPersonal);
      formDataToSend.append('telefono_personal', formData.telefonoPersonal);
      formDataToSend.append('correo_smex', formData.correoSmex);
      formDataToSend.append('telefono_smex', formData.telefonoSmex); // Agrega el nuevo campo
      formDataToSend.append('fotografia', formData.fotografia);

      try {
        const response = await axios.post('http://localhost:3550/api/colaboradores', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response && response.data) {
          console.log('Datos enviados:', response.data);
          resetForm();
          handleClose();
          window.location.reload(); // Refresca la página
        } else {
          console.error('Error: La respuesta no contiene datos.');
        }
      } catch (error) {
        console.error('Error al enviar los datos:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="form-overlay">
      <div className="form-content">
        <button className="close-button" onClick={handleFormClose}>&times;</button>
        <h2 className="form-title">Registrar Colaborador</h2>
        <form className="colaborador-form" onSubmit={handleSubmit}>
          {renderInputField('idEmpleado', 'ID empleado:', faIdBadge, 'text', formData.idEmpleado, errors.idEmpleado, handleChange)}
          {renderInputField('nombreEmpleado', 'Nombre empleado:', faUser, 'text', formData.nombreEmpleado, errors.nombreEmpleado, handleChange)}
          {renderInputField('area', 'Área:', faBuilding, 'text', formData.area, null, handleChange)}
          {renderInputField('cargo', 'Cargo:', faUser, 'text', formData.cargo, null, handleChange)}
          {renderInputField('correoPersonal', 'Correo:', faEnvelope, 'email', formData.correoPersonal, errors.correoPersonal, handleChange)}
          {renderInputField('telefonoPersonal', 'Teléfono Personal:', faPhone, 'text', formData.telefonoPersonal, errors.telefonoPersonal, handleChange)}
          {renderInputField('correoSmex', 'Correo SMex (opcional):', faEnvelope, 'email', formData.correoSmex, errors.correoSmex, handleChange)}
          {renderInputField('telefonoSmex', 'Teléfono SMex (opcional):', faPhone, 'text', formData.telefonoSmex, errors.telefonoSmex, handleChange)}
          <div className="form-group">
            <label><FontAwesomeIcon icon={faFileImage} /> Fotografía:</label>
            <input type="file" name="fotografia" onChange={handleFileChange} className={errors.fotografia ? 'input-error' : ''} />
            {errors.fotografia && <p className="error-text">{errors.fotografia}</p>}
          </div>
          <div className="button-group">
            <button 
              type="submit" 
              className={`btn-register ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const renderInputField = (name, label, icon, type, value, error, onChange) => (
  <div className="form-group">
    <label>
      <FontAwesomeIcon icon={icon} className="fa-icon" /> {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={label}
      value={value}
      onChange={onChange}
      className={error ? 'input-error' : ''}
    />
    {error && <p className="error-text">{error}</p>}
  </div>
);

export default ColaboradorForm;