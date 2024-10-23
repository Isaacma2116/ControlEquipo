import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Software.css'; // Asegúrate de que este archivo exista
import SoftwareForm from './Forms/SoftwareForm'; // Ajusta la ruta si es necesario

const Software = ({ onSoftwareClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [softwareList, setSoftwareList] = useState([]);
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

    useEffect(() => {
        const fetchSoftware = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/software');
                setSoftwareList(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchSoftware();
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

            {/* Mostrar el formulario si showForm es true */}
            {showForm && (
                <SoftwareForm onSave={() => { /* Aquí puedes agregar lógica para guardar */ }} onClose={handleFormClose} />
            )}

            <button onClick={handleAddClick} className="add-software-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Software
            </button>
        </div>
    );
};

export default Software;
