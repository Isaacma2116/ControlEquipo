import React, { useState, useEffect } from 'react';
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
    const [licenciaCaducada, setLicenciaCaducada] = useState(false);  // Nuevo estado para controlar si la licencia está marcada como ya caducada

    // Simula la obtención de la lista de equipos
    useEffect(() => {
        const fetchEquipos = async () => {
            const equiposData = [
                { id: 1, nombre: 'Equipo 1' },
                { id: 2, nombre: 'Equipo 2' },
                { id: 3, nombre: 'Equipo 3' }
            ];
            setEquipos(equiposData);
        };
        fetchEquipos();
    }, []);

    // Maneja la fecha de caducidad según el tipo de licencia
    useEffect(() => {
        if (fechaAdquisicion) {
            const fecha = new Date(fechaAdquisicion);
            if (tipoLicencia === 'mensual') {
                fecha.setMonth(fecha.getMonth() + 1);
                setFechaCaducidad(fecha.toISOString().split('T')[0]); // Formato YYYY-MM-DD
            } else if (tipoLicencia === 'anual') {
                fecha.setFullYear(fecha.getFullYear() + 1);
                setFechaCaducidad(fecha.toISOString().split('T')[0]);
            } else if (tipoLicencia === 'vitalicia') {
                setFechaCaducidad(''); // No hay fecha de caducidad para licencias vitalicias
            }
        }
    }, [fechaAdquisicion, tipoLicencia]);

    // Maneja la lógica del estado del software según el equipo, la fecha de caducidad y si la licencia ya está caducada
    useEffect(() => {
        const today = new Date();
        const caducidad = new Date(fechaCaducidad);

        if (licenciaCaducada) {
            setEstado('vencido');  // Si la licencia ya está caducada, marca el estado como vencido
        } else if (!idEquipo) {
            setEstado('sin uso');
        } else if (fechaCaducidad && caducidad < today) {
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
        onClose();  // Cierra el modal después de guardar
    };

    return (
        <div className="software-form-modal">
            <div className="software-form-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>Agregar Software</h2>

                    {/* Nombre del Software */}
                    <label>Nombre del Software:</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />

                    {/* Versión */}
                    <label>Versión:</label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        required
                    />

                    {/* Licencia */}
                    <label>Licencia:</label>
                    <input
                        type="text"
                        value={licencia}
                        onChange={(e) => setLicencia(e.target.value)}
                        required
                    />

                    {/* Fecha de Adquisición */}
                    <label>Fecha de Adquisición:</label>
                    <input
                        type="date"
                        value={fechaAdquisicion}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                        required
                    />

                    {/* Tipo de Licencia */}
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

                    {/* Fecha de Caducidad (solo si no es vitalicia) */}
                    {tipoLicencia !== 'vitalicia' && (
                        <>
                            <label>Fecha de Caducidad:</label>
                            <input
                                type="date"
                                value={fechaCaducidad}
                                readOnly
                            />
                        </>
                    )}

                    {/* Clave de Licencia */}
                    <label>Clave de Licencia:</label>
                    <input
                        type="text"
                        value={claveLicencia}
                        onChange={(e) => setClaveLicencia(e.target.value)}
                    />

                    {/* Correo Asociado */}
                    <label>Correo Asociado:</label>
                    <input
                        type="email"
                        value={correoAsociado}
                        onChange={(e) => setCorreoAsociado(e.target.value)}
                        required
                    />

                    {/* Contraseña del Correo */}
                    <label>Contraseña del Correo:</label>
                    <input
                        type="password"
                        value={contrasenaCorreo}
                        onChange={(e) => setContrasenaCorreo(e.target.value)}
                        required
                    />

                    {/* Equipo Asociado */}
                    <label>Equipo Asociado:</label>
                    <select
                        value={idEquipo}
                        onChange={(e) => setIdEquipo(e.target.value)}
                    >
                        <option value="">Selecciona un equipo</option>
                        {equipos.map((equipo) => (
                            <option key={equipo.id} value={equipo.id}>
                                {equipo.nombre}
                            </option>
                        ))}
                    </select>

                    {/* Casilla para indicar si la licencia ya está caducada */}
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

                    {/* Estado del Software */}
                    <label>Estado:</label>
                    <input type="text" value={estado} readOnly />

                    <button type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default SoftwareForm;
