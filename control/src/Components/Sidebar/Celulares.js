import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './styles/Celulares.css';
import CelularForm from './Forms/CelularForm';

const Celulares = ({ onCelularClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [celulares, setCelulares] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Definir la función para obtener celulares y colaboradores
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [celularesResponse, colaboradoresResponse] = await Promise.all([
                axios.get('http://localhost:3550/api/celulares'),
                axios.get('http://localhost:3550/api/colaboradores'),
            ]);
            setCelulares(celularesResponse.data);
            setColaboradores(colaboradoresResponse.data);
            setError(null); // Reiniciar errores en caso de éxito
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('No se pudo cargar la lista de celulares.');
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener celulares y colaboradores desde el backend al montar el componente
    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddClick = () => {
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
    };

    const toggleFilterMenu = () => {
        setFilterOpen(!filterOpen);
    };

    const handleSortChange = (criteria) => {
        setSortOrder(criteria);
        setFilterOpen(false);
    };

    const sortedCelulares = () => {
        if (sortOrder === 'colaborador-asc') {
            return [...celulares].sort((a, b) => {
                const colaboradorA = colaboradores.find(c => c.id === a.idColaborador)?.nombre || '';
                const colaboradorB = colaboradores.find(c => c.id === b.idColaborador)?.nombre || '';
                return colaboradorA.localeCompare(colaboradorB);
            });
        } else if (sortOrder === 'colaborador-desc') {
            return [...celulares].sort((a, b) => {
                const colaboradorA = colaboradores.find(c => c.id === a.idColaborador)?.nombre || '';
                const colaboradorB = colaboradores.find(c => c.id === b.idColaborador)?.nombre || '';
                return colaboradorB.localeCompare(colaboradorA);
            });
        }
        return celulares;
    };

    const filteredCelulares = sortedCelulares().filter(celular => {
        const colaboradorNombre = colaboradores.find(c => c.id === celular.idColaborador)?.nombre || '';
        return colaboradorNombre.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="celulares-sidebar-menu">
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar por nombre del colaborador..."
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
                        <button onClick={() => handleSortChange('colaborador-asc')}>Colaborador A-Z</button>
                        <button onClick={() => handleSortChange('colaborador-desc')}>Colaborador Z-A</button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="loading-spinner">Cargando...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : filteredCelulares.length === 0 ? (
                <div className="no-records-message">No hay celulares registrados.</div>
            ) : (
                <ul>
                    {filteredCelulares.map((celular) => {
                        const colaboradorNombre = colaboradores.find(c => c.id === celular.idColaborador)?.nombre || '-';
                        return (
                            <li
                                key={celular.idmovil}
                                onClick={() => onCelularClick(celular.idmovil)}
                                className="celular-item"
                            >
                                <strong>ID:</strong> {celular.idmovil} - {colaboradorNombre}
                            </li>
                        );
                    })}
                </ul>
            )}

            {showForm && (
                <CelularForm
                    show={showForm}
                    handleClose={handleFormClose}
                    refreshCelulares={fetchData} // Pasar la función para refrescar
                />
            )}

            <button onClick={handleAddClick} className="add-celular-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Celular
            </button>
        </div>
    );
};

export default Celulares;
