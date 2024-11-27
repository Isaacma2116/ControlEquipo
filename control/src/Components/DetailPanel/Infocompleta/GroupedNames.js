import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stringSimilarity from 'string-similarity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Bar, Pie } from 'react-chartjs-2';
import './styles/GroupedNames.css';

const GroupedNames = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedNames, setGroupedNames] = useState([]);
  const [sortOrder, setSortOrder] = useState(''); // Estado para manejar el ordenamiento
  const [selectedSoftwareDetails, setSelectedSoftwareDetails] = useState({});
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroupedSoftwareNames();
  }, []);

  const fetchGroupedSoftwareNames = async () => {
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      const softwareList = response.data;
      const grouped = groupSimilarNames(softwareList);
      setGroupedNames(grouped);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener nombres agrupados:', err);
      setError('Error al obtener nombres agrupados');
      setLoading(false);
    }
  };

  const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, '');

  const groupSimilarNames = (softwareList) => {
    const groups = [];
    softwareList.forEach((software) => {
      if (!software || !software.nombre) return;
      const normalized = normalizeName(software.nombre);

      let foundGroup = false;
      for (const group of groups) {
        const normalizedGroupName = normalizeName(group[0].nombre);
        if (stringSimilarity.compareTwoStrings(normalized, normalizedGroupName) > 0.8) {
          group.push(software);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        groups.push([software]);
      }
    });
    return groups;
  };

  const getSortedGroupedNames = () => {
    if (!groupedNames || groupedNames.length === 0) return [];
    const namesToSort = [...groupedNames];

    if (sortOrder === 'a-z') {
      return namesToSort.sort((a, b) => a[0].nombre.localeCompare(b[0].nombre));
    }
    if (sortOrder === 'z-a') {
      return namesToSort.sort((a, b) => b[0].nombre.localeCompare(a[0].nombre));
    }
    return namesToSort;
  };

  const filteredGroupedNames = getSortedGroupedNames().filter((group) =>
    group.some((item) => item.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSoftwareClick = async (software) => {
    if (selectedSoftwareDetails[software.id_software]) {
      setSelectedSoftwareDetails((prevDetails) => {
        const updatedDetails = { ...prevDetails };
        delete updatedDetails[software.id_software];
        return updatedDetails;
      });
    } else {
      try {
        const response = await axios.get(`http://localhost:3550/api/software/${software.id_software}`);
        setSelectedSoftwareDetails((prevDetails) => ({
          ...prevDetails,
          [software.id_software]: response.data,
        }));
      } catch (err) {
        console.error('Error al obtener detalles del software:', err);
      }
    }
  };

  const renderAnalysisCharts = (group) => {
    const activeLicenses = group.filter((s) => s.estado === 'activo').length;
    const expiredLicenses = group.filter((s) => s.licenciaCaducada).length;
    const licensesInUse = group.reduce((sum, s) => sum + (s.softwareEquipos ? s.softwareEquipos.length : 0), 0);
    const maxLicenses = group.reduce((sum, s) => sum + (s.maxDispositivos || 0), 0);
    const licensesNotInUse = maxLicenses - licensesInUse;

    const pieData = {
      labels: ['Activas', 'Caducadas'],
      datasets: [
        {
          data: [activeLicenses, expiredLicenses],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };

    const barData = {
      labels: ['En uso', 'Sin uso'],
      datasets: [
        {
          label: 'Licencias',
          data: [licensesInUse, licensesNotInUse],
          backgroundColor: ['#4BC0C0', '#FF9F40'],
        },
      ],
    };

    return (
      <div className="analysis-charts">
        <div className="chart-container">
          <h5>Distribución de Licencias</h5>
          <Pie data={pieData} />
        </div>
        <div className="chart-container">
          <h5>Licencias en Uso vs Sin Uso</h5>
          <Bar data={barData} />
        </div>
      </div>
    );
  };

  if (loading) {
    return <p>Cargando nombres agrupados...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="grouped-names">
      {/* Barra de búsqueda y filtro */}
      <div className="search-bar">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar en nombres agrupados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="">Ordenar...</option>
          <option value="a-z">A - Z</option>
          <option value="z-a">Z - A</option>
        </select>
      </div>

      {/* Listado de nombres agrupados */}
      <h2>Nombres Agrupados</h2>
      {filteredGroupedNames.length === 0 ? (
        <p>No hay nombres agrupados disponibles.</p>
      ) : (
        filteredGroupedNames.map((group, index) => (
          <div key={`group-${index}`} className="group">
            <h4>{group[0].nombre}</h4>
            {group.map((software) => (
              <div key={software.id_software} className="individual-software">
                <p onClick={() => handleSoftwareClick(software)} style={{ cursor: 'pointer' }}>
                  {software.nombre} - {software.version || 'Versión no especificada'}
                </p>
                {selectedSoftwareDetails[software.id_software] && (
                  <div className="software-details">
                    <h5>Detalles del Software</h5>
                    <p><strong>Nombre:</strong> {selectedSoftwareDetails[software.id_software].nombre}</p>
                    <p><strong>Versión:</strong> {selectedSoftwareDetails[software.id_software].version || 'N/A'}</p>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => setSelectedAnalysis(selectedAnalysis === index ? null : index)}>
              {selectedAnalysis === index ? 'Ocultar Análisis' : 'Ver Análisis'}
            </button>
            {selectedAnalysis === index && renderAnalysisCharts(group)}
          </div>
        ))
      )}
    </div>
  );
};

export default GroupedNames;
