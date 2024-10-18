import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './styles/SoftwareForm.css';

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
    const [licencia, setLicencia] = useState('');
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
    const [tooltip, setTooltip] = useState(null); // Para manejar el tooltip visible
    const searchTerm = useDebounce(searchTermInput, 500);

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

    useEffect(() => {
        const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        setRecentSearches(storedSearches);
    }, []);

    const saveRecentSearch = (search) => {
        const updatedSearches = [search, ...recentSearches.slice(0, 4)]; 
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

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

    const isFormValid = () => {
        return nombre; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        const softwareData = {
            nombre,
            version,
            licencia,
            fechaAdquisicion: fechaAdquisicion || null,
            fechaCaducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad,
            tipoLicencia,
            claveLicencia,
            correoAsociado,
            contrasenaCorreo,
            estado,
            id_equipos: idEquipo,
            licenciaCaducada
        };

        try {
            const response = await axios.post('http://localhost:3550/api/software', softwareData);
            if (response.status === 201) {
                onSave(response.data);
            } else {
                console.error('Error al guardar el software:', response.status);
            }
        } catch (error) {
            console.error('Error al enviar los datos al backend:', error);
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
                        {softwareNames.map((software, index) => (
                            <option key={index} value={software.nombre}>
                                {software.nombre} (Registrado {software.count} veces)
                            </option>
                        ))}
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
                        Licencia:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('licencia')} className="info-icon" />
                        {tooltip === 'licencia' && <div className="tooltip">Si el software tiene una licencia, ingresa aquí la clave o código de licencia. Ejemplo: "XXXXX-XXXXX-XXXXX-XXXXX".</div>}
                    </label>
                    <input
                        type="text"
                        value={licencia}
                        onChange={(e) => setLicencia(e.target.value)}
                    />

                    <label>
                        Fecha de Adquisición:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('fechaAdquisicion')} className="info-icon" />
                        {tooltip === 'fechaAdquisicion' && <div className="tooltip">Selecciona la fecha en que adquiriste este software. Esto es importante para llevar un control de cuándo fue comprado o descargado.</div>}
                    </label>
                    <input
                        type="date"
                        value={fechaAdquisicion}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                    />

                    <label>
                        Tipo de Licencia:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('tipoLicencia')} className="info-icon" />
                        {tooltip === 'tipoLicencia' && <div className="tooltip">Selecciona el tipo de licencia. Esto puede ser "Mensual", "Anual" o "Vitalicia". Cada una tiene un significado diferente en cuanto a la duración de la licencia.</div>}
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
                        {tooltip === 'claveLicencia' && <div className="tooltip">Introduce aquí la clave de licencia que recibiste al comprar el software. Este campo puede ser opcional dependiendo del tipo de software.</div>}
                    </label>
                    <input
                        type="text"
                        value={claveLicencia}
                        onChange={(e) => setClaveLicencia(e.target.value)}
                    />

                    <label>
                        Correo Asociado:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('correoAsociado')} className="info-icon" />
                        {tooltip === 'correoAsociado' && <div className="tooltip">Ingresa el correo electrónico asociado al software, si aplica. Este puede ser el correo que utilizaste para registrarte o activar la licencia del software.</div>}
                    </label>
                    <input
                        type="email"
                        value={correoAsociado}
                        onChange={(e) => setCorreoAsociado(e.target.value)}
                    />

                    <label>
                        Contraseña del Correo:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('contrasenaCorreo')} className="info-icon" />
                        {tooltip === 'contrasenaCorreo' && <div className="tooltip">Introduce la contraseña del correo asociado, si aplica. Esto solo se requiere si necesitas almacenar la contraseña en un lugar seguro para futuras referencias.</div>}
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
                            {tooltip === 'licenciaCaducada' && <div className="tooltip">Marca esta casilla si la licencia del software ya ha expirado. Esto es útil para mantener el seguimiento de las licencias caducadas en tu sistema.</div>}
                        </label>
                    </div>

                    <label>
                        Buscar y seleccionar Equipo Asociado:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('equipoAsociado')} className="info-icon" />
                        {tooltip === 'equipoAsociado' && <div className="tooltip">Buscar y seleccionar un equipo (computadora o dispositivo) que esté asociado a este software. Esto permite saber en qué equipo está instalado.</div>}
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
                            <option onClick={handleAddNewEquipo}>Agregar nuevo equipo</option>
                        </select>
                    )}

                    <label>
                        Estado del Software:
                        <FontAwesomeIcon icon={faInfoCircle} onClick={() => toggleTooltip('estado')} className="info-icon" />
                        {tooltip === 'estado' && <div className="tooltip">Este campo muestra el estado actual del software, que puede ser "Activo", "Sin uso", o "Vencido". Este campo se actualiza automáticamente en función de la información ingresada.</div>}
                    </label>
                    <input type="text" value={estado} readOnly />

                    <button className="button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
