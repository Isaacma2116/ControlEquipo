// src/Components/DetailPanel/Infocompleta/Forms/GroupedNamesAnalysis.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './styles/GroupedNamesAnalysis.css'; // Asegúrate de crear este archivo para estilos específicos

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const GroupedNamesAnalysis = ({ group }) => {
  // Cálculos específicos para el grupo
  const totalSoftware = group.length;
  const totalLicenses = group.reduce((acc, software) => acc + (software.licencias ? software.licencias.length : 0), 0);
  const totalEquipments = group.reduce((acc, software) => acc + (software.equiposAsociados ? software.equiposAsociados.length : 0), 0);
  const totalMaxLicenses = group.reduce((acc, software) => acc + (software.maxDispositivos || 0), 0);

  // Nueva Métrica: Promedio de Licencias por Software
  const averageLicensesPerSoftware = totalSoftware ? (totalLicenses / totalSoftware).toFixed(2) : 0;

  // Nueva Métrica: Número de Licencias Caducadas
  const expiredLicenses = group.reduce((acc, software) => {
    if (software.licencias) {
      software.licencias.forEach((licencia) => {
        if (licencia.licenciaCaducada) acc += 1;
      });
    }
    return acc;
  }, 0);

  // Nueva Métrica: Número de Softwares con Licencias Compartidas
  const softwaresWithSharedLicenses = group.reduce((acc, software) => {
    if (software.licencias && software.licencias.some((licencia) => licencia.compartida)) {
      acc += 1;
    }
    return acc;
  }, 0);

  // Nueva Métrica: Distribución de Tipos de Licencias
  const licenseTypeCounts = group.reduce((acc, software) => {
    if (software.licencias) {
      software.licencias.forEach((licencia) => {
        const type = licencia.tipoLicencia || 'Desconocido';
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Nueva Métrica: Ratio de Licencias por Software
  const ratioLicensesPerSoftware = totalSoftware ? (totalLicenses / totalSoftware).toFixed(2) : 0;

  // Nueva Métrica: Número de Softwares con Equipos Asociados
  const softwaresWithEquipments = group.reduce((acc, software) => {
    if (software.equiposAsociados && software.equiposAsociados.length > 0) acc += 1;
    return acc;
  }, 0);

  // Estado para gestionar la visibilidad de las gráficas
  const [showCharts, setShowCharts] = useState(true);

  // Datos para el gráfico de barras: Licencias vs Equipos vs Máximo de Licencias
  const barData = {
    labels: ['Licencias', 'Equipos Asociados', 'Máximo de Licencias'],
    datasets: [
      {
        label: 'Cantidad',
        data: [totalLicenses, totalEquipments, totalMaxLicenses],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Licencias vs Equipos vs Máximo de Licencias',
      },
    },
  };

  // Datos para el gráfico de pastel: Estado de Licencias
  const licenseStatusCounts = group.reduce((acc, software) => {
    if (software.licencias) {
      software.licencias.forEach((licencia) => {
        const status = licencia.estadoRenovacion || 'Desconocido';
        acc[status] = (acc[status] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(licenseStatusCounts),
    datasets: [
      {
        label: 'Estado de Renovación de Licencias',
        data: Object.values(licenseStatusCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Estado de Renovación de Licencias',
      },
    },
  };

  // Datos para el gráfico de pastel: Distribución de Tipos de Licencias
  const licenseTypePieData = {
    labels: Object.keys(licenseTypeCounts),
    datasets: [
      {
        label: 'Tipos de Licencias',
        data: Object.values(licenseTypeCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const licenseTypePieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribución de Tipos de Licencias',
      },
    },
  };

  return (
    <div className="grouped-names-analysis">
      <h3>Análisis del Grupo: {group[0].nombre}</h3>
      <div className="analysis-statistics">
        <div className="stat-item">
          <strong>Total de Software:</strong> {totalSoftware}
        </div>
        <div className="stat-item">
          <strong>Total de Licencias:</strong> {totalLicenses}
        </div>
        <div className="stat-item">
          <strong>Total de Equipos Asociados:</strong> {totalEquipments}
        </div>
        <div className="stat-item">
          <strong>Total de Máximo de Licencias:</strong> {totalMaxLicenses}
        </div>
        <div className="stat-item">
          <strong>Promedio de Licencias por Software:</strong> {averageLicensesPerSoftware}
        </div>
        <div className="stat-item">
          <strong>Número de Licencias Caducadas:</strong> {expiredLicenses}
        </div>
        <div className="stat-item">
          <strong>Número de Softwares con Licencias Compartidas:</strong> {softwaresWithSharedLicenses}
        </div>
        <div className="stat-item">
          <strong>Ratio de Licencias por Software:</strong> {ratioLicensesPerSoftware}
        </div>
        <div className="stat-item">
          <strong>Número de Softwares con Equipos Asociados:</strong> {softwaresWithEquipments}
        </div>
      </div>

      {/* Botón para ocultar/mostrar las gráficas */}
      <button
        className="toggle-charts-button"
        onClick={() => setShowCharts((prev) => !prev)}
      >
        {showCharts ? 'Ocultar Gráficas' : 'Mostrar Gráficas'}
      </button>

      {showCharts && (
        <div className="analysis-charts">
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="chart-container">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="chart-container">
            <Pie data={licenseTypePieData} options={licenseTypePieOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

GroupedNamesAnalysis.propTypes = {
  group: PropTypes.arrayOf(
    PropTypes.shape({
      id_software: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      version: PropTypes.string,
      licencias: PropTypes.arrayOf(
        PropTypes.shape({
          id_licencia: PropTypes.number.isRequired,
          claveLicencia: PropTypes.string.isRequired,
          correoAsociado: PropTypes.string.isRequired,
          estadoRenovacion: PropTypes.string.isRequired,
          compartida: PropTypes.bool.isRequired,
          licenciaCaducada: PropTypes.bool.isRequired, // Asegúrate de que este campo exista en tus datos
          tipoLicencia: PropTypes.string, // Asegúrate de que este campo exista en tus datos
        })
      ),
      equiposAsociados: PropTypes.arrayOf(
        PropTypes.shape({
          id_equipos: PropTypes.number.isRequired,
          fechaAsignacion: PropTypes.string.isRequired,
          estado_asignacion: PropTypes.string.isRequired,
        })
      ),
      maxDispositivos: PropTypes.number, // Asegúrate de que este campo exista en tus datos
      // ... otros campos si es necesario ...
    })
  ).isRequired,
};

export default GroupedNamesAnalysis;
