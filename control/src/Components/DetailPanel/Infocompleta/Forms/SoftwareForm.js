// src/Components/DetailPanel/Infocompleta/Forms/SoftwareForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import stringSimilarity from 'string-similarity';
import '../styles/SoftwareForm.css';

const SoftwareForm = ({ onSave = () => { }, onClose }) => {
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

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550/api';

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/equipos`);
                console.log('Equipos obtenidos:', response.data);
                setEquipos(response.data);
            } catch (error) {
                console.error('Error al cargar equipos:', error);
                setError('Error al cargar los equipos');
            }
        };
        fetchEquipos();
    }, []);

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

    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        checkNameCorrection(value);

        if (value) {
            const filtered = existingSoftwareNames.filter(name =>
                name.includes(value.toLowerCase())
            ).slice(0, 5);
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
        setShowSuggestions(false);
        setSuggestedCorrection('');
    };

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

    const handleRemoveLicencia = (index) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias.splice(index, 1);
        setSoftwareLicencias(updatedLicencias);
    };

    const handleLicenciaChange = (index, field, value) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index][field] = value;
        setSoftwareLicencias(updatedLicencias);
    };

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

    const handleCompartidaChange = (index) => {
        const updatedLicencias = [...softwareLicencias];
        updatedLicencias[index].compartida = !updatedLicencias[index].compartida;
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
    
        setError(null);
    
        // Validación ajustada: permitir cualquier licencia sin restricciones de equipos
        const licenciasValidas = true; // O ajusta según necesidades

        if (!licenciasValidas) {
            setError(
                'Existe un error en las licencias.'
            );
            return;
        }
    
        const softwareLicenciasPayload = softwareLicencias.map(licencia => ({
            claveLicencia: licencia.claveLicencia?.trim() || null,
            correoAsociado: licencia.correoAsociado?.trim() || null,
            contrasenaCorreo: licencia.contrasenaCorreo?.trim() || null,
            compartida: licencia.compartida || false,
            equipos_asociados: licencia.id_equipos.length > 0 ? licencia.id_equipos : null,
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
    
        console.log('Datos a enviar:', JSON.stringify(softwareData, null, 2));
    
        try {
            const response = await axios.post(`${API_BASE_URL}/software`, softwareData);
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error("Error al guardar el software:", error.response?.data || error.message);
            setError(error.response?.data?.message || 'Error al enviar los datos.');
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

    if (loading) {
        return <div className="software-form-loading">Cargando datos...</div>;
    }

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <button className="software-form-close-button" onClick={handleClose}>&times;</button>
                <form onSubmit={handleSubmit} className="software-form">
                    <h2>Agregar Software</h2>

                    {error && <p className="software-form-error-message">{error}</p>}

                    {/* Nombre del Software con Sugerencias y Tooltip */}
                    <label className="software-form-label">
                        Nombre del Software:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('nombre')} className="software-form-info-icon" />
                        {tooltip === 'nombre' && <div className="software-form-tooltip">Este campo es obligatorio.</div>}
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={handleNombreChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required
                        className="software-form-input"
                    />
                    {suggestedCorrection && (
                        <p className="software-form-suggestion-message">
                            ¿Quisiste decir <span onClick={handleApplySuggestion} className="software-form-suggestion">{suggestedCorrection}</span>?
                        </p>
                    )}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <ul className="software-form-suggestions-list">
                            {filteredSuggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="software-form-suggestion-item"
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Versión con Tooltip */}
                    <label className="software-form-label">
                        Versión:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('version')} className="software-form-info-icon" />
                        {tooltip === 'version' && <div className="software-form-tooltip">Opcional. Ingresa la versión del software.</div>}
                    </label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="software-form-input"
                    />

                    {/* Fecha de Adquisición */}
                    <label className="software-form-label">
                        Fecha de Adquisición:
                    </label>
                    <input
                        type="date"
                        value={fechaAdquisicion || ''}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                        className="software-form-input"
                    />

                    {/* Fecha de Caducidad */}
                    <label className="software-form-label">
                        Fecha de Caducidad:
                    </label>
                    <input
                        type="date"
                        value={fechaCaducidad || ''}
                        readOnly
                        className="software-form-input"
                    />

                    {/* Tipo de Licencia */}
                    <label className="software-form-label">
                        Tipo de Licencia:
                    </label>
                    <select
                        value={tipoLicencia}
                        onChange={(e) => setTipoLicencia(e.target.value)}
                        className="software-form-select"
                    >
                        <option value="mensual">Mensual</option>
                        <option value="anual">Anual</option>
                        <option value="vitalicia">Vitalicia</option>
                    </select>

                    {/* Licencia Caducada */}
                    <div className="software-form-checkbox-group">
                        <label className="software-form-checkbox-label">
                            <input
                                type="checkbox"
                                checked={licenciaCaducada}
                                onChange={(e) => setLicenciaCaducada(e.target.checked)}
                                className="software-form-checkbox"
                            />
                            Licencia ya caducada
                        </label>
                    </div>

                    {/* Máximo de Licencias */}
                    <label className="software-form-label">
                        Máximo de Licencias:
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={maxLicencias}
                        onChange={handleMaxLicenciasChange}
                        required
                        className="software-form-input"
                    />
                    <p className="software-form-licencias-info">Licencias en uso: {licenciasEnUso}</p>
                    <p className="software-form-licencias-info">Licencias sin uso: {licenciasSinUso}</p>

                    {/* Sección de Licencias Específicas */}
                    <h3 className="software-form-section-title">Licencias Específicas</h3>
                    {softwareLicencias.map((licencia, index) => (
                        <div key={index} className="software-form-licencia-section">
                            {/* Clave de Licencia */}
                            <label className="software-form-label">
                                Clave de Licencia:
                            </label>
                            <input
                                type="text"
                                value={licencia.claveLicencia}
                                onChange={(e) => handleLicenciaChange(index, 'claveLicencia', e.target.value)}
                                className="software-form-input"
                            />

                            {/* Correo Asociado */}
                            <label className="software-form-label">
                                Correo Asociado:
                            </label>
                            <input
                                type="email"
                                value={licencia.correoAsociado}
                                onChange={(e) => handleLicenciaChange(index, 'correoAsociado', e.target.value)}
                                className="software-form-input"
                            />

                            {/* Contraseña del Correo */}
                            <label className="software-form-label">
                                Contraseña del Correo:
                            </label>
                            <input
                                type="password"
                                value={licencia.contrasenaCorreo}
                                onChange={(e) => handleLicenciaChange(index, 'contrasenaCorreo', e.target.value)}
                                className="software-form-input"
                            />

                            {/* Licencia Compartida */}
                            <div className="software-form-checkbox-group">
                                <label className="software-form-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={licencia.compartida}
                                        onChange={() => handleCompartidaChange(index)}
                                        className="software-form-checkbox"
                                    />
                                    Usar esta licencia en múltiples equipos
                                </label>
                            </div>

                            {/* IDs de Equipos Asociados */}
                            <div className="software-form-equipos-checkbox-list">
                                {equipos.map((equipo) => (
                                    <label key={equipo.id_equipos} className="software-form-equipos-checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={equipo.id_equipos}
                                            checked={Array.isArray(licencia.id_equipos) ? licencia.id_equipos.includes(equipo.id_equipos) : false}
                                            onChange={() => handleEquiposCheckboxChange(index, equipo.id_equipos)}
                                            className="software-form-checkbox"
                                        />
                                        {equipo.id_equipos} - {equipo.nombre}
                                    </label>
                                ))}
                            </div>

                            {/* Eliminar Licencia */}
                            <button type="button" onClick={() => handleRemoveLicencia(index)} className="software-form-remove-licencia-button">
                                <FontAwesomeIcon icon={faTrash} /> Eliminar Licencia
                            </button>
                        </div>
                    ))}

                    {/* Agregar Nueva Licencia */}
                    {softwareLicencias.length < maxLicencias || maxLicencias === 0 ? (
                        <button type="button" onClick={handleAddLicencia} className="software-form-add-licencia-button">
                            <FontAwesomeIcon icon={faPlus} /> Agregar Licencia
                        </button>
                    ) : null}

                    {/* Estado del Software */}
                    <label className="software-form-label">
                        Estado del Software:
                    </label>
                    <input type="text" value={estado} readOnly className="software-form-input readonly-input" />

                    {/* Botón de Guardar */}
                    <button className="software-form-submit-button" type="submit">Guardar</button>

                    {/* Modal de Confirmación al Cerrar */}
                    {showConfirmation && (
                        <div className="software-form-confirmation-modal">
                            <p>¿Estás seguro de que deseas cerrar el formulario? Se perderán los datos no guardados.</p>
                            <button onClick={confirmClose} className="software-form-confirm-button">Sí, cerrar</button>
                            <button onClick={cancelClose} className="software-form-cancel-button">No, continuar</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
