import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import stringSimilarity from 'string-similarity';
import '../styles/SoftwareForm.css';

const SoftwareForm = ({ onSave, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState('');
    const [fechaCaducidad, setFechaCaducidad] = useState('');
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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [existingSoftwareNames, setExistingSoftwareNames] = useState([]);
    const [suggestedCorrection, setSuggestedCorrection] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchEquiposAndSoftwareNames = async () => {
            setLoading(true);
            try {
                const [equiposResponse, softwareResponse] = await Promise.all([
                    axios.get('http://localhost:3550/api/equipos'),
                    axios.get('http://localhost:3550/api/software/names')
                ]);
                setEquipos(equiposResponse.data);
                setExistingSoftwareNames(softwareResponse.data.map(software => software.toLowerCase()));
            } catch (error) {
                setError('Hubo un problema al cargar los equipos o nombres de software.');
            }
            setLoading(false);
        };
        fetchEquiposAndSoftwareNames();
    }, []);

    const checkNameCorrection = (value) => {
        if (existingSoftwareNames.length > 0) {
            const bestMatch = stringSimilarity.findBestMatch(value.toLowerCase(), existingSoftwareNames);
            if (bestMatch.bestMatch.rating > 0.8) { 
                setSuggestedCorrection(bestMatch.bestMatch.target);
            } else {
                setSuggestedCorrection('');
            }
        }
    };

    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        checkNameCorrection(value);

        if (value) {
            const filtered = existingSoftwareNames.filter(name =>
                name.includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setNombre(suggestion);
        setShowSuggestions(false);
        setSuggestedCorrection('');
    };

    const handleApplySuggestion = () => {
        setNombre(suggestedCorrection);
        setSuggestedCorrection('');
    };

    useEffect(() => {
        const enUso = softwareLicencias.filter(
            licencia => licencia.compartida || (licencia.id_equipos && licencia.id_equipos.length > 0)
        ).length;
        
        const sinUso = maxLicencias === 0 ? '∞' : Math.max(0, maxLicencias - enUso);

        setLicenciasEnUso(enUso);
        setLicenciasSinUso(sinUso);

        if (licenciaCaducada && enUso > 0) {
            setEstado('vencido con equipo');
        } else if (enUso > 0 && !licenciaCaducada) {
            setEstado('activo');
        } else if (licenciaCaducada) {
            setEstado('vencido');
        } else {
            setEstado('sin uso');
        }
    }, [softwareLicencias, maxLicencias, licenciaCaducada]);

    useEffect(() => {
        if (!fechaAdquisicion) {
            setFechaCaducidad('');
            return;
        }

        const fecha = new Date(fechaAdquisicion);
        let nuevaFechaCaducidad = null;

        if (tipoLicencia === 'mensual') {
            nuevaFechaCaducidad = new Date(fecha.setMonth(fecha.getMonth() + 1));
        } else if (tipoLicencia === 'anual') {
            nuevaFechaCaducidad = new Date(fecha.setFullYear(fecha.getFullYear() + 1));
        } else if (tipoLicencia === 'vitalicia') {
            nuevaFechaCaducidad = null;
        }

        setFechaCaducidad(nuevaFechaCaducidad ? nuevaFechaCaducidad.toISOString().split('T')[0] : '');
    }, [fechaAdquisicion, tipoLicencia]);

    const handleAddLicencia = () => {
        if (maxLicencias === 0 || softwareLicencias.length < maxLicencias) {
            setSoftwareLicencias([
                ...softwareLicencias,
                { claveLicencia: '', correoAsociado: '', contrasenaCorreo: '', id_equipos: [], compartida: false }
            ]);
        } else {
            setError('No se pueden agregar más licencias. Has alcanzado el número máximo.');
        }
    };

    const handleLicenciaChange = (index, field, value) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index][field] = value;
        setSoftwareLicencias(updatedLicencias);
    };

    const handleEquiposCheckboxChange = (index, equipoId) => {
        const updatedLicencias = [...softwareLicencias];
        const selectedEquipos = updatedLicencias[index].id_equipos;

        if (selectedEquipos.includes(equipoId)) {
            updatedLicencias[index].id_equipos = selectedEquipos.filter(id => id !== equipoId);
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

    const handleMaxLicenciasChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setMaxLicencias(value >= 0 ? value : 0);
        
        if (value > 0 && softwareLicencias.length > value) {
            setSoftwareLicencias(softwareLicencias.slice(0, value));
        }
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
            equipos_asociados: softwareLicencias.flatMap(licencia => licencia.id_equipos),
            softwareLicencias: softwareLicencias.map(licencia => ({
                ...licencia,
                id_equipos: licencia.id_equipos.length > 0 ? licencia.id_equipos : null
            })),
        };

        try {
            const response = await axios.post('http://localhost:3550/api/software', softwareData);
            onSave(response.data); 
        } catch (error) {
            console.error("Error al guardar el software:", error);
            setError('Ocurrió un error inesperado al guardar el software.');
        } finally {
            onClose();
        }
    };

    const handleClose = () => {
        if (
            nombre ||
            version ||
            fechaAdquisicion ||
            softwareLicencias.some(licencia => licencia.claveLicencia || licencia.correoAsociado || licencia.contrasenaCorreo)
        ) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    };

    const confirmClose = () => {
        setShowConfirmation(false);
        onClose();
    };

    const cancelClose = () => {
        setShowConfirmation(false);
    };

    const toggleTooltip = (field) => {
        setTooltip(tooltip === field ? null : field);
    };

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={handleClose}>&times;</span>
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
                        onChange={handleNombreChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required
                    />
                    {suggestedCorrection && (
                        <p className="suggestion-message">
                            ¿Quisiste decir <span onClick={handleApplySuggestion} className="suggestion">{suggestedCorrection}</span>?
                        </p>
                    )}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {filteredSuggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="suggestion-item"
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}

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
                        Máximo de Licencias (0 para ilimitado):
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

                    {softwareLicencias.length < maxLicencias || maxLicencias === 0 ? (
                        <button type="button" onClick={handleAddLicencia}>
                            Agregar Licencia
                        </button>
                    ) : null}

                    <label>
                        Estado del Software:
                        <input type="text" value={estado} readOnly />
                    </label>

                    <button className="button" type="submit">Guardar</button>

                    {showConfirmation && (
                        <div className="confirmation-modal">
                            <p>¿Estás seguro de que deseas cerrar el formulario? Se perderán los datos no guardados.</p>
                            <button onClick={confirmClose}>Sí, cerrar</button>
                            <button onClick={cancelClose}>No, continuar</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
