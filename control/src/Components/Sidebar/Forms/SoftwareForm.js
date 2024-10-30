import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './styles/SoftwareForm.css';

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

const SoftwareForm = ({ onSave, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState(null);
    const [fechaCaducidad, setFechaCaducidad] = useState(null);
    const [tipoLicencia, setTipoLicencia] = useState('mensual');
    const [claveLicencia, setClaveLicencia] = useState('');
    const [correoAsociado, setCorreoAsociado] = useState('');
    const [contrasenaCorreo, setContrasenaCorreo] = useState('');
    const [idEquipo, setIdEquipo] = useState('');
    const [estado, setEstado] = useState('sin uso');
    const [equipos, setEquipos] = useState([]);
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);
    const [searchTermInput, setSearchTermInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [softwareNames, setSoftwareNames] = useState([]);
    const [tooltip, setTooltip] = useState(null);
    
    // Campos nuevos
    const [tipoUso, setTipoUso] = useState('unico'); // Tipo de uso: único equipo o compartido
    const [maxEquipos, setMaxEquipos] = useState(1); // Máximo de equipos en caso de uso compartido

    // Valor debounced para la búsqueda
    const searchTerm = useDebounce(searchTermInput, 500);

    // Fetch para equipos
    useEffect(() => {
        if (equipos.length === 0) {
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
        }
    }, [equipos]);

    // Fetch para nombres de software
    useEffect(() => {
        const fetchSoftwareNames = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/software/names');
                setSoftwareNames(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error al cargar nombres de software:', error);
                setSoftwareNames([]);
            }
        };
        fetchSoftwareNames();
    }, []);

    // Cargar búsquedas recientes
    useEffect(() => {
        const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        setRecentSearches(storedSearches);
    }, []);

    // Guardar búsqueda reciente
    const saveRecentSearch = (search) => {
        const updatedSearches = [search, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

    // Filtro de equipos para búsqueda
    const filteredEquipos = equipos.filter(equipo =>
        equipo.id_equipos.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEquipoChange = (e) => {
        setIdEquipo(e.target.value);
        if (e.target.value !== '') {
            saveRecentSearch(e.target.value);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTermInput(event.target.value);
    };

    const handleAddNewEquipo = () => {
        alert('Redirigir o abrir modal para agregar un nuevo equipo.');
    };

    // Cálculo del estado del software basado en la fecha de caducidad y equipos
    useEffect(() => {
        const hoy = new Date();
        const caducidad = new Date(fechaCaducidad);

        if (!idEquipo) {
            setEstado('sin uso');
        } else if (licenciaCaducada || (fechaCaducidad && caducidad < hoy)) {
            setEstado(idEquipo ? 'vencido con equipo' : 'vencido');
        } else {
            setEstado('activo');
        }
    }, [idEquipo, fechaCaducidad, licenciaCaducada]);

    // Cálculo automático de la fecha de caducidad basado en la fecha de adquisición y tipo de licencia
    useEffect(() => {
        if (!fechaAdquisicion) return;

        const fecha = new Date(fechaAdquisicion);
        let nuevaFechaCaducidad = null;

        if (tipoLicencia === 'mensual') {
            nuevaFechaCaducidad = new Date(fecha.setMonth(fecha.getMonth() + 1));
        } else if (tipoLicencia === 'anual') {
            nuevaFechaCaducidad = new Date(fecha.setFullYear(fecha.getFullYear() + 1));
        } else if (tipoLicencia === 'vitalicia') {
            nuevaFechaCaducidad = null; // No hay fecha de caducidad para licencias vitalicias
        }

        setFechaCaducidad(nuevaFechaCaducidad ? nuevaFechaCaducidad.toISOString().split('T')[0] : null);
    }, [fechaAdquisicion, tipoLicencia]);

    // Validar si el formulario es válido
    const isFormValid = () => {
        return nombre.trim() && claveLicencia.trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setError("Por favor, completa todos los campos obligatorios.");
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
            id_equipos: idEquipo,
            licenciaCaducada,
            tipoUso, // Se incluye el tipo de uso (único o compartido)
            maxEquipos: tipoUso === 'compartido' ? maxEquipos : 1 // Máximo de equipos en caso de licencia compartida
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
                        {tooltip === 'nombre' && <div className="tooltip">Este campo es obligatorio. Ingresa el nombre completo del software que deseas registrar. Ejemplo: "Microsoft Office 365".</div>}
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
                                <option key={index} value={software.nombre}>
                                    {software.nombre} (Registrado {software.count || 0} veces)
                                </option>
                            ))
                        ) : (
                            <option disabled>No se encontraron nombres de software</option>
                        )}
                    </datalist>

                    <label>
                        Versión:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('version')} className="info-icon" />
                        {tooltip === 'version' && <div className="tooltip">Ingresa la versión específica del software. Esto es opcional pero puede ayudar a identificar exactamente qué versión se está utilizando. Ejemplo: "16.0.13328.20262".</div>}
                    </label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                    />

                    <label>
                        Fecha de Adquisición:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('fechaAdquisicion')} className="info-icon" />
                        {tooltip === 'fechaAdquisicion' && <div className="tooltip">Selecciona la fecha en que adquiriste este software. Esto es importante para llevar un control de cuándo fue comprado o descargado.</div>}
                    </label>
                    <input
                        type="date"
                        value={fechaAdquisicion || ''}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                    />

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
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('tipoLicencia')} className="info-icon" />
                        {tooltip === 'tipoLicencia' && <div className="tooltip">Selecciona el tipo de licencia. Esto puede ser "Mensual", "Anual" o "Vitalicia".</div>}
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
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('claveLicencia')} className="info-icon" />
                        {tooltip === 'claveLicencia' && <div className="tooltip">Introduce aquí la clave de licencia que recibiste al comprar el software.</div>}
                    </label>
                    <input
                        type="text"
                        value={claveLicencia}
                        onChange={(e) => setClaveLicencia(e.target.value)}
                        required
                    />

                    <label>
                        Correo Asociado:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('correoAsociado')} className="info-icon" />
                        {tooltip === 'correoAsociado' && <div className="tooltip">Ingresa el correo electrónico asociado al software, si aplica.</div>}
                    </label>
                    <input
                        type="email"
                        value={correoAsociado}
                        onChange={(e) => setCorreoAsociado(e.target.value)}
                    />

                    <label>
                        Contraseña del Correo:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('contrasenaCorreo')} className="info-icon" />
                        {tooltip === 'contrasenaCorreo' && <div className="tooltip">Introduce la contraseña del correo asociado, si aplica.</div>}
                    </label>
                    <input
                        type="password"
                        value={contrasenaCorreo}
                        onChange={(e) => setContrasenaCorreo(e.target.value)}
                    />

                    <div>
                        <p>Marca esta opción si la licencia ya ha caducado.</p>
                        <label>
                            <input
                                type="checkbox"
                                checked={licenciaCaducada}
                                onChange={(e) => setLicenciaCaducada(e.target.checked)}
                            />
                            Licencia ya caducada
                            <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('licenciaCaducada')} className="info-icon" />
                            {tooltip === 'licenciaCaducada' && <div className="tooltip">Marca esta casilla si la licencia del software ya ha expirado.</div>}
                        </label>
                    </div>

                    <label>
                        Tipo de Uso:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('tipoUso')} className="info-icon" />
                        {tooltip === 'tipoUso' && <div className="tooltip">Selecciona si esta licencia es para un solo equipo o compartida en múltiples equipos.</div>}
                    </label>
                    <select value={tipoUso} onChange={(e) => setTipoUso(e.target.value)}>
                        <option value="unico">Un solo equipo</option>
                        <option value="compartido">Compartida en múltiples equipos</option>
                    </select>

                    {tipoUso === 'compartido' && (
                        <>
                            <label>
                                Número máximo de equipos:
                                <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('maxEquipos')} className="info-icon" />
                                {tooltip === 'maxEquipos' && <div className="tooltip">Ingresa el número máximo de equipos en los que esta licencia puede ser utilizada.</div>}
                            </label>
                            <input
                                type="number"
                                value={maxEquipos}
                                onChange={(e) => setMaxEquipos(e.target.value)}
                                min="1"
                                required
                            />
                        </>
                    )}

                    <label>
                        Buscar y seleccionar Equipo Asociado:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('equipoAsociado')} className="info-icon" />
                        {tooltip === 'equipoAsociado' && <div className="tooltip">Buscar y seleccionar un equipo (computadora o dispositivo) que esté asociado a este software.</div>}
                    </label>
                    <input
                        type="text"
                        placeholder="Buscar por ID de equipo o nombre..."
                        value={searchTermInput}
                        onChange={handleSearchChange}
                    />

                    {loading ? (
                        <p>Buscando equipos...</p>
                    ) : (
                        <>
                            <select value={idEquipo} onChange={handleEquipoChange}>
                                <option value="">Ningún equipo asociado</option>
                                {filteredEquipos.length > 0 ? (
                                    filteredEquipos.map((equipo) => (
                                        <option key={equipo.id_equipos} value={equipo.id_equipos}>
                                            {equipo.id_equipos} - {equipo.nombre}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No se encontraron equipos</option>
                                )}
                            </select>
                            <button type="button" onClick={handleAddNewEquipo}>Agregar nuevo equipo</button>
                        </>
                    )}

                    <label>
                        Estado del Software:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('estado')} className="info-icon" />
                        {tooltip === 'estado' && <div className="tooltip">Este campo muestra el estado actual del software, que puede ser "Activo", "Sin uso", o "Vencido".</div>}
                    </label>
                    <input type="text" value={estado} readOnly />

                    <button className="button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
