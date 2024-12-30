import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faFilter, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './styles/Celulares.css';
import CelularForm from './Forms/CelularForm';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

const Celulares = ({ onCelularClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [celulares, setCelulares] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [colaboradorMap, setColaboradorMap] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3550/api';

    const fetchData = async (cancelToken) => {
        try {
            setIsLoading(true);
            const [celularesResponse, colaboradoresResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/celulares`, { cancelToken }),
                axios.get(`${API_BASE_URL}/colaboradores`, { cancelToken }),
            ]);
            setCelulares(celularesResponse.data);
            setColaboradores(colaboradoresResponse.data);
            const map = {};
            colaboradoresResponse.data.forEach(colaborador => {
                map[colaborador.id] = colaborador.nombre;
            });
            setColaboradorMap(map);
            setError(null);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else if (error.response) {
                setError(`Error ${error.response.status}: ${error.response.data.message || 'No se pudo cargar la lista de celulares.'}`);
            } else if (error.request) {
                setError('No se pudo conectar al servidor. Por favor, inténtelo de nuevo más tarde.');
            } else {
                setError('Ocurrió un error inesperado.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchData(source.token);
        return () => {
            source.cancel('Component unmounted, request canceled.');
        };
    }, [API_BASE_URL]);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Debounced search to improve performance
    const debouncedHandleChange = useMemo(
        () => debounce(handleChange, 300),
        []
    );

    useEffect(() => {
        return () => {
            debouncedHandleChange.cancel();
        };
    }, [debouncedHandleChange]);

    const handleAddClick = () => {
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
    };

    const toggleFilterMenu = () => {
        setFilterOpen(prev => !prev);
    };

    const handleSortChange = (criteria) => {
        setSortOrder(criteria);
        setFilterOpen(false);
    };

    const sortedCelulares = useMemo(() => {
        if (sortOrder === 'colaborador-asc') {
            return [...celulares].sort((a, b) => {
                const nombreA = colaboradorMap[a.idColaborador] || '';
                const nombreB = colaboradorMap[b.idColaborador] || '';
                return nombreA.localeCompare(nombreB);
            });
        } else if (sortOrder === 'colaborador-desc') {
            return [...celulares].sort((a, b) => {
                const nombreA = colaboradorMap[a.idColaborador] || '';
                const nombreB = colaboradorMap[b.idColaborador] || '';
                return nombreB.localeCompare(nombreA);
            });
        }
        return celulares;
    }, [celulares, sortOrder, colaboradorMap]);

    const filteredCelulares = useMemo(() => {
        return sortedCelulares.filter(celular => {
            const nombre = colaboradorMap[celular.idColaborador] || '';
            return nombre.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [sortedCelulares, searchTerm, colaboradorMap]);

    return (
        <div className="celulares-sidebar-menu">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por nombre del colaborador..."
                    onChange={debouncedHandleChange}
                    className="search-bar"
                    aria-label="Buscar celulares por nombre del colaborador"
                />
                <button
                    className="filter-button"
                    onClick={toggleFilterMenu}
                    aria-label="Abrir menú de filtros"
                >
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
                <div className="loading-spinner">
                    <FontAwesomeIcon icon={faSearch} spin /> Cargando...
                </div>
            ) : error ? (
                <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
                </div>
            ) : filteredCelulares.length === 0 ? (
                <div className="no-records-message">No hay celulares registrados.</div>
            ) : (
                <ul>
                    {filteredCelulares.map((celular) => {
                        const colaboradorNombre = colaboradorMap[celular.idColaborador] || '-';
                        return (
                            <li
                                key={celular.idmovil}
                                onClick={() => onCelularClick(celular.idmovil)}
                                className="celular-item"
                                tabIndex="0"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') onCelularClick(celular.idmovil);
                                }}
                                aria-label={`Celular ID ${celular.idmovil}, Colaborador ${colaboradorNombre}`}
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
                    refreshCelulares={fetchData}
                />
            )}

            <button onClick={handleAddClick} className="add-celular-button" aria-label="Agregar Celular">
                <FontAwesomeIcon icon={faPlus} /> Agregar Celular
            </button>
        </div>
    );
};

Celulares.propTypes = {
    onCelularClick: PropTypes.func.isRequired,
};

export default Celulares;
