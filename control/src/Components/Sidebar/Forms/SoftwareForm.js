import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareForm.css'; // Asegúrate de que la ruta al archivo CSS sea correcta

const SoftwareForm = ({ onSave, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [licencia, setLicencia] = useState('');
    const [fechaAdquisicion, setFechaAdquisicion] = useState('');
    const [fechaCaducidad, setFechaCaducidad] = useState('');
    const [tipoLicencia, setTipoLicencia] = useState('mensual');
    const [claveLicencia, setClaveLicencia] = useState('');
    const [correoAsociado, setCorreoAsociado] = useState('');
    const [contrasenaCorreo, setContrasenaCorreo] = useState('');
    const [idEquipo, setIdEquipo] = useState('');
    const [estado, setEstado] = useState('sin uso');
    const [equipos, setEquipos] = useState([]);
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Cargar los equipos desde la API
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/equipos');
                setEquipos(response.data);
            } catch (error) {
                console.error('Error al cargar los equipos:', error);
                setError('Hubo un problema al cargar los equipos. Intenta nuevamente más tarde.');
            }
        };
        fetchEquipos();
    }, []);

    // Actualiza la fecha de caducidad automáticamente cuando cambia el tipo de licencia
    useEffect(() => {
        if (fechaAdquisicion) {
            const fecha = new Date(fechaAdquisicion);
            if (tipoLicencia === 'mensual') {
                fecha.setMonth(fecha.getMonth() + 1);
            } else if (tipoLicencia === 'anual') {
                fecha.setFullYear(fecha.getFullYear() + 1);
            }
            setFechaCaducidad(tipoLicencia === 'vitalicia' ? '' : fecha.toISOString().split('T')[0]);
        }
    }, [fechaAdquisicion, tipoLicencia]);

    // Actualiza el estado del software dinámicamente
    useEffect(() => {
        const hoy = new Date();
        const caducidad = new Date(fechaCaducidad);

        if (licenciaCaducada) {
            setEstado('vencido');
        } else if (!idEquipo) {
            setEstado('sin uso');
        } else if (fechaCaducidad && caducidad < hoy) {
            setEstado('vencido');
        } else {
            setEstado('activo');
        }
    }, [idEquipo, fechaCaducidad, licenciaCaducada]);

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            nombre,
            version,
            licencia,
            fechaAdquisicion,
            fechaCaducidad: tipoLicencia === 'vitalicia' ? 'vitalicia' : fechaCaducidad,
            claveLicencia,
            correoAsociado,
            contrasenaCorreo,
            estado,
            idEquipo
        });
        onClose();
    };

    // Filtrar equipos por ID o nombre basado en el término de búsqueda
    const filteredEquipos = equipos.filter(equipo =>
        equipo.id_equipos && equipo.id_equipos.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.nombre && equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Maneja la selección de un equipo en el select
    const handleEquipoChange = (e) => {
        setIdEquipo(e.target.value);
    };

    // Manejador de búsqueda
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Agregar Software</h2>

                    <label>Nombre del Software:</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    <label>Versión:</label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        required
                    />

                    <label>Licencia:</label>
                    <input
                        type="text"
                        value={licencia}
                        onChange={(e) => setLicencia(e.target.value)}
                        required
                    />

                    <label>Fecha de Adquisición:</label>
                    <input
                        type="date"
                        value={fechaAdquisicion}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                        required
                    />

                    <label>Tipo de Licencia:</label>
                    <select
                        value={tipoLicencia}
                        onChange={(e) => setTipoLicencia(e.target.value)}
                        required
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
                        required
                    />

                    <label>Contraseña del Correo:</label>
                    <input
                        type="password"
                        value={contrasenaCorreo}
                        onChange={(e) => setContrasenaCorreo(e.target.value)}
                        required
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
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    
                    {/* Select dinámico para elegir equipo */}
                    <select value={idEquipo} onChange={handleEquipoChange}>
                        {/* Opción para no seleccionar ningún equipo */}
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

                    <label>Estado del Software:</label>
                    <input type="text" value={estado} readOnly />

                    <button type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
