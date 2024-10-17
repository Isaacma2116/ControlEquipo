import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareForm.css'; // Asegúrate de que la ruta al archivo CSS sea correcta

// Función de debounce para mejorar la búsqueda
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
    const [fechaAdquisicion, setFechaAdquisicion] = useState(null); // Cambiado a null
    const [fechaCaducidad, setFechaCaducidad] = useState(null); // Cambiado a null
    const [tipoLicencia, setTipoLicencia] = useState('mensual'); // Valor por defecto
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

    // Estado para almacenar los nombres de software existentes
    const [softwareNames, setSoftwareNames] = useState([]);

    // Filtrar los términos de búsqueda con debounce (espera de 500ms)
    const searchTerm = useDebounce(searchTermInput, 500);

    // Cargar los equipos desde la API
    useEffect(() => {
        const fetchEquipos = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:3550/api/equipos');
                setEquipos(response.data);
            } catch (error) {
                setError('Hubo un problema al cargar los equipos. Intenta nuevamente más tarde.');
            }
            setLoading(false);
        };
        fetchEquipos();
    }, []);

    // Cargar los nombres de software desde la base de datos
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

    // Cargar búsquedas recientes desde localStorage
    useEffect(() => {
        const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        setRecentSearches(storedSearches);
    }, []);

    // Guardar búsquedas recientes
    const saveRecentSearch = (search) => {
        const updatedSearches = [search, ...recentSearches.slice(0, 4)]; // Solo guarda las últimas 5
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

    // Filtrar equipos por ID o nombre basado en el término de búsqueda
    const filteredEquipos = equipos.filter(equipo =>
        equipo.id_equipos.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Maneja la selección de un equipo en el select
    const handleEquipoChange = (e) => {
        setIdEquipo(e.target.value);
        if (e.target.value !== '') {
            saveRecentSearch(e.target.value);
        }
    };

    // Maneja el campo de búsqueda
    const handleSearchChange = (event) => {
        setSearchTermInput(event.target.value);
    };

    // Opción para agregar nuevo equipo
    const handleAddNewEquipo = () => {
        alert('Redirigir o abrir modal para agregar un nuevo equipo.');
    };

    // Actualizar el estado del software dinámicamente
    useEffect(() => {
        const hoy = new Date();
        const caducidad = new Date(fechaCaducidad);

        if (!idEquipo) {
            setEstado('sin uso');
        } else if (licenciaCaducada || (fechaCaducidad && caducidad < hoy)) {
            if (idEquipo) {
                setEstado('vencido con equipo');
            } else {
                setEstado('vencido');
            }
        } else {
            setEstado('activo');
        }
    }, [idEquipo, fechaCaducidad, licenciaCaducada]);

    // Verifica si el formulario es válido antes de enviarlo
    const isFormValid = () => {
        return nombre; // Asegúrate de que el campo obligatorio esté lleno
    };

    // Maneja el envío del formulario
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
            fechaAdquisicion: fechaAdquisicion || null, // Asegúrate de enviar null si no se proporciona
            fechaCaducidad: tipoLicencia === 'vitalicia' ? null : fechaCaducidad,
            tipoLicencia,  // Asegúrate de que esto tenga un valor
            claveLicencia,
            correoAsociado,
            contrasenaCorreo,
            estado,
            idEquipo,
            licenciaCaducada // Asegúrate de que esto tenga un valor booleano
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

        onClose();  // Cierra el formulario
    };

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Agregar Software</h2>

                    {/* Campo obligatorio */}
                    <label>Nombre del Software:</label>
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

                    {/* Campos opcionales */}
                    <label>Versión:</label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                    />

                    <label>Licencia:</label>
                    <input
                        type="text"
                        value={licencia}
                        onChange={(e) => setLicencia(e.target.value)}
                    />

                    <label>Fecha de Adquisición:</label>
                    <input
                        type="date"
                        value={fechaAdquisicion}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                    />

                    <label>Tipo de Licencia:</label>
                    <select
                        value={tipoLicencia}
                        onChange={(e) => setTipoLicencia(e.target.value)}
                    >
                        <option value="mensual">Mensual</option>
                        <option value="anual">Anual</option>
                        <option value="vitalicia">Vitalicia</option>
                    </select>

                    <label>Clave de Licencia:</label>
                    <input
                        type="text"
                        value={claveLicencia}
                        onChange={(e) => setClaveLicencia(e.target.value)}
                    />

                    <label>Correo Asociado:</label>
                    <input
                        type="email"
                        value={correoAsociado}
                        onChange={(e) => setCorreoAsociado(e.target.value)}
                    />

                    <label>Contraseña del Correo:</label>
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
                        </label>
                    </div>

                    <label>Buscar y seleccionar Equipo Asociado:</label>
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
                            {/* Opción para agregar un nuevo equipo */}
                            <option onClick={handleAddNewEquipo}>Agregar nuevo equipo</option>
                        </select>
                    )}

                    <label>Estado del Software:</label>
                    <input type="text" value={estado} readOnly />

                    <button type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
