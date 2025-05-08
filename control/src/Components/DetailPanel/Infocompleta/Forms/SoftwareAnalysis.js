// src/Components/Forms/SoftwareAnalysis.js
import React, { useEffect, useState } from 'react';
// Importamos los componentes de Chart.js
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
// Importa 'Chart' para registrar los controllers si usas Chart.js 3+
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registramos los elementos para evitar errores de chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SoftwareAnalysis = ({ idSoftware, softwareList, onClose }) => {
  const [software, setSoftware] = useState(null);

  useEffect(() => {
    console.log('idSoftware recibido:', idSoftware);
    console.log('Lista de software:', softwareList);

    if (idSoftware && Array.isArray(softwareList)) {
      // Busca el software cuyo ID coincida
      const found = softwareList.find(
        (item) => item.id_software === idSoftware
      );
      console.log('Software encontrado:', found);
      setSoftware(found || null);
    }
  }, [idSoftware, softwareList]);

  if (!software) {
    return (
      <div style={styles.container}>
        <h2>Análisis de Software</h2>
        <p>No se encontró el software con el ID especificado.</p>
        <button onClick={onClose} style={styles.button}>
          Cerrar
        </button>
      </div>
    );
  }

  // =================================================
  // Cálculo de datos para las GRÁFICAS
  // =================================================

  // 1) Equipos en uso vs equipos sin uso
  let equiposEnUso = 0;
  let equiposSinUso = 0;
  if (Array.isArray(software.equiposAsociados)) {
    // Ajusta la condición según tu campo real
    equiposEnUso = software.equiposAsociados.filter(
      (eq) => eq.estado_asignacion?.toLowerCase() === 'activo'
    ).length;
    equiposSinUso = software.equiposAsociados.length - equiposEnUso;
  }

  // Datos para la gráfica de barras - Equipos en Uso vs Sin Uso
  const barData = {
    labels: ['Equipos en Uso', 'Equipos Sin Uso'],
    datasets: [
      {
        label: 'Cantidad de Equipos',
        data: [equiposEnUso, equiposSinUso],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false, // para que se adapte al contenedor
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Equipos en Uso vs Sin Uso',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        title: {
          display: true,
          text: 'Número de Equipos',
          font: {
            size: 14,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Estado de Equipos',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // 2) Licencias compartidas vs no compartidas
  let licenciasCompartidas = 0;
  let licenciasNoCompartidas = 0;
  if (Array.isArray(software.licencias)) {
    licenciasCompartidas = software.licencias.filter((lic) => lic.compartida)
      .length;
    licenciasNoCompartidas = software.licencias.length - licenciasCompartidas;
  }

  // Datos para la gráfica de dona - Licencias Compartidas vs No Compartidas
  const doughnutData = {
    labels: ['Compartidas', 'No Compartidas'],
    datasets: [
      {
        label: 'Licencias',
        data: [licenciasCompartidas, licenciasNoCompartidas],
        backgroundColor: ['#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Licencias Compartidas vs No Compartidas',
        font: {
          size: 18,
        },
      },
    },
  };

  // 3) Licencias Usadas vs Licencias Máximas
  const maxLicencias = software.maxDispositivos || 0;
  const licenciasUsadas = Array.isArray(software.licencias)
    ? software.licencias.length
    : 0;
  const licenciasDisponibles = maxLicencias - licenciasUsadas;

  // Evitar números negativos
  const licenciasDisponiblesAdjusted =
    licenciasDisponibles >= 0 ? licenciasDisponibles : 0;

  // Datos para la gráfica de pastel - Licencias Usadas vs Disponibles
  const pieData = {
    labels: ['Licencias Usadas', 'Licencias Disponibles'],
    datasets: [
      {
        label: 'Licencias',
        data: [licenciasUsadas, licenciasDisponiblesAdjusted],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Licencias Usadas vs Disponibles',
        font: {
          size: 18,
        },
      },
    },
  };

  // =================================================
  // Render del componente
  // =================================================
  return (
    <div style={styles.container}>
      <h2>Análisis de {software.nombre}</h2>

      {/* Gráfica de Barras: Equipos en Uso vs Sin Uso */}
      <div style={styles.chartContainer}>
        <Bar data={barData} options={barOptions} />
      </div>

      {/* Gráfica de Dona: Licencias Compartidas vs No Compartidas */}
      <div style={styles.chartContainer}>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      {/* Gráfica de Pastel: Licencias Usadas vs Disponibles */}
      <div style={styles.chartContainer}>
        <Pie data={pieData} options={pieOptions} />
      </div>

      {/* Información Adicional */}
      <div style={styles.infoContainer}>
        <p>
          <strong>Total de Equipos:</strong>{' '}
          {Array.isArray(software.equiposAsociados)
            ? software.equiposAsociados.length
            : 0}
        </p>
        <p>
          <strong>Total de Licencias:</strong>{' '}
          {Array.isArray(software.licencias) ? software.licencias.length : 0}
        </p>
        <p>
          <strong>Licencias Máximas:</strong> {maxLicencias}
        </p>
        <p>
          <strong>Licencias Disponibles:</strong> {licenciasDisponiblesAdjusted}
        </p>
      </div>

      <button onClick={onClose} style={styles.button}>
        Cerrar
      </button>
    </div>
  );
};

// =================================================
// Estilos en Línea para una Mejor Presentación
// =================================================
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  chartContainer: {
    width: '100%',
    height: '400px',
    marginBottom: '2rem',
  },
  infoContainer: {
    marginBottom: '2rem',
    fontSize: '1.1rem',
    lineHeight: '1.6',
  },
  button: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default SoftwareAnalysis;
