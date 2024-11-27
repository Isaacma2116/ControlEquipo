import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import './styles/Colaboradores.css';
import ColaboradorForm from './Forms/ColaboradorForm'; // Ajusta la ruta de importación si es necesario

const Colaboradores = ({ onColaboradorClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [colaboradores, setColaboradores] = useState([]);
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario
    const [filterOpen, setFilterOpen] = useState(false); // Estado para mostrar/ocultar el menú de filtros
    const [sortOrder, setSortOrder] = useState(''); // Estado para controlar el orden de filtrado

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/colaboradores');
                setColaboradores(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchColaboradores();
    }, []);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddClick = () => {
        setShowForm(true); // Muestra el formulario cuando se hace clic
    };

    const handleFormClose = () => {
        setShowForm(false); // Cierra el formulario
    };

    const toggleFilterMenu = () => {
        setFilterOpen(!filterOpen); // Alterna la visibilidad del menú de filtros
    };

    const handleSortChange = (criteria) => {
        setSortOrder(criteria); // Actualiza el estado de ordenamiento
        setFilterOpen(false); // Cierra el menú de filtros
    };

    const sortedColaboradores = () => {
        if (sortOrder === 'name-asc') {
            return [...colaboradores].sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (sortOrder === 'name-desc') {
            return [...colaboradores].sort((a, b) => b.nombre.localeCompare(a.nombre));
        } else if (sortOrder === 'date-asc') {
            return [...colaboradores].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        } else if (sortOrder === 'date-desc') {
            return [...colaboradores].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }
        return colaboradores;
    };

    return (
        <div className="colaboradores-sidebar-menu">
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder=""
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-bar"
                />
                <button className="filter-button" onClick={toggleFilterMenu}>
                    <FontAwesomeIcon icon={faFilter} />
                </button>

                {filterOpen && (
                    <div className="filter-menu">
                        <p>Ordenar por:</p>
                        <button onClick={() => handleSortChange('name-asc')}>Nombre A-Z</button>
                        <button onClick={() => handleSortChange('name-desc')}>Nombre Z-A</button>
                        <button onClick={() => handleSortChange('date-asc')}>Fecha Ascendente</button>
                        <button onClick={() => handleSortChange('date-desc')}>Fecha Descendente</button>
                    </div>
                )}
            </div>

            <ul>
                {sortedColaboradores()
                    .filter(colaborador =>
                        colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((colaborador) => (
                        <li key={colaborador.id} onClick={() => onColaboradorClick(colaborador.id)}>
                            {colaborador.nombre}
                        </li>
                    ))}
            </ul>

            {showForm && (
                <ColaboradorForm show={showForm} handleClose={handleFormClose} />
            )}

            <button onClick={handleAddClick} className="add-colaborador-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Colaborador
            </button>
        </div>
    );
};

export default Colaboradores;
