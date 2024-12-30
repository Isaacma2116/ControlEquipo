import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './styles/Equipos.css';
import EquipoForm from './Forms/EquipoForm'; // Asegúrate de tener la ruta correcta a tu formulario

const Equipos = ({ onEquipoClick, hasUnsavedChanges, onCancelChanges }) => {
    const [searchTerm, setSearchTerm] = useState(''); // Estado para la barra de búsqueda
    const [equipos, setEquipos] = useState([]);       // Estado para la lista de equipos
    const [showForm, setShowForm] = useState(false);  // Estado para manejar la visibilidad del formulario
    const [filterOpen, setFilterOpen] = useState(false); // Estado para el menú de filtros
    const [sortOrder, setSortOrder] = useState('');   // Estado para el criterio de ordenación
    const [error, setError] = useState(null);         // Estado para manejo de errores

    const [colaboradores, setColaboradores] = useState([]); // Estado para la lista de colaboradores
    const [loadingColaboradores, setLoadingColaboradores] = useState(true); // Estado de carga para colaboradores
    const [errorColaboradores, setErrorColaboradores] = useState(null); // Estado de error para colaboradores

    // Cargar los equipos y colaboradores desde la API
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/equipos');
                setEquipos(response.data);
            } catch (error) {
                console.error('Error fetching equipos:', error);
                setError('Hubo un problema al cargar los equipos. Intenta nuevamente más tarde.');
            }
        };

        const fetchColaboradores = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/colaboradores');
                setColaboradores(response.data);
            } catch (error) {
                console.error('Error fetching colaboradores:', error);
                setErrorColaboradores('Hubo un problema al cargar los colaboradores.');
            } finally {
                setLoadingColaboradores(false);
            }
        };

        fetchEquipos();
        fetchColaboradores();
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

    // Alternar la visibilidad del menú de filtros
    const toggleFilterMenu = () => {
        setFilterOpen(!filterOpen);
    };

    // Cambiar el criterio de ordenación
    const handleSortChange = (criteria) => {
        setSortOrder(criteria);
        setFilterOpen(false);
    };

    // Ordenar equipos según el criterio seleccionado
    const sortedEquipos = () => {
        if (sortOrder === 'name-asc') {
            return [...equipos].sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (sortOrder === 'name-desc') {
            return [...equipos].sort((a, b) => b.nombre.localeCompare(a.nombre));
        } else if (sortOrder === 'date-asc') {
            return [...equipos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        } else if (sortOrder === 'date-desc') {
            return [...equipos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }
        return equipos;
    };

    // Filtrar equipos según el término de búsqueda
    const filteredEquipos = sortedEquipos().filter(equipo =>
        equipo.id_equipos &&
        equipo.id_equipos.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Manejador de selección de equipo con confirmación
    const handleEquipoClick = (idEquipo) => {
        if (hasUnsavedChanges) {
            // Mostrar el mensaje de confirmación con botones personalizados
            Swal.fire({
                title: 'Hay cambios sin guardar',
                text: '¿Estás seguro de que quieres cambiar al equipo seleccionado?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cambiar',
                cancelButtonText: 'No, cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    onCancelChanges(); // Revertir cambios pendientes
                    onEquipoClick(idEquipo); // Cambiar al equipo seleccionado
                }
                // Si el usuario cancela, no hacemos nada
            });
        } else {
            // Si no hay cambios pendientes, cambiar directamente
            onEquipoClick(idEquipo);
        }
    };
        
    return (
        <div className="equipos-sidebar-menu">
            {/* Barra de búsqueda */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por ID de equipo..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-bar"
                />
                <button className="filter-button" onClick={toggleFilterMenu}>
                    <FontAwesomeIcon icon={faFilter} />
                </button>
            </div>

            {/* Menú de filtros */}
            {filterOpen && (
                <div className="filter-menu">
                    <p>Ordenar por:</p>
                    <button onClick={() => handleSortChange('name-asc')}>Nombre A-Z</button>
                    <button onClick={() => handleSortChange('name-desc')}>Nombre Z-A</button>
                    <button onClick={() => handleSortChange('date-asc')}>Fecha Ascendente</button>
                    <button onClick={() => handleSortChange('date-desc')}>Fecha Descendente</button>
                </div>
            )}

            {/* Lista de equipos */}
            <ul>
                {error || errorColaboradores ? (
                    <p className="error-message">{error || errorColaboradores}</p>
                ) : loadingColaboradores ? (
                    <p>Cargando colaboradores...</p>
                ) : (
                    filteredEquipos.length > 0 ? (
                        filteredEquipos.map((equipo) => {
                            // Encontrar el colaborador asignado al equipo
                            const colaboradorAsignado = colaboradores.find(col => col.id === equipo.idColaborador);

                            return (
                                <li key={equipo.id_equipos} onClick={() => handleEquipoClick(equipo.id_equipos)}>
                                    <div className="equipo-item">
                                        <span className="equipo-id">ID: {equipo.id_equipos}</span>
                                        <span className="separator"> - </span> {/* Guion añadido */}
                                        <span className="colaborador-nombre">
                                            {colaboradorAsignado ? colaboradorAsignado.nombre : '-'}
                                        </span>
                                    </div>
                                </li>
                            );
                        })
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
                <button onClick={handleAddClick} className="add-equipo-button">
                    <FontAwesomeIcon icon={faPlus} className="svg" /> Agregar Equipo
                </button>
            </div>
        </div>
    );
};

export default Equipos;
