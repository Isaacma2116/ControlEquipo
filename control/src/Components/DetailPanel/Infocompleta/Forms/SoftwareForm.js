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

const SoftwareForm = ({ onSave, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState(null);
    const [fechaCaducidad, setFechaCaducidad] = useState(null);
    const [tipoLicencia, setTipoLicencia] = useState('mensual');
    const [claveLicencia, setClaveLicencia] = useState('');
    const [correoAsociado, setCorreoAsociado] = useState('');
    const [contrasenaCorreo, setContrasenaCorreo] = useState('');
    const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
    const [estado, setEstado] = useState('sin uso');
    const [equipos, setEquipos] = useState([]);
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);
    const [searchTermInput, setSearchTermInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [softwareNames, setSoftwareNames] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [tooltip, setTooltip] = useState(null);
    const [maxDispositivos, setMaxDispositivos] = useState(1);
    const [dispositivosUsados, setDispositivosUsados] = useState(0);
    const [maxDispositivosError, setMaxDispositivosError] = useState('');

    const searchTerm = useDebounce(searchTermInput, 500);

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

    // Fetch nombres de software (busqueda autocompletado)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSoftwareNames([]);
            return;
        }

        const fetchSoftwareNames = async () => {
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

    const filteredEquipos = equipos.filter(equipo => {
        const id_equipos = equipo.id_equipos ? equipo.id_equipos.toString().toLowerCase() : '';
        const nombreEquipo = equipo.nombre ? equipo.nombre.toLowerCase() : '';
        const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';

        return id_equipos.includes(searchTermLower) || nombreEquipo.includes(searchTermLower);
    });

    const handleEquipoChange = (equipoId) => {
        const index = equiposSeleccionados.indexOf(equipoId);
        if (index === -1) {
            if (equiposSeleccionados.length < maxDispositivos) {
                setEquiposSeleccionados([...equiposSeleccionados, equipoId]);
                setMaxDispositivosError('');
            } else {
                setMaxDispositivosError(`No puedes seleccionar más de ${maxDispositivos} dispositivos.`);
            }
        } else {
            setEquiposSeleccionados(equiposSeleccionados.filter(id => id !== equipoId));
        }
    };

    const handleSearchChange = (event) => {
        setSearchTermInput(event.target.value);
    };

    const handleAddNewEquipo = () => {
        alert('Redirigir o abrir modal para agregar un nuevo equipo.');
    };

    // Cálculo del estado del software
    useEffect(() => {
        const hoy = new Date();
        const caducidad = new Date(fechaCaducidad);

        if (!equiposSeleccionados.length) {
            setEstado('sin uso');
        } else if (licenciaCaducada || (fechaCaducidad && caducidad < hoy)) {
            setEstado('vencido con equipo');
        } else {
            setEstado('activo');
        }
    }, [equiposSeleccionados, fechaCaducidad, licenciaCaducada]);

    // Cálculo automático de la fecha de caducidad
    useEffect(() => {
        if (!fechaAdquisicion) return;

        const fecha = new Date(fechaAdquisicion);
        let nuevaFechaCaducidad = null;

        if (tipoLicencia === 'mensual') {
            nuevaFechaCaducidad = new Date(fecha.setMonth(fecha.getMonth() + 1));
        } else if (tipoLicencia === 'anual') {
            nuevaFechaCaducidad = new Date(fecha.setFullYear(fecha.getFullYear() + 1));
        } else if (tipoLicencia === 'vitalicia') {
            nuevaFechaCaducidad = null;
        }

        setFechaCaducidad(nuevaFechaCaducidad ? nuevaFechaCaducidad.toISOString().split('T')[0] : null);
    }, [fechaAdquisicion, tipoLicencia]);

    const isFormValid = () => {
        if (!nombre.trim()) {
            setError('El nombre del software es obligatorio.'); 
            return false;
        }

        if (equiposSeleccionados.length > maxDispositivos) {
            setMaxDispositivosError(`Esta licencia solo permite asignarla a ${maxDispositivos} dispositivos.`);
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
            equipos_asociados: equiposSeleccionados,
            licenciaCaducada,
            maxDispositivos,
        };

        try {
            const response = await axios.post('http://localhost:3550/api/software', softwareData);
            if (response.status === 201) {
                onSave(response.data);
                window.location.reload(); // Refresca la página sin que el usuario lo note
            } else {
                setError('Error al guardar el software.'); 
            }
        } catch (error) {
            setError(error.response?.data.message || 'Error al enviar los datos.');
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
                        onChange={(e) => {
                            setNombre(e.target.value);
                            setSearchTermInput(e.target.value);
                        }}
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
                        Buscar y seleccionar Equipos Asociados:
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
                        <div className="equipos-list">
                            {filteredEquipos.length > 0 ? (
                                filteredEquipos.map((equipo) => (
                                    <label key={equipo.id_equipos}>
                                        <input
                                            type="checkbox"
                                            value={equipo.id_equipos}
                                            checked={equiposSeleccionados.includes(equipo.id_equipos)}
                                            onChange={() => handleEquipoChange(equipo.id_equipos)}
                                        />
                                        <span>{equipo.id_equipos} - {equipo.nombre}</span>
                                    </label>
                                ))
                            ) : (
                                <p>No se encontraron equipos</p>
                            )}
                        </div>
                    )}

                    <button type="button" onClick={handleAddNewEquipo}>Agregar nuevo equipo</button>

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
                        Dispositivos usados:
                        <input type="text" value={equiposSeleccionados.length} readOnly />
                    </label>

                    {maxDispositivosError && <p className="error-message">{maxDispositivosError}</p>}

                    <button className="button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
