import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/SoftwareForm.css';

// Hook para manejar el debounce de búsqueda
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const SoftwareManagementForm = ({ onSave, onClose, idEquipo }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState(null);
    const [fechaCaducidad, setFechaCaducidad] = useState(null);
    const [tipoLicencia, setTipoLicencia] = useState('mensual');
    const [claveLicencia, setClaveLicencia] = useState('');
    const [correoAsociado, setCorreoAsociado] = useState('');
    const [contrasenaCorreo, setContrasenaCorreo] = useState('');
    const [estado, setEstado] = useState('sin uso');
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [softwareNames, setSoftwareNames] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [tooltip, setTooltip] = useState(null);
    const [maxDispositivos, setMaxDispositivos] = useState(1);
    const [licenciasEnUso, setLicenciasEnUso] = useState(0);
    const [maxDispositivosError, setMaxDispositivosError] = useState('');

    const searchTerm = useDebounce(nombre, 500);

    // Fetch nombres de software (búsqueda autocompletado)
    useEffect(() => {
        const fetchSoftwareNames = async () => {
            if (!searchTerm.trim()) {
                setSoftwareNames([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3550/api/software/search?query=${searchTerm}`);
                if (response.data.length === 0) {
                    setNoResults(true);
                    setSoftwareNames([]);
                } else {
                    setNoResults(false);
                    setSoftwareNames(response.data);
                }
            } catch (error) {
                console.error('Error al buscar nombres de software:', error);
                setNoResults(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSoftwareNames();
    }, [searchTerm]);

    // Fetch para contar cuántas licencias están usando este software
    useEffect(() => {
        const fetchLicenciasEnUso = async () => {
            if (!nombre) return;

            try {
                const response = await axios.get(`http://localhost:3550/api/software/${nombre}/licencias-en-uso`);
                setLicenciasEnUso(response.data.count);
            } catch (error) {
                console.error('Error al cargar licencias en uso:', error);
            }
        };

        fetchLicenciasEnUso();
    }, [nombre]);

    const isFormValid = () => {
        if (!nombre.trim()) {
            setError('El nombre del software es obligatorio.');
            return false;
        }

        if (licenciasEnUso >= maxDispositivos) {
            setMaxDispositivosError(`Se han alcanzado las ${maxDispositivos} licencias permitidas para este software.`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            return;
        }

        const softwareData = {
            nombre,
            version,
            fechaAdquisicion: fechaAdquisicion || null,
            fechaCaducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad,
            tipoLicencia,
            claveLicencia,
            correoAsociado,
            contrasenaCorreo,
            estado,
            equipos_asociados: [idEquipo], // Asociar solo al equipo actual
            licenciaCaducada,
            maxDispositivos,
        };

        try {
            const response = await axios.post('http://localhost:3550/api/software', softwareData);
            if (response.status === 201) {
                onSave(response.data);
            } else {
                setError('Error al guardar el software.');
            }
        } catch (error) {
            setError(error.response?.data || 'Error al enviar los datos.');
        }

        onClose();
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
                        list="software-names"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <datalist id="software-names">
                        {softwareNames.length > 0 ? (
                            softwareNames.map((software, index) => (
                                <option key={index} value={software}>
                                    {software}
                                </option>
                            ))
                        ) : noResults ? (
                            <option disabled>No se encontraron coincidencias</option>
                        ) : null}
                    </datalist>

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

                    <label>
                        Clave de Licencia:
                    </label>
                    <input
                        type="text"
                        value={claveLicencia}
                        onChange={(e) => setClaveLicencia(e.target.value)}
                    />

                    <label>
                        Correo Asociado:
                    </label>
                    <input
                        type="email"
                        value={correoAsociado}
                        onChange={(e) => setCorreoAsociado(e.target.value)}
                    />

                    <label>
                        Contraseña del Correo:
                    </label>
                    <input
                        type="password"
                        value={contrasenaCorreo}
                        onChange={(e) => setContrasenaCorreo(e.target.value)}
                    />

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
                        Estado del Software:
                        <input type="text" value={estado} readOnly />
                    </label>

                    <label>
                        Máximo de dispositivos permitidos:
                        <input
                            type="number"
                            min="1"
                            value={maxDispositivos}
                            onChange={(e) => setMaxDispositivos(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Licencias en uso:
                        <input type="text" value={licenciasEnUso} readOnly />
                    </label>

                    {maxDispositivosError && <p className="error-message">{maxDispositivosError}</p>}

                    <button className="button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareManagementForm;
