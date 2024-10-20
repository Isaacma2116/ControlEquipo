import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Software.css'; // Asegúrate de que este archivo exista
import SoftwareForm from './Forms/SoftwareForm'; // Ajusta la ruta si es necesario

const Software = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [softwareList, setSoftwareList] = useState([]);
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

    useEffect(() => {
        const fetchSoftware = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/software'); // Ajusta la URL según tu API
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

    const handleSaveSoftware = (newSoftware) => {
        // Añade el nuevo software a la lista cuando se guarda en el formulario
        setSoftwareList([...softwareList, newSoftware]);
        setShowForm(false); // Cierra el formulario después de guardar
    };

    return (
        <div className="software-sidebar-menu">
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
                {softwareList
                    .filter(software =>
                        software.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((software, index) => (
                        <li key={index}>
                            {software.nombre} - Versión: {software.version} - Estado: {software.estado}
                        </li>
                    ))}
            </ul>

            {/* Mostrar el formulario si showForm es true */}
            {showForm && (
                <SoftwareForm onSave={handleSaveSoftware} onClose={handleFormClose} />
            )}

            <button onClick={handleAddClick} className="add-software-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Software
            </button>
        </div>
    );
};

export default Software;
