import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Software.css';
import { Link } from 'react-router-dom';

const Software = ({ onSoftwareClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [softwareList, setSoftwareList] = useState([]); // Inicializar como array vacío

    useEffect(() => {
        const fetchSoftware = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/software');
                console.log(response.data); // Añadir esto para verificar la respuesta de la API
                setSoftwareList(Array.isArray(response.data) ? response.data : []); // Verifica que sea un array
            } catch (error) {
                console.error('Error fetching data:', error);
                setSoftwareList([]); // En caso de error, mantener un array vacío
            }
        };

        fetchSoftware();
    }, []);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="software-sidebar-menu">
            <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar software..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-bar"
                />
            </div>
            <ul>
                {softwareList
                    .filter(software =>
                        software.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((software, index) => (
                        <li key={index} onClick={() => onSoftwareClick(software.id_software)}>
                            {software.nombre} - {software.version}
                        </li>
                    ))}
            </ul>

            {/* Enlace para agregar software en lugar de botón */}
            <Link to="/agregar-software" className="add-software-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Software
            </Link>
        </div>
    );
};

export default Software;
