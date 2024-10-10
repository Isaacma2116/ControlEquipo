import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Colaboradores.css';
import ColaboradorForm from './Forms/ColaboradorForm'; // Ajusta la ruta de importación si es necesario

const Colaboradores = ({ onColaboradorClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [colaboradores, setColaboradores] = useState([]);
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

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
        console.log('Botón "Agregar Colaborador" fue clickeado'); // Debugging
        setShowForm(true); // Muestra el formulario cuando se hace clic
    };

    const handleFormClose = () => {
        setShowForm(false); // Cierra el formulario
    };

    return (
        <div className="colaboradores-sidebar-menu">
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-bar"
                />

            </div>
            <ul>
                {colaboradores
                    .filter(colaborador =>
                        colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((colaborador, index) => (
                        <li key={index} onClick={() => onColaboradorClick(colaborador.id)}>
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
