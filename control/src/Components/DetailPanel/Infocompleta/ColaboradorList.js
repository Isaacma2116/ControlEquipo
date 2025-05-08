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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3550/api/colaboradores');
        setColaboradores(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
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
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Colaboradores</h2>

        {/* Search and Filter Section */}
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={searchTerm}
              onChange={handleChange}
              className={styles.searchBar}
            />
          </div>

          <div className={styles.filterWrapper}>
            <button
              className={`${styles.filterButton} ${filterOpen ? styles.active : ''}`}
              onClick={toggleFilterMenu}
              aria-label="Filtrar colaboradores"
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Filtrar</span>
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className={styles.filterMenu}>
                <p className={styles.filterTitle}>Ordenar por:</p>
                <button
                  className={`${styles.filterOption} ${sortOrder === 'name-asc' ? styles.selected : ''}`}
                  onClick={() => handleSortChange('name-asc')}
                >
                  Nombre A-Z
                </button>
                <button
                  className={`${styles.filterOption} ${sortOrder === 'name-desc' ? styles.selected : ''}`}
                  onClick={() => handleSortChange('name-desc')}
                >
                  Nombre Z-A
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando colaboradores...</p>
        </div>
      ) : (
        /* Collaborators List */
        <div className={styles.content}>
          <ul className={styles.colaboradoresGrid}>
            {sortedColaboradores()
              .filter((colaborador) =>
                colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((colaborador) => (
                <li
                  key={colaborador.id}
                  className={styles.colaboradorCard}
                  onClick={() => onViewDetail(colaborador.id)}
                >
                  <div className={styles.cardImageContainer}>
                    <img
                      src={`http://localhost:3550/uploads/colaboradores/${colaborador.fotografia || 'default.png'}`}
                      alt={`Foto de ${colaborador.nombre || 'Colaborador'}`}
                      className={styles.colaboradorImage}
                      onError={(e) => {
                        e.target.src = 'http://localhost:3550/uploads/colaboradores/default.png';
                      }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.colaboradorName}>
                      {colaborador.nombre || 'No disponible'}
                    </h3>
                    <p className={styles.colaboradorArea}>
                      {colaborador.area || 'No disponible'}
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          {/* Empty State */}
          {sortedColaboradores().filter(colab =>
            colab.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className={styles.emptyState}>
              <p>No se encontraron colaboradores</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColaboradorList;