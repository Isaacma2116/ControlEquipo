// SoftwareEditForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareEditForm.css';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUIDs únicos

const SoftwareEditForm = ({ idSoftware, onSave = () => { }, onClose }) => {
  const [software, setSoftware] = useState({
    nombre: '',
    version: '',
    fechaAdquisicion: '',
    fechaCaducidad: '',
    tipoLicencia: '',
    estado: '',
    licenciaCaducada: false,
    maxDispositivos: 1,
  }); // Datos completos del software
  const [licenses, setLicenses] = useState([]); // Licencias del software
  const [allEquipments, setAllEquipments] = useState([]); // Todos los equipos disponibles
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState({}); // Estado para términos de búsqueda por licencia

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550/api';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [softwareResponse, equipmentsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/software/${idSoftware}`),
          axios.get(`${API_BASE_URL}/equipos`)
        ]);

        const softwareData = softwareResponse.data;

        // Mapear las fechas a camelCase
        const mappedSoftwareData = {
          ...softwareData,
          fechaAdquisicion: softwareData.fecha_adquisicion,
          fechaCaducidad: softwareData.fecha_caducidad,
        };

        // Inicializar licencias con un campo sinUso y equiposSeleccionados
        const initializedLicenses = (mappedSoftwareData.licencias || []).map(license => ({
          ...license,
          sinUso: false, // Indica si la licencia está marcada como "Sin Uso"
          equiposSeleccionados: mappedSoftwareData.equiposAsociados
            ? mappedSoftwareData.equiposAsociados
              .filter(eq => eq.id_licencia === license.id_licencia)
              .map(eq => eq.id_equipos)
            : []
        }));

        setSoftware(mappedSoftwareData);
        setLicenses(initializedLicenses);
        setAllEquipments(equipmentsResponse.data || []);
      } catch (error) {
        setError('Error al cargar los datos del software.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [API_BASE_URL, idSoftware]);

  // Manejar cambios en los campos del software
  const handleSoftwareChange = (field, value) => {
    setSoftware({
      ...software,
      [field]: value,
    });
  };

  // Manejar cambios en los campos de las licencias
  const handleLicenseChange = (index, field, value) => {
    const updatedLicenses = [...licenses];
    updatedLicenses[index][field] = value;
    setLicenses(updatedLicenses);
  };

  // Manejar la selección/deselección de un equipo en una licencia
  const handleEquipmentSelection = (licenseIndex, equipmentId) => {
    const updatedLicenses = [...licenses];
    const selectedEquipments = updatedLicenses[licenseIndex].equiposSeleccionados;

    if (selectedEquipments.includes(equipmentId)) {
      // Si ya está seleccionado, deseleccionarlo
      updatedLicenses[licenseIndex].equiposSeleccionados = selectedEquipments.filter(id => id !== equipmentId);
    } else {
      // Si no está seleccionado, agregarlo
      updatedLicenses[licenseIndex].equiposSeleccionados = [...selectedEquipments, equipmentId];
    }

    setLicenses(updatedLicenses);
  };

  // Manejar la selección/deselección de "Sin Uso" en una licencia
  const handleSinUsoToggle = (licenseIndex) => {
    const updatedLicenses = [...licenses];
    const currentSinUso = updatedLicenses[licenseIndex].sinUso;

    updatedLicenses[licenseIndex].sinUso = !currentSinUso;

    // Si se marca como "Sin Uso", limpiar las selecciones de equipos
    if (!currentSinUso) {
      updatedLicenses[licenseIndex].equiposSeleccionados = [];
    }

    setLicenses(updatedLicenses);
  };

  // Añadir una nueva licencia
  const handleAddLicense = () => {
    const newLicense = {
      id_licencia: uuidv4(), // Generar un UUID único
      claveLicencia: '',
      correoAsociado: '',
      contrasenaCorreo: '',
      compartida: false,
      sinUso: false,
      equiposSeleccionados: []
    };

    setLicenses([...licenses, newLicense]);
  };

  // Eliminar una licencia
  const handleRemoveLicense = (licenseIndex) => {
    const updatedLicenses = licenses.filter((_, index) => index !== licenseIndex);
    setLicenses(updatedLicenses);

    // También eliminar el término de búsqueda asociado
    const updatedSearchTerms = { ...searchTerms };
    delete updatedSearchTerms[licenseIndex];
    setSearchTerms(updatedSearchTerms);
  };

  // Función para verificar si hay equipos duplicados
  const hasDuplicateEquipments = () => {
    const equipmentIds = licenses
      .filter(license => !license.sinUso)
      .flatMap(license => license.equiposSeleccionados)
      .filter(id => id); // Excluir valores vacíos

    const uniqueIds = new Set(equipmentIds);
    return uniqueIds.size !== equipmentIds.length;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setError(null);

    // Validar duplicados
    if (hasDuplicateEquipments()) {
      setError('Has seleccionado el mismo equipo en múltiples licencias. Por favor, cambia las selecciones.');
      return;
    }

    // Validar que todas las licencias que no están en "Sin Uso" tengan al menos un equipo seleccionado
    for (let i = 0; i < licenses.length; i++) {
      const license = licenses[i];
      if (!license.sinUso && license.equiposSeleccionados.length === 0) {
        setError(`La licencia ${i + 1} debe tener al menos un equipo seleccionado o marcarse como "Sin Uso".`);
        return;
      }
    }

    // Estructurar softwareLicencias con equipos_asociados como arrays de IDs
    const softwareLicencias = licenses.map((license) => ({
      claveLicencia: license.claveLicencia,
      correoAsociado: license.correoAsociado,
      contrasenaCorreo: license.contrasenaCorreo,
      compartida: license.compartida,
      equipos_asociados: license.sinUso ? [] : license.equiposSeleccionados
    }));

    const payload = {
      nombre: software.nombre,
      version: software.version,
      fechaAdquisicion: software.fechaAdquisicion || null, // CamelCase
      fechaCaducidad: software.fechaCaducidad || null,    // CamelCase
      tipoLicencia: software.tipoLicencia,
      estado: software.estado,
      licenciaCaducada: software.licenciaCaducada,
      maxDispositivos: software.maxDispositivos,
      softwareLicencias: softwareLicencias,
    };

    // Verificar el payload antes de enviarlo
    console.log('Payload a enviar:', payload);

    try {
      await axios.put(`${API_BASE_URL}/software/${idSoftware}`, payload);
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar los cambios.');
      console.error('Error al actualizar el software:', error.response?.data || error);
    }
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (!software) {
    return <div>No se encontró el software.</div>;
  }

  return (
    <div className="software-form-modal">
      <div className="software-form-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <h2>Editar Software</h2>
          {error && <p className="error-message">{error}</p>}

          {/* Campos Editables del Software */}
          <div className="software-details">
            <label>
              Nombre:
              <input
                type="text"
                value={software.nombre || ''}
                onChange={(e) => handleSoftwareChange('nombre', e.target.value)}
                required
              />
            </label>
            <label>
              Versión:
              <input
                type="text"
                value={software.version || ''}
                onChange={(e) => handleSoftwareChange('version', e.target.value)}
                required
              />
            </label>
            <label>
              Fecha de Adquisición:
              <input
                type="date"
                value={software.fechaAdquisicion ? software.fechaAdquisicion.substring(0, 10) : ''}
                onChange={(e) => handleSoftwareChange('fechaAdquisicion', e.target.value)} // CamelCase
              />
            </label>
            <label>
              Fecha de Caducidad:
              <input
                type="date"
                value={software.fechaCaducidad ? software.fechaCaducidad.substring(0, 10) : ''}
                onChange={(e) => handleSoftwareChange('fechaCaducidad', e.target.value)} // CamelCase
              />
            </label>
            <label>
              Tipo de Licencia:
              <select
                value={software.tipoLicencia || ''}
                onChange={(e) => handleSoftwareChange('tipoLicencia', e.target.value)}
                required
              >
                <option value="" disabled>Selecciona un tipo de licencia</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="vitalicia">Vitalicia</option>
              </select>
            </label>
            <label>
              Estado:
              <select
                value={software.estado || ''}
                onChange={(e) => handleSoftwareChange('estado', e.target.value)}
                required
              >
                <option value="" disabled>Selecciona un estado</option>
                <option value="activo">Activo</option>
                <option value="sin uso">Sin Uso</option>
                <option value="vencido">Vencido</option>
                <option value="vencido con equipo">Vencido con Equipo</option>
              </select>
            </label>
            <label>
              Licencia Caducada:
              <select
                value={software.licenciaCaducada ? 'Sí' : 'No'}
                onChange={(e) => handleSoftwareChange('licenciaCaducada', e.target.value === 'Sí')}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </label>
            <label>
              Máximo de Dispositivos:
              <input
                type="number"
                min="1"
                value={software.maxDispositivos || 1}
                onChange={(e) => handleSoftwareChange('maxDispositivos', parseInt(e.target.value) || 1)}
                required
              />
            </label>
          </div>

          <h3>Licencias</h3>
          {licenses.map((license, licenseIndex) => {
            // Obtener el término de búsqueda específico para esta licencia
            const searchTerm = searchTerms[licenseIndex] || '';

            // Filtrar equipos según el término de búsqueda
            const filteredEquipments = allEquipments.filter((eq) =>
              (eq.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
              (eq.id_equipos?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );

            return (
              <div key={license.id_licencia} className="license-section">
                <h4>Licencia {licenseIndex + 1}</h4>
                <label>
                  Clave de Licencia:
                  <input
                    type="text"
                    value={license.claveLicencia}
                    onChange={(e) =>
                      handleLicenseChange(
                        licenseIndex,
                        'claveLicencia',
                        e.target.value
                      )
                    }
                    required
                  />
                </label>
                <label>
                  Correo Asociado:
                  <input
                    type="email"
                    value={license.correoAsociado}
                    onChange={(e) =>
                      handleLicenseChange(
                        licenseIndex,
                        'correoAsociado',
                        e.target.value
                      )
                    }
                  />
                </label>
                <label>
                  Contraseña del Correo:
                  <input
                    type="password"
                    value={license.contrasenaCorreo}
                    onChange={(e) =>
                      handleLicenseChange(
                        licenseIndex,
                        'contrasenaCorreo',
                        e.target.value
                      )
                    }
                  />
                </label>
                <div className="sin-uso-section">
                  <label>
                    <input
                      type="checkbox"
                      checked={license.sinUso}
                      onChange={() => handleSinUsoToggle(licenseIndex)}
                    />
                    Sin Uso
                  </label>
                </div>
                {!license.sinUso && (
                  <div className="equipments-selection">
                    <p>Selecciona Equipos Asociados:</p>
                    <input
                      type="text"
                      placeholder="Buscar equipos..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerms({
                          ...searchTerms,
                          [licenseIndex]: e.target.value
                        });
                      }}
                      className="equipment-search-input"
                    />
                    {filteredEquipments.length > 0 ? (
                      filteredEquipments.map((eq) => (
                        <label key={eq.id_equipos} className="equipment-checkbox">
                          <input
                            type="checkbox"
                            checked={license.equiposSeleccionados.includes(eq.id_equipos)}
                            onChange={() => handleEquipmentSelection(licenseIndex, eq.id_equipos)}
                          />
                          {eq.id_equipos} - {eq.nombre}
                        </label>
                      ))
                    ) : (
                      <p>No se encontraron equipos que coincidan con la búsqueda.</p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveLicense(licenseIndex)}
                  className="remove-license-button"
                >
                  Eliminar Licencia
                </button>
              </div>
            );
          })}

          {/* Botón para Añadir Licencia */}
          {licenses.length < software.maxDispositivos && (
            <button
              type="button"
              onClick={handleAddLicense}
              className="add-license-button"
            >
              Añadir Licencia
            </button>
          )}
          {licenses.length >= software.maxDispositivos && (
            <p className="limit-message">
              Has alcanzado el número máximo de licencias: {software.maxDispositivos}.
            </p>
          )}

          <button type="submit" className="save-button">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};

export default SoftwareEditForm;
