import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/SoftwareForm.css';

const SoftwareForm = ({ onSave, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState(null);
    const [fechaCaducidad, setFechaCaducidad] = useState(null);
    const [tipoLicencia, setTipoLicencia] = useState('mensual');
    const [estado, setEstado] = useState('sin uso');
    const [equipos, setEquipos] = useState([]);
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);
    const [maxLicencias, setMaxLicencias] = useState(0);
    const [softwareLicencias, setSoftwareLicencias] = useState([
        { claveLicencia: '', correoAsociado: '', contrasenaCorreo: '', id_equipos: [], compartida: false }
    ]);
    const [licenciasEnUso, setLicenciasEnUso] = useState(0);
    const [licenciasSinUso, setLicenciasSinUso] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tooltip, setTooltip] = useState(null);

    // Fetch equipos
    useEffect(() => {
        const fetchEquipos = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:3550/api/equipos');
                setEquipos(response.data);
            } catch (error) {
                setError('Hubo un problema al cargar los equipos.');
            }
            setLoading(false);
        };
        fetchEquipos();
    }, []);

    // Actualizar el estado del software y contar licencias en uso y sin uso
    useEffect(() => {
        const enUso = softwareLicencias.filter(licencia => licencia.id_equipos && licencia.id_equipos.length > 0).length;
        const sinUso = Math.max(0, maxLicencias - enUso);

        setLicenciasEnUso(enUso);
        setLicenciasSinUso(sinUso);

        // Actualizar el estado del software
        if (licenciaCaducada && enUso > 0) {
            setEstado('vencido con equipo');
        } else if (enUso > 0 && !licenciaCaducada) {
            setEstado('en uso');
        } else if (licenciaCaducada) {
            setEstado('vencido');
        } else {
            setEstado('sin uso');
        }
    }, [softwareLicencias, maxLicencias, licenciaCaducada]);

    // Agregar una nueva licencia
    const handleAddLicencia = () => {
        if (softwareLicencias.length < maxLicencias) {
            setSoftwareLicencias([
                ...softwareLicencias,
                { claveLicencia: '', correoAsociado: '', contrasenaCorreo: '', id_equipos: [], compartida: false }
            ]);
        } else {
            setError('No se pueden agregar más licencias. Has alcanzado el número máximo.');
        }
    };

    // Manejar cambios en las licencias
    const handleLicenciaChange = (index, field, value) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index][field] = value;
        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar selección de equipos cuando la licencia es compartida
    const handleEquiposCheckboxChange = (index, equipoId) => {
        const updatedLicencias = [...softwareLicencias];
        const selectedEquipos = updatedLicencias[index].id_equipos;

        // Verificar si se alcanzó el número máximo de equipos
        if (selectedEquipos.includes(equipoId)) {
            // Eliminar el equipo si ya estaba seleccionado
            updatedLicencias[index].id_equipos = selectedEquipos.filter(id => id !== equipoId);
        } else if (selectedEquipos.length < maxLicencias) {
            // Agregar el equipo si no se ha alcanzado el límite
            updatedLicencias[index].id_equipos = [...selectedEquipos, equipoId];
        } else {
            setError('Has alcanzado el número máximo de equipos permitidos para esta licencia.');
        }
        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar el cambio de estado de compartida
    const handleCompartidaChange = (index) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index].compartida = !updatedLicencias[index].compartida;
        if (!updatedLicencias[index].compartida) {
            // Si se desmarca, aseguramos que solo un equipo esté seleccionado
            updatedLicencias[index].id_equipos = updatedLicencias[index].id_equipos.slice(0, 1);
        }
        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar el cambio del número máximo de licencias
    const handleMaxLicenciasChange = (e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setMaxLicencias(value);
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
            maxLicencias,
            softwareLicencias, // Enviamos las licencias como un array
        };

        try {
            const response = await axios.post('http://localhost:3550/api/software', softwareData);
            if (response.status === 201) {
                onSave(response.data);
                onClose();
            } else {
                setError('Error al guardar el software.');
            }
        } catch (error) {
            setError(error.response?.data.message || 'Error al enviar los datos.');
        }
    };

    const toggleTooltip = (field) => {
        setTooltip(tooltip === field ? null : field);
    };

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Agregar Software</h2>

                    {error && <p className="error-message">{error}</p>}

                    <label>
                        Nombre del Software:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('nombre')} className="info-icon" />
                        {tooltip === 'nombre' && <div className="tooltip">Este campo es obligatorio.</div>}
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <label>
                        Versión:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('version')} className="info-icon" />
                        {tooltip === 'version' && <div className="tooltip">Opcional. Ingresa la versión del software.</div>}
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
                        Máximo de Licencias:
                        <input
                            type="number"
                            min="0"
                            value={maxLicencias}
                            onChange={handleMaxLicenciasChange}
                            required
                        />
                    </label>
                    <p>Licencias en uso: {licenciasEnUso}</p>
                    <p>Licencias sin uso: {licenciasSinUso}</p>

                    <h3>Licencias Específicas</h3>
                    {softwareLicencias.map((licencia, index) => (
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
                                    {equipos.map((equipo) => (
                                        <label key={equipo.id_equipos}>
                                            <input
                                                type="checkbox"
                                                value={equipo.id_equipos}
                                                checked={licencia.id_equipos.includes(equipo.id_equipos)}
                                                onChange={() => handleEquiposCheckboxChange(index, equipo.id_equipos)}
                                                disabled={licencia.id_equipos.length >= maxLicencias && !licencia.id_equipos.includes(equipo.id_equipos)}
                                            />
                                            {equipo.id_equipos} - {equipo.nombre}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <select
                                    value={licencia.id_equipos[0] || ''}
                                    onChange={(e) => handleLicenciaChange(index, 'id_equipos', [e.target.value])}
                                >
                                    <option value="">Seleccionar un equipo</option>
                                    {equipos.map((equipo) => (
                                        <option key={equipo.id_equipos} value={equipo.id_equipos}>
                                            {equipo.id_equipos} - {equipo.nombre}
                                        </option>
                                    ))}
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
                    ))}

                    {softwareLicencias.length < maxLicencias && (
                        <button type="button" onClick={handleAddLicencia}>
                            Agregar Licencia
                        </button>
                    )}

                    <label>
                        Estado del Software:
                        <input type="text" value={estado} readOnly />
                    </label>

                    <button className="button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
