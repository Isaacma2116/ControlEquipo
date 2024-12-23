// src/Components/DetailPanel/Infocompleta/Forms/SoftwareForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import stringSimilarity from 'string-similarity';
import '../styles/SoftwareForm.css';

const SoftwareForm = ({ onSave = () => {}, onClose }) => {
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

    // Definir la URL base de la API
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550/api';

    // Cargar datos iniciales de equipos y nombres de software para sugerencias
    useEffect(() => {
        const fetchEquiposAndSoftwareNames = async () => {
            setLoading(true);
            try {
                const [equiposResponse, softwareResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/equipos`),
                    axios.get(`${API_BASE_URL}/software/names`)
                ]);
                setEquipos(equiposResponse.data);
                setExistingSoftwareNames(softwareResponse.data.map(software => software.toLowerCase()));
            } catch (error) {
                setError('Hubo un problema al cargar los equipos o nombres de software.');
            }
            setLoading(false);
        };
        fetchEquiposAndSoftwareNames();
    }, [API_BASE_URL]);

    // Verificar corrección de nombre usando string similarity
    const checkNameCorrection = (value) => {
        if (existingSoftwareNames.length > 0) {
            const bestMatch = stringSimilarity.findBestMatch(value.toLowerCase(), existingSoftwareNames);
            if (bestMatch.bestMatch.rating > 0.8 && bestMatch.bestMatch.target !== value.toLowerCase()) { 
                setSuggestedCorrection(bestMatch.bestMatch.target);
            } else {
                setSuggestedCorrection('');
            }
        }
    };

    // Manejar cambios en el campo 'nombre' con sugerencias
    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        checkNameCorrection(value);

        if (value) {
            const filtered = existingSoftwareNames.filter(name =>
                name.includes(value.toLowerCase())
            ).slice(0, 5); // Limitar a 5 sugerencias
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Manejar clic en una sugerencia de nombre
    const handleSuggestionClick = (suggestion) => {
        setNombre(suggestion);
        setShowSuggestions(false);
        setSuggestedCorrection('');
    };

    // Aplicar la sugerencia de corrección
    const handleApplySuggestion = () => {
        setNombre(suggestedCorrection);
        setShowSuggestions(false);
        setSuggestedCorrection('');
    };

    // Calcular licencias en uso y sin uso
    useEffect(() => {
        // Calculamos 'enUso' como licencias compartidas o licencias con al menos un equipo asociado
        const enUso = softwareLicencias.filter(
            licencia => licencia.compartida || (licencia.id_equipos && licencia.id_equipos.length > 0)
        ).length;
        
        const sinUso = maxLicencias === 0 ? '∞' : Math.max(0, maxLicencias - enUso);

        setLicenciasEnUso(enUso);
        setLicenciasSinUso(sinUso);

        // Determinar el estado del software basado en las licencias en uso y si la licencia está caducada
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

    // Actualizar fecha de caducidad automáticamente según el tipo de licencia
    useEffect(() => {
        if (!fechaAdquisicion) {
            setFechaCaducidad('');
            return;
        }

        const fecha = new Date(fechaAdquisicion);
        let nuevaFechaCaducidad = null;

        if (tipoLicencia === 'mensual') {
            fecha.setMonth(fecha.getMonth() + 1);
            nuevaFechaCaducidad = fecha.toISOString().split('T')[0];
        } else if (tipoLicencia === 'anual') {
            fecha.setFullYear(fecha.getFullYear() + 1);
            nuevaFechaCaducidad = fecha.toISOString().split('T')[0];
        } else if (tipoLicencia === 'vitalicia') {
            nuevaFechaCaducidad = '';
        }

        setFechaCaducidad(nuevaFechaCaducidad);
    }, [fechaAdquisicion, tipoLicencia]);

    // Añadir una nueva licencia
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

    // Eliminar una licencia específica
    const handleRemoveLicencia = (index) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias.splice(index, 1);
        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar cambios en los campos de licencias
    const handleLicenciaChange = (index, field, value) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index][field] = value;
        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar cambios en los checkboxes de equipos asociados a licencias compartidas
    const handleEquiposCheckboxChange = (index, equipoId) => {
        const updatedLicencias = [...softwareLicencias];
        const selectedEquipos = updatedLicencias[index].id_equipos || [];

        if (selectedEquipos.includes(equipoId)) {
            updatedLicencias[index].id_equipos = selectedEquipos.filter(id => id !== equipoId);
        } else {
            updatedLicencias[index].id_equipos = [...selectedEquipos, equipoId];
        }

        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar cambios en el checkbox de licencia compartida
    const handleCompartidaChange = (index) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index].compartida = !updatedLicencias[index].compartida;

        if (!updatedLicencias[index].compartida) {
            // Si se desmarca, limitar a un solo equipo
            const equiposArray = updatedLicencias[index].id_equipos || [];
            updatedLicencias[index].id_equipos = equiposArray.length > 0 ? [equiposArray[0]] : [];
        }

        setSoftwareLicencias(updatedLicencias);
    };

    // Manejar cambios en el máximo de licencias
    const handleMaxLicenciasChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setMaxLicencias(value >= 0 ? value : 0);
        
        if (value > 0 && softwareLicencias.length > value) {
            setSoftwareLicencias(softwareLicencias.slice(0, value));
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación adicional para asegurarse de que todas las licencias compartidas tienen al menos un equipo asociado
        const licenciasValidas = softwareLicencias.every(licencia => {
            if (licencia.compartida) {
                return licencia.id_equipos && licencia.id_equipos.length > 0;
            }
            // Para licencias no compartidas, debe haber exactamente un equipo
            return licencia.id_equipos && licencia.id_equipos.length === 1;
        });

        if (!licenciasValidas) {
            setError('Todas las licencias compartidas deben tener al menos un equipo asociado y las licencias no compartidas deben tener exactamente un equipo.');
            return;
        }

        // Preparar las licencias con sus equipos asociados
        const softwareLicenciasPayload = softwareLicencias.map(licencia => ({
            claveLicencia: licencia.claveLicencia?.trim() || null,
            correoAsociado: licencia.correoAsociado?.trim() || null,
            contrasenaCorreo: licencia.contrasenaCorreo?.trim() || null,
            compartida: licencia.compartida || false,
            equipos_asociados: licencia.id_equipos.length > 0 ? licencia.id_equipos : []
        }));

        const softwareData = {
            nombre: nombre.trim(),
            version: version.trim(),
            fechaAdquisicion: fechaAdquisicion || null,
            fechaCaducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad || null,
            tipoLicencia: tipoLicencia || 'mensual',
            estado: estado || 'sin uso',
            licenciaCaducada: licenciaCaducada ? 1 : 0,
            maxDispositivos: maxLicencias || 0,
            softwareLicencias: softwareLicenciasPayload || [],
        };        

        console.log('Datos a enviar:', JSON.stringify(softwareData, null, 2)); // Log de los datos que se enviarán al backend

        try {
            const response = await axios.post(`${API_BASE_URL}/software`, softwareData);
            onSave(response.data); 
            onClose(); // Cerrar el formulario después de guardar
        } catch (error) {
            console.error("Error al guardar el software:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(`Error al guardar el software: ${error.response.data.message}`);
            } else {
                setError('Ocurrió un error inesperado al guardar el software.');
            }
        }
    };

    // Manejar el cierre del formulario con confirmación
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

    // Confirmar el cierre del formulario
    const confirmClose = () => {
        setShowConfirmation(false);
        onClose();
    };

    // Cancelar el cierre del formulario
    const cancelClose = () => {
        setShowConfirmation(false);
    };

    // Manejar el toggle de tooltips
    const toggleTooltip = (field) => {
        setTooltip(tooltip === field ? null : field);
    };

    if (loading) {
        return <div>Cargando datos...</div>;
    }

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={handleClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Agregar Software</h2>

                    {error && <p className="error-message">{error}</p>}

                    {/* Nombre del Software con Sugerencias y Tooltip */}
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

                    {/* Versión con Tooltip */}
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

                    {/* Fecha de Adquisición */}
                    <label>
                        Fecha de Adquisición:
                        <input
                            type="date"
                            value={fechaAdquisicion || ''}
                            onChange={(e) => setFechaAdquisicion(e.target.value)}
                        />
                    </label>

                    {/* Fecha de Caducidad */}
                    <label>
                        Fecha de Caducidad:
                        <input
                            type="date"
                            value={fechaCaducidad || ''}
                            readOnly
                        />
                    </label>

                    {/* Tipo de Licencia */}
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

                    {/* Licencia Caducada */}
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

                    {/* Máximo de Licencias */}
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

                    {/* Sección de Licencias Específicas */}
                    <h3>Licencias Específicas</h3>
                    {softwareLicencias.map((licencia, index) => (
                        <div key={index} className="licencia-section">
                            {/* Clave de Licencia */}
                            <label>Clave de Licencia:</label>
                            <input
                                type="text"
                                value={licencia.claveLicencia}
                                onChange={(e) => handleLicenciaChange(index, 'claveLicencia', e.target.value)}
                            />

                            {/* Correo Asociado */}
                            <label>Correo Asociado:</label>
                            <input
                                type="email"
                                value={licencia.correoAsociado}
                                onChange={(e) => handleLicenciaChange(index, 'correoAsociado', e.target.value)}
                            />

                            {/* Contraseña del Correo */}
                            <label>Contraseña del Correo:</label>
                            <input
                                type="password"
                                value={licencia.contrasenaCorreo}
                                onChange={(e) => handleLicenciaChange(index, 'contrasenaCorreo', e.target.value)}
                            />

                            {/* Licencia Compartida */}
                            <label>
                                <input
                                    type="checkbox"
                                    checked={licencia.compartida}
                                    onChange={() => handleCompartidaChange(index)}
                                />
                                Usar esta licencia en múltiples equipos
                            </label>

                            {/* IDs de Equipos Asociados */}
                            {licencia.compartida ? (
                                <div className="equipos-checkbox-list">
                                    {equipos.map((equipo) => (
                                        <label key={equipo.id_equipos}>
                                            <input
                                                type="checkbox"
                                                value={equipo.id_equipos}
                                                checked={Array.isArray(licencia.id_equipos) ? licencia.id_equipos.includes(equipo.id_equipos) : false}
                                                onChange={() => handleEquiposCheckboxChange(index, equipo.id_equipos)}
                                            />
                                            {equipo.id_equipos} - {equipo.nombre}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="equipo-select-container">
                                    <select
                                        value={Array.isArray(licencia.id_equipos) ? (licencia.id_equipos[0] || '') : ''}
                                        onChange={(e) => handleLicenciaChange(index, 'id_equipos', e.target.value ? [e.target.value] : [])}
                                        required
                                    >
                                        <option value="">Seleccionar un equipo</option>
                                        {equipos.map((equipo) => (
                                            <option key={equipo.id_equipos} value={equipo.id_equipos}>
                                                {equipo.id_equipos} - {equipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Eliminar Licencia */}
                            <button type="button" onClick={() => handleRemoveLicencia(index)} className="remove-licencia-button">
                                <FontAwesomeIcon icon={faTrash} /> Eliminar Licencia
                            </button>
                        </div>
                    ))}

                    {/* Agregar Nueva Licencia */}
                    {softwareLicencias.length < maxLicencias || maxLicencias === 0 ? (
                        <button type="button" onClick={handleAddLicencia} className="add-licencia-button">
                            <FontAwesomeIcon icon={faPlus} /> Agregar Licencia
                        </button>
                    ) : null}

                    {/* Estado del Software */}
                    <label>
                        Estado del Software:
                        <input type="text" value={estado} readOnly />
                    </label>

                    {/* Botón de Guardar */}
                    <button className="button" type="submit">Guardar</button>

                    {/* Modal de Confirmación al Cerrar */}
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
