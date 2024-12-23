import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import styles from './styles/ColaboradorList.module.css';

const ColaboradorList = ({ onViewDetail }) => {
  const [colaboradores, setColaboradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('');

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

  const toggleFilterMenu = () => {
    setFilterOpen(!filterOpen);
  };

  const handleSortChange = (criteria) => {
    setSortOrder(criteria);
    setFilterOpen(false);
  };

  const sortedColaboradores = () => {
    if (!Array.isArray(colaboradores)) return [];

    if (sortOrder === 'name-asc') {
      return [...colaboradores].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortOrder === 'name-desc') {
      return [...colaboradores].sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    return colaboradores;
  };

  return (
    <div className={styles.colaboradorList}>
      <h2>Lista de Colaboradores</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={handleChange}
          className={styles.searchBar}
        />
        <button className={styles.filterButton} onClick={toggleFilterMenu}>
          <FontAwesomeIcon icon={faFilter} />
        </button>

        {filterOpen && (
          <div className={styles.filterMenu}>
            <p>Ordenar por:</p>
            <button onClick={() => handleSortChange('name-asc')}>Nombre A-Z</button>
            <button onClick={() => handleSortChange('name-desc')}>Nombre Z-A</button>
          </div>
        )}
      </div>

      <ul className={styles.colaboradoresList}>
        {sortedColaboradores()
          .filter((colaborador) =>
            colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((colaborador) => (
            <li key={colaborador.id} onClick={() => onViewDetail(colaborador.id)}>
              <img
                src={`http://localhost:3550/uploads/colaboradores/${colaborador.fotografia || 'default.png'}`}
                alt={`Foto de ${colaborador.nombre || 'Colaborador'}`}
              />
              <p>
                <strong>{colaborador.nombre || 'No disponible'}</strong>
              </p>
              <p>{colaborador.area || 'No disponible'}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ColaboradorList;
