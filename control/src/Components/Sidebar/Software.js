import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/Software.css'; // Asegúrate de crear este archivo CSS si aún no lo tienes
import SoftwareForm from './Forms/SoftwareForm'; // Ajusta la ruta de importación si es necesario

const Software = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true); // Estado para controlar la carga de datos
    const [error, setError] = useState(null); // Estado para manejar errores
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

    // Efecto para obtener la lista de software desde el servidor
    useEffect(() => {
        const fetchSoftware = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/software'); // Reemplaza con tu API
                if (Array.isArray(response.data)) {
                    setSoftwareList(response.data); // Asegúrate de que sea un array
                } else {
                    setSoftwareList([]); // En caso de una respuesta inesperada
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al obtener los datos de software.');
            } finally {
                setLoading(false); // Termina la carga, sea éxito o error
            }
        };

        fetchSoftware();
    }, []);

    // Maneja el cambio en el campo de búsqueda
    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Muestra el formulario para agregar nuevo software
    const handleAddClick = () => {
        setShowForm(true); // Muestra el formulario cuando se hace clic
    };

    // Cierra el formulario
    const handleFormClose = () => {
        setShowForm(false); // Cierra el formulario
    };

    // Agrega el nuevo software a la lista cuando se guarda
    const handleSoftwareSave = (software) => {
        setSoftwareList([...softwareList, software]); // Agrega el nuevo software a la lista
        setShowForm(false); // Cierra el formulario después de guardar
    };

    // Filtra la lista de software en función del término de búsqueda
    const filteredSoftwareList = softwareList.filter(software =>
        software.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            {/* Mostrar loading o error en caso de que exista */}
            {loading && <p>Cargando software...</p>}
            {error && <p>{error}</p>}

            {/* Lista de software filtrada */}
            {!loading && !error && (
                <ul>
                    {filteredSoftwareList.length > 0 ? (
                        filteredSoftwareList.map((software, index) => (
                            <li key={index}>
                                {software.nombre} - Versión: {software.version} - Estado: {software.estado}
                            </li>
                        ))
                    ) : (
                        <p>No se encontraron softwares.</p> // Mostrar mensaje si no hay coincidencias
                    )}
                </ul>
            )}

            {/* Mostrar formulario para agregar software */}
            {showForm && (
                <SoftwareForm show={showForm} onSave={handleSoftwareSave} onClose={handleFormClose} />
            )}

            {/* Botón para agregar nuevo software */}
            <button onClick={handleAddClick} className="add-software-button">
                <FontAwesomeIcon icon={faPlus} /> Agregar Software
            </button>
        </div>
    );
};

export default Software;
