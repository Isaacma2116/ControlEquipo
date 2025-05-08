// src/Components/DetailPanel/Infocompleta/Forms/LicenseAndEquipmentEditForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/LicenseAndEquipmentEditForm.css';

const LicenseAndEquipmentEditForm = ({ idSoftware, onSave = () => {}, onClose }) => {
  const [licenses, setLicenses] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550/api';

  useEffect(() => {
    if (!idSoftware) {
      setError('ID del software no proporcionado.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const [licenseResponse, equipmentResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/software/${idSoftware}/licenses`),
          axios.get(`${API_BASE_URL}/software/${idSoftware}/equipments`)
        ]);
        console.log('Licenses:', licenseResponse.data); // Debug
        console.log('Equipments:', equipmentResponse.data); // Debug

        setLicenses(Array.isArray(licenseResponse.data) ? licenseResponse.data : []);
        setEquipments(Array.isArray(equipmentResponse.data) ? equipmentResponse.data : []);
      } catch (error) {
        console.error('Error al cargar licencias o equipos:', error);
        setError('Error al cargar licencias o equipos.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [API_BASE_URL, idSoftware]);

  const handleLicenseChange = (index, field, value) => {
    const updatedLicenses = [...licenses];
    updatedLicenses[index][field] = value;
    setLicenses(updatedLicenses);
  };

  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipments = [...equipments];
    updatedEquipments[index][field] = value;
    setEquipments(updatedEquipments);
  };

  const handleAddLicense = () => {
    setLicenses([
      ...licenses,
      {
        id_licencia: null,
        claveLicencia: '',
        correoAsociado: '',
        contrasenaCorreo: '',
        compartida: false,
        estado_renovacion: 'activa'
      }
    ]);
  };

  const handleAddEquipment = () => {
    setEquipments([
      ...equipments,
      { id: null, id_equipos: '', id_licencia: null }
    ]);
  };

  const handleRemoveLicense = (index) => {
    const updatedLicenses = [...licenses];
    updatedLicenses.splice(index, 1);
    setLicenses(updatedLicenses);
  };

  const handleRemoveEquipment = (index) => {
    const updatedEquipments = [...equipments];
    updatedEquipments.splice(index, 1);
    setEquipments(updatedEquipments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { licenses, equipments };

    try {
      await axios.put(`${API_BASE_URL}/software/${idSoftware}/update-licenses-equipments`, payload);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('Error al guardar los cambios.');
    }
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="license-equipment-form-modal">
      <div className="license-equipment-form-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <form onSubmit={handleSubmit}>
          <h2>Editar Licencias y Equipos</h2>

          {error && <p className="error-message">{error}</p>}

          <h3>Licencias</h3>
          {licenses.map((license, index) => (
            <div key={index} className="license-section">
              <label>
                Clave de Licencia:
                <input
                  type="text"
                  value={license.claveLicencia || ''}
                  onChange={(e) => handleLicenseChange(index, 'claveLicencia', e.target.value)}
                  required
                />
              </label>
              <label>
                Correo Asociado:
                <input
                  type="email"
                  value={license.correoAsociado || ''}
                  onChange={(e) => handleLicenseChange(index, 'correoAsociado', e.target.value)}
                  required
                />
              </label>
              <label>
                Contraseña del Correo:
                <input
                  type="password"
                  value={license.contrasenaCorreo || ''}
                  onChange={(e) => handleLicenseChange(index, 'contrasenaCorreo', e.target.value)}
                  required
                />
              </label>
              <label>
                Compartida:
                <input
                  type="checkbox"
                  checked={license.compartida || false}
                  onChange={(e) => handleLicenseChange(index, 'compartida', e.target.checked)}
                />
              </label>
              <label>
                Estado de Renovación:
                <select
                  value={license.estado_renovacion || 'activa'}
                  onChange={(e) => handleLicenseChange(index, 'estado_renovacion', e.target.value)}
                >
                  <option value="activa">Activa</option>
                  <option value="caducada">Caducada</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => handleRemoveLicense(index)}
                className="remove-button"
              >
                Eliminar Licencia
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddLicense} className="add-button">
            Añadir Licencia
          </button>

          <h3>Equipos</h3>
          {equipments.map((equipment, index) => (
            <div key={index} className="equipment-section">
              <label>
                ID del Equipo:
                <input
                  type="text"
                  value={equipment.id_equipos || ''}
                  onChange={(e) => handleEquipmentChange(index, 'id_equipos', e.target.value)}
                  required
                />
              </label>
              <label>
                ID de Licencia:
                <input
                  type="number"
                  value={equipment.id_licencia || ''}
                  onChange={(e) => handleEquipmentChange(index, 'id_licencia', e.target.value)}
                  required
                />
              </label>
              <button
                type="button"
                onClick={() => handleRemoveEquipment(index)}
                className="remove-button"
              >
                Eliminar Equipo
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddEquipment} className="add-button">
            Añadir Equipo
          </button>

          <button type="submit" className="submit-button">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseAndEquipmentEditForm;
