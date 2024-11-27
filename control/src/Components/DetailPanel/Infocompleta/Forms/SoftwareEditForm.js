import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/SoftwareForm.css';

const SoftwareEditForm = ({ idSoftware, onSave, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [version, setVersion] = useState('');
  const [fechaAdquisicion, setFechaAdquisicion] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [tipoLicencia, setTipoLicencia] = useState('mensual');
  const [estado, setEstado] = useState('sin uso');
  const [licenciaCaducada, setLicenciaCaducada] = useState(false);
  const [maxLicencias, setMaxLicencias] = useState(0);
  const [softwareLicencias, setSoftwareLicencias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoftwareData = async () => {
      try {
        // Cargar los datos del software
        const response = await axios.get(`http://localhost:3550/api/software/${idSoftware}`);
        const softwareData = response.data;
        setNombre(softwareData.nombre);
        setVersion(softwareData.version);
        setFechaAdquisicion(softwareData.fecha_adquisicion);
        setFechaCaducidad(softwareData.fecha_caducidad);
        setTipoLicencia(softwareData.tipoLicencia);
        setEstado(softwareData.estado);
        setLicenciaCaducada(softwareData.licenciaCaducada);
        setMaxLicencias(softwareData.maxDispositivos);
        setSoftwareLicencias(softwareData.licencias || []);  // Cargar las licencias existentes

        // Cargar equipos
        const equiposResponse = await axios.get('http://localhost:3550/api/equipos');
        setEquipos(equiposResponse.data);
      } catch (error) {
        setError('Hubo un problema al cargar los datos del software.');
      }
      setLoading(false);
    };

    fetchSoftwareData();
  }, [idSoftware]);

  const handleNombreChange = (e) => setNombre(e.target.value);

  // Agregar nueva licencia si no se ha alcanzado el máximo
  const handleAddLicencia = () => {
    if (maxLicencias === 0 || softwareLicencias.length < maxLicencias) {
      setSoftwareLicencias([
        ...softwareLicencias,
        { claveLicencia: '', correoAsociado: '', contrasenaCorreo: '', id_equipos: [], compartida: false },
      ]);
    } else {
      setError('No se pueden agregar más licencias. Has alcanzado el número máximo de licencias.');
    }
  };

  const handleLicenciaChange = (index, field, value) => {
    const updatedLicencias = [...softwareLicencias];
    if (updatedLicencias[index]) {
      updatedLicencias[index][field] = value;
      setSoftwareLicencias(updatedLicencias);
    }
  };

  const handleEquiposCheckboxChange = (index, equipoId) => {
    const updatedLicencias = [...softwareLicencias];
    const selectedEquipos = updatedLicencias[index].id_equipos || [];  // Aseguramos que id_equipos sea un array

    if (selectedEquipos.includes(equipoId)) {
      updatedLicencias[index].id_equipos = selectedEquipos.filter((id) => id !== equipoId);
    } else {
      updatedLicencias[index].id_equipos = [...selectedEquipos, equipoId];
    }

    setSoftwareLicencias(updatedLicencias);
  };

  const handleCompartidaChange = (index) => {
    const updatedLicencias = [...softwareLicencias];
    updatedLicencias[index].compartida = !updatedLicencias[index].compartida;

    if (!updatedLicencias[index].compartida) {
      updatedLicencias[index].id_equipos = updatedLicencias[index].id_equipos.slice(0, 1);
    }

    setSoftwareLicencias(updatedLicencias);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const softwareData = {
      nombre,
      version,
      fechaAdquisicion: fechaAdquisicion || null,
      fechaCaducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad,
      tipoLicencia,
      estado,
      licenciaCaducada,
      maxDispositivos: maxLicencias,
      softwareLicencias,
    };

    try {
      await axios.put(`http://localhost:3550/api/software/${idSoftware}`, softwareData);

      // Llamar a la función onSave para actualizar la lista
      onSave();

      // Cerrar el modal después de guardar
      onClose();
    } catch (error) {
      setError('Ocurrió un error al guardar el software.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="software-form-modal">
      <div className="software-form-content">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <form onSubmit={handleSubmit}>
          <h2>Editar Software</h2>

          {error && <p className="error-message">{error}</p>}

          <label>
            Nombre del Software:
            <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          </label>
          <input
            type="text"
            value={nombre}
            onChange={handleNombreChange}
            required
          />

          <label>
            Versión:
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />

          <label>
            Fecha de Adquisición:
            <input
              type="date"
              value={fechaAdquisicion || ''}
              onChange={(e) => setFechaAdquisicion(e.target.value)}
            />
          </label>

          <label>
            Fecha de Caducidad:
            <input
              type="date"
              value={fechaCaducidad || ''}
              readOnly
            />
          </label>

          <label>
            Tipo de Licencia:
          </label>
          <select
            value={tipoLicencia}
            onChange={(e) => setTipoLicencia(e.target.value)}
          >
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
            <option value="vitalicia">Vitalicia</option>
          </select>

          <div>
            <label>
              <input
                type="checkbox"
                checked={licenciaCaducada}
                onChange={(e) => setLicenciaCaducada(e.target.checked)}
              />
              Licencia ya caducada
            </label>
          </div>

          <label>
            Máximo de Licencias (0 para ilimitado):
            <input
              type="number"
              min="0"
              value={maxLicencias}
              onChange={(e) => setMaxLicencias(parseInt(e.target.value, 10))}
              required
            />
          </label>

          <h3>Licencias Específicas</h3>
          {softwareLicencias && softwareLicencias.length > 0 ? (
            softwareLicencias.map((licencia, index) => (
              <div key={index} className="licencia-section">
                <label>Clave de Licencia:</label>
                <input
                  type="text"
                  value={licencia.claveLicencia}
                  onChange={(e) => handleLicenciaChange(index, 'claveLicencia', e.target.value)}
                />

                <label>Correo Asociado:</label>
                <input
                  type="email"
                  value={licencia.correoAsociado}
                  onChange={(e) => handleLicenciaChange(index, 'correoAsociado', e.target.value)}
                />

                <label>Contraseña del Correo:</label>
                <input
                  type="password"
                  value={licencia.contrasenaCorreo}
                  onChange={(e) => handleLicenciaChange(index, 'contrasenaCorreo', e.target.value)}
                />

                <label>IDs de Equipos:</label>
                {licencia.compartida ? (
                  <div className="equipos-checkbox-list">
                    {equipos && equipos.length > 0 ? (
                      equipos.map((equipo) => (
                        <label key={equipo.id_equipos}>
                          <input
                            type="checkbox"
                            value={equipo.id_equipos}
                            checked={licencia.id_equipos && licencia.id_equipos.includes(equipo.id_equipos)}
                            onChange={() => handleEquiposCheckboxChange(index, equipo.id_equipos)}
                          />
                          {equipo.id_equipos} - {equipo.nombre}
                        </label>
                      ))
                    ) : (
                      <p>No hay equipos disponibles.</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={licencia.id_equipos && licencia.id_equipos[0] || ''}
                    onChange={(e) => handleLicenciaChange(index, 'id_equipos', [e.target.value])}
                  >
                    <option value="">Seleccionar un equipo</option>
                    {equipos && equipos.length > 0 ? (
                      equipos.map((equipo) => (
                        <option key={equipo.id_equipos} value={equipo.id_equipos}>
                          {equipo.id_equipos} - {equipo.nombre}
                        </option>
                      ))
                    ) : (
                      <option>No hay equipos disponibles</option>
                    )}
                  </select>
                )}

                <label>
                  <input
                    type="checkbox"
                    checked={licencia.compartida}
                    onChange={() => handleCompartidaChange(index)}
                  />
                  Usar esta licencia en múltiples equipos
                </label>
              </div>
            ))
          ) : (
            <p>No hay licencias registradas.</p>
          )}

          <button type="button" onClick={handleAddLicencia}>Agregar Licencia</button>

          <button className="button" type="submit">Actualizar Software</button>
        </form>
      </div>
    </div>
  );
};

export default SoftwareEditForm;
