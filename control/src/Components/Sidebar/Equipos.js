import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Equipos.css';
import EquipoForm from './Forms/EquipoForm'; // Asegúrate de tener la ruta correcta a tu formulario

const Equipos = ({ onEquipoClick }) => {
    const [searchTerm, setSearchTerm] = useState('');  // Estado para la barra de búsqueda
    const [equipos, setEquipos] = useState([]);        // Estado para la lista de equipos
    const [showForm, setShowForm] = useState(false);   // Estado para manejar la visibilidad del formulario
    const [error, setError] = useState(null);          // Estado para manejo de errores

    // Cargar los equipos desde la API
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/equipos');
                console.log(response.data);  // Verifica qué datos está devolviendo la API en la consola
                setEquipos(response.data);  // Guardar los datos en el estado
            } catch (error) {
                console.error('Error fetching data:', error);  // Manejo de errores
                setError('Hubo un problema al cargar los equipos. Intenta nuevamente más tarde.');
            }
        };
        fetchEquipos();
    }, []);

    // Manejador de búsqueda
    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Mostrar el formulario para agregar equipo
    const handleAddClick = () => {
        setShowForm(true);
    };

    // Cerrar el formulario
    const handleFormClose = () => {
        setShowForm(false);
    };

    // Filtrar equipos por ID (filtrar por id_equipos)
    const filteredEquipos = equipos.filter(equipo =>
        equipo.id_equipos &&  // Asegúrate de que `id_equipos` exista
        equipo.id_equipos.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="equipos-sidebar-menu">
            {/* Barra de búsqueda */}
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar por ID de equipo..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-bar"
                />
            </div>

            {/* Lista de equipos */}
            <ul>
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    filteredEquipos.length > 0 ? (
                        filteredEquipos.map((equipo, index) => (
                            <li key={index} onClick={() => onEquipoClick(equipo.id_equipos)}>
                                {equipo.id_equipos}  {/* Mostrar el id_equipos */}
                            </li>
                        ))
                    ) : (
                        <p>No se encontraron equipos.</p>
                    )
                )}
            </ul>

            {/* Formulario de agregar equipo */}
            {showForm && (
                <EquipoForm show={showForm} handleClose={handleFormClose} />
            )}

            {/* Botón para agregar equipo */}
            <div className="button-container">
                <button onClick={handleAddClick} className="Btn">
                    <FontAwesomeIcon icon={faPlus} className="svg" /> Agregar Equipo
                </button>
            </div>
        </div>
    );
};

export default Equipos;
