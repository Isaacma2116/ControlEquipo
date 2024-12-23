// src/Components/DetailPanel/Infocompleta/Forms/DataAnalysis.js

import React from 'react';
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
import './styles/DataAnalysis.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DataAnalysis = ({ softwareList }) => {
  // Calcular estadísticas sobre el uso de equipos
  const totalSoftware = softwareList.length;
  const totalAssignedEquipments = softwareList.reduce(
    (acc, s) => acc + (s.equiposAsociados ? s.equiposAsociados.length : 0),
    0
  );
  const totalUnassignedEquipments = softwareList.reduce(
    (acc, s) => acc + (s.maxDispositivos || 0) - (s.equiposAsociados ? s.equiposAsociados.length : 0),
    0
  );

  // Gráfica de barras: Equipos asignados vs no asignados
  const barDataEquipments = {
    labels: ['Equipos'],
    datasets: [
      {
        label: 'Asignados',
        data: [totalAssignedEquipments],
        backgroundColor: '#36A2EB',
      },
      {
        label: 'No Asignados',
        data: [totalUnassignedEquipments],
        backgroundColor: '#FF6384',
      },
    ],
  };

  // Gráfica de pastel: Software con equipos asignados vs no asignados
  const pieDataUsage = {
    labels: ['Con Equipos Asignados', 'Sin Equipos Asignados'],
    datasets: [
      {
        label: 'Uso de Software',
        data: [
          totalAssignedEquipments,
          totalUnassignedEquipments,
        ],
        backgroundColor: ['#4BC0C0', '#FFCE56'],
      },
    ],
  };

  // Opciones de las gráficas
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Equipos Asignados vs No Asignados',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Uso del Software',
      },
    },
  };

  return (
    <div className="data-analysis-container">
      <h3>Análisis de Uso de Software</h3>
      <div className="analysis-statistics">
        <div className="stat-item">
          <strong>Total de Software:</strong> {totalSoftware}
        </div>
        <div className="stat-item">
          <strong>Total de Equipos Asignados:</strong> {totalAssignedEquipments}
        </div>
        <div className="stat-item">
          <strong>Total de Equipos No Asignados:</strong> {totalUnassignedEquipments}
        </div>
      </div>
      <div className="analysis-charts">
        <div className="chart-wrapper">
          <Bar data={barDataEquipments} options={barOptions} />
        </div>
        <div className="chart-wrapper">
          <Pie data={pieDataUsage} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

DataAnalysis.propTypes = {
  softwareList: PropTypes.arrayOf(
    PropTypes.shape({
      id_software: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      maxDispositivos: PropTypes.number,
      equiposAsociados: PropTypes.arrayOf(
        PropTypes.shape({
          id_equipos: PropTypes.number.isRequired,
          fechaAsignacion: PropTypes.string,
          estado_asignacion: PropTypes.string,
        })
      ),
    })
  ).isRequired,
};

export default DataAnalysis;
