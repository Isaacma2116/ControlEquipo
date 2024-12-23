import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title } from 'chart.js';
import './styles/EquipoAnalysis.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title);

const EquipoAnalysis = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroGarantia, setFiltroGarantia] = useState("todos");

  const [showEstadoFisico, setShowEstadoFisico] = useState(true);
  const [showFechaCompra, setShowFechaCompra] = useState(true);
  const [showGarantia, setShowGarantia] = useState(true);
  const [showAsignacion, setShowAsignacion] = useState(true);

  // Refs para las gráficas
  const estadoRef = useRef(null);
  const fechaCompraRef = useRef(null);
  const garantiaRef = useRef(null);
  const asignacionRef = useRef(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3550/api/equipos');
        setEquipos(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los equipos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  const contarEquiposPorEstado = () => {
    return equipos.reduce((contadores, equipo) => {
      if (equipo.estadoFisico) {
        switch (equipo.estadoFisico) {
          case 'Excelente (nuevo) y garantía':
            contadores.excelente++;
            break;
          case 'Bueno (Pérdida de garantía y raspones)':
            contadores.bueno++;
            break;
          case 'Regular (Golpes, Rayones grandes)':
            contadores.regular++;
            break;
          case 'Malo (Cambio de piezas y pérdidas)':
            contadores.malo++;
            break;
          case 'Urgente (No funciona correctamente)':
            contadores.urgente++;
            break;
          default:
            break;
        }
      }
      return contadores;
    }, { excelente: 0, bueno: 0, regular: 0, malo: 0, urgente: 0 });
  };

  const contarEquiposPorTipo = () => {
    return equipos.reduce((contadores, equipo) => {
      if (equipo.tipoDispositivo) {
        contadores[equipo.tipoDispositivo] = (contadores[equipo.tipoDispositivo] || 0) + 1;
      }
      return contadores;
    }, {});
  };

  const contarEquiposPorFechaCompra = () => {
    return equipos.reduce((contadores, equipo) => {
      if (equipo.fechaCompra) {
        const year = new Date(equipo.fechaCompra).getFullYear();
        contadores[year] = (contadores[year] || 0) + 1;
      }
      return contadores;
    }, {});
  };

  const contarEquiposPorEstadoGarantia = () => {
    return equipos.reduce((contadores, equipo) => {
      if (equipo.garantia) {
        const today = new Date();
        const garantiaDate = new Date(equipo.garantia);
        if (garantiaDate > today) {
          contadores.activos++;
        } else {
          contadores.vencidos++;
        }
      } else {
        contadores.vencidos++;
      }
      return contadores;
    }, { activos: 0, vencidos: 0 });
  };

  const contarEquiposAsignados = () => {
    return equipos.reduce((contadores, equipo) => {
      if (equipo.idColaborador) {
        contadores.asignados++;
      } else {
        contadores.noAsignados++;
      }
      return contadores;
    }, { asignados: 0, noAsignados: 0 });
  };

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(equipo => {
      const estadoMatch = filtroEstado === "todos" || equipo.estadoFisico === filtroEstado;
      const tipoMatch = filtroTipo === "todos" || equipo.tipoDispositivo === filtroTipo;
      const garantiaMatch = filtroGarantia === "todos" ||
        (filtroGarantia === "activos" && new Date(equipo.garantia) > new Date()) ||
        (filtroGarantia === "vencidos" && new Date(equipo.garantia) <= new Date());

      return estadoMatch && tipoMatch && garantiaMatch;
    });
  }, [equipos, filtroEstado, filtroTipo, filtroGarantia]);

  const handleFilterChange = (filtro, valor) => {
    switch (filtro) {
      case 'estado':
        setFiltroEstado(valor);
        break;
      case 'tipo':
        setFiltroTipo(valor);
        break;
      case 'garantia':
        setFiltroGarantia(valor);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="spinner">
        <div className="loader"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const equiposPorEstado = contarEquiposPorEstado();
  const equiposPorTipo = contarEquiposPorTipo();
  const equiposPorFechaCompra = contarEquiposPorFechaCompra();
  const equiposPorGarantia = contarEquiposPorEstadoGarantia();
  const equiposPorAsignacion = contarEquiposAsignados();

  const estadoData = {
    labels: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Urgente'],
    datasets: [{
      label: 'Estado Físico',
      data: [
        equiposPorEstado.excelente,
        equiposPorEstado.bueno,
        equiposPorEstado.regular,
        equiposPorEstado.malo,
        equiposPorEstado.urgente,
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336', '#E91E63'],
      hoverOffset: 10,
    }]
  };

  const fechaCompraData = {
    labels: Object.keys(equiposPorFechaCompra),
    datasets: [{
      label: 'Equipos por Año de Compra',
      data: Object.values(equiposPorFechaCompra),
      backgroundColor: ['#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#e74c3c'],
      borderWidth: 1,
    }]
  };

  const garantiaData = {
    labels: ['Garantía Activa', 'Garantía Vencida'],
    datasets: [{
      label: 'Estado de Garantía',
      data: [equiposPorGarantia.activos, equiposPorGarantia.vencidos],
      backgroundColor: ['#2ecc71', '#e74c3c'],
      hoverOffset: 10,
    }]
  };

  const asignacionData = {
    labels: ['Asignados', 'No Asignados'],
    datasets: [{
      label: 'Estado de Asignación',
      data: [equiposPorAsignacion.asignados, equiposPorAsignacion.noAsignados],
      backgroundColor: ['#3498db', '#e74c3c'],
      hoverOffset: 10,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const exportChart = (chartRef, filename) => {
    const link = document.createElement('a');
    link.href = chartRef.current.toBase64Image();
    link.download = `${filename}.png`;
    link.click();
  };

  return (
    <div className="equipo-analysis">
      <h1>Análisis del Inventario de Equipos</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Filtrar por estado físico:</label>
          <select value={filtroEstado} onChange={(e) => handleFilterChange('estado', e.target.value)}>
            <option value="todos">Todos</option>
            <option value="Excelente (nuevo) y garantía">Excelente</option>
            <option value="Bueno (Pérdida de garantía y raspones)">Bueno</option>
            <option value="Regular (Golpes, Rayones grandes)">Regular</option>
            <option value="Malo (Cambio de piezas y pérdidas)">Malo</option>
            <option value="Urgente (No funciona correctamente)">Urgente</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filtrar por tipo de dispositivo:</label>
          <select value={filtroTipo} onChange={(e) => handleFilterChange('tipo', e.target.value)}>
            <option value="todos">Todos</option>
            {Object.keys(equiposPorTipo).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filtrar por estado de garantía:</label>
          <select value={filtroGarantia} onChange={(e) => handleFilterChange('garantia', e.target.value)}>
            <option value="todos">Todos</option>
            <option value="activos">Garantía Activa</option>
            <option value="vencidos">Garantía Vencida</option>
          </select>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-item">
          <div className="chart-header">
            <h2>Estado Físico de los Equipos</h2>
            <button onClick={() => setShowEstadoFisico(!showEstadoFisico)}>
              {showEstadoFisico ? 'Ocultar' : 'Mostrar'}
            </button>
            <button onClick={() => exportChart(estadoRef, 'Estado_Fisico')} className="export-btn">
              Exportar
            </button>
          </div>
          {showEstadoFisico && (
            <div className="chart-container">
              <Pie data={estadoData} options={options} ref={estadoRef} />
            </div>
          )}
        </div>

        <div className="chart-item">
          <div className="chart-header">
            <h2>Distribución por Año de Compra</h2>
            <button onClick={() => setShowFechaCompra(!showFechaCompra)}>
              {showFechaCompra ? 'Ocultar' : 'Mostrar'}
            </button>
            <button onClick={() => exportChart(fechaCompraRef, 'Año_Compra')} className="export-btn">
              Exportar
            </button>
          </div>
          {showFechaCompra && (
            <div className="chart-container">
              <Bar data={fechaCompraData} options={options} ref={fechaCompraRef} />
            </div>
          )}
        </div>

        <div className="chart-item">
          <div className="chart-header">
            <h2>Estado de Garantía</h2>
            <button onClick={() => setShowGarantia(!showGarantia)}>
              {showGarantia ? 'Ocultar' : 'Mostrar'}
            </button>
            <button onClick={() => exportChart(garantiaRef, 'Estado_Garantia')} className="export-btn">
              Exportar
            </button>
          </div>
          {showGarantia && (
            <div className="chart-container">
              <Pie data={garantiaData} options={options} ref={garantiaRef} />
            </div>
          )}
        </div>

        <div className="chart-item">
          <div className="chart-header">
            <h2>Estado de Asignación</h2>
            <button onClick={() => setShowAsignacion(!showAsignacion)}>
              {showAsignacion ? 'Ocultar' : 'Mostrar'}
            </button>
            <button onClick={() => exportChart(asignacionRef, 'Estado_Asignacion')} className="export-btn">
              Exportar
            </button>
          </div>
          {showAsignacion && (
            <div className="chart-container">
              <Pie data={asignacionData} options={options} ref={asignacionRef} />
            </div>
          )}
        </div>
      </div>

      <div className="data-table">
        <h2>Detalle de Equipos</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Estado Físico</th>
              <th>Fecha de Compra</th>
              <th>Garantía</th>
              <th>Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.map(equipo => (
              <tr key={equipo.id}>
                <td>{equipo.id}</td>
                <td>{equipo.tipoDispositivo}</td>
                <td>{equipo.estadoFisico}</td>
                <td>{new Date(equipo.fechaCompra).toLocaleDateString()}</td>
                <td>{equipo.garantia ? new Date(equipo.garantia).toLocaleDateString() : 'Sin Garantía'}</td>
                <td>{equipo.idColaborador ? equipo.idColaborador : 'No Asignado'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipoAnalysis;
