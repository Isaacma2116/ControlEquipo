import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFilter, faUser } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles/Colaboradores.module.css";
import ColaboradorForm from "./Forms/ColaboradorForm";

const Colaboradores = ({ onColaboradorClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradores, setColaboradores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const response = await axios.get("http://localhost:3550/api/colaboradores");
        setColaboradores(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchColaboradores();
  }, []);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const handleAddClick = () => setShowForm(true);

  const handleFormClose = () => setShowForm(false);

  const toggleFilterMenu = () => setFilterOpen(!filterOpen);

  const handleSortChange = (criteria) => {
    setSortOrder(criteria);
    setFilterOpen(false);
  };

  const getSortedColaboradores = () => {
    if (!Array.isArray(colaboradores)) {
      return [];
    }

    const sorted = [...colaboradores];
    if (sortOrder === "name-asc") return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortOrder === "name-desc") return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (sortOrder === "date-asc") return sorted.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    if (sortOrder === "date-desc") return sorted.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return sorted;
  };

  const filteredColaboradores = getSortedColaboradores().filter((colaborador) =>
    colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.colaboradoresContainer}>
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Buscar colaboradores..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchBar}
          />
          <button className={styles.filterButton} onClick={toggleFilterMenu}>
            <FontAwesomeIcon icon={faFilter} />
          </button>
          {filterOpen && (
            <div className={styles.filterMenu}>
              <p className={styles.filterTitle}>Ordenar por:</p>
              <button onClick={() => handleSortChange("name-asc")}>Nombre A-Z</button>
              <button onClick={() => handleSortChange("name-desc")}>Nombre Z-A</button>
              <button onClick={() => handleSortChange("date-asc")}>Fecha Ascendente</button>
              <button onClick={() => handleSortChange("date-desc")}>Fecha Descendente</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <p className={styles.loadingText}>Cargando colaboradores...</p>
        ) : filteredColaboradores.length > 0 ? (
          <ul className={styles.colaboradoresList}>
            {filteredColaboradores.map((colaborador) => (
              <li
                key={colaborador.id}
                onClick={() => onColaboradorClick && onColaboradorClick(colaborador.id)}
                className={styles.colaboradorItem}
              >
                <FontAwesomeIcon icon={faUser} className={styles.colaboradorIcon} />
                <span className={styles.colaboradorNombre}>{colaborador.nombre}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noDataText}>No hay colaboradores registrados.</p>
        )}
      </div>

      <div className={styles.footer}>
        <button onClick={handleAddClick} className={styles.addColaboradorButton}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Colaborador
        </button>
      </div>

      {showForm && <ColaboradorForm show={showForm} handleClose={handleFormClose} />}
    </div>
  );
};

export default Colaboradores;