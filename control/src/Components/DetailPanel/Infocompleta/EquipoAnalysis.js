import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement } from 'chart.js';
import './styles/EquipoAnalysis.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement);

const EquipoAnalysis = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

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
    return equipos.reduce(
      (contadores, equipo) => {
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
      },
      { excelente: 0, bueno: 0, regular: 0, malo: 0, urgente: 0 }
    );
  };

  const contarEquiposPorTipo = () => {
    return equipos.reduce(
      (contadores, equipo) => {
        if (equipo.tipoDispositivo) {
          contadores[equipo.tipoDispositivo] = (contadores[equipo.tipoDispositivo] || 0) + 1;
        }
        return contadores;
      },
      {}
    );
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
    return equipos.reduce(
      (contadores, equipo) => {
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
      },
      { activos: 0, vencidos: 0 }
    );
  };

  const contarEquiposAsignados = () => {
    return equipos.reduce(
      (contadores, equipo) => {
        if (equipo.idColaborador) {
          contadores.asignados++;
        } else {
          contadores.noAsignados++;
        }
        return contadores;
      },
      { asignados: 0, noAsignados: 0 }
    );
  };

  const handleFilterChange = (estado) => {
    setFiltroEstado(estado);
  };

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(equipo => {
      if (filtroEstado === "todos") return true;
      return equipo.estadoFisico === filtroEstado;
    });
  }, [equipos, filtroEstado]);

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
      <div>
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

  // Datos para gráficas
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
    }]
  };

  const fechaCompraData = {
    labels: Object.keys(equiposPorFechaCompra),
    datasets: [{
      label: 'Equipos por Año de Compra',
      data: Object.values(equiposPorFechaCompra),
      backgroundColor: ['#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#e74c3c'],
    }]
  };

  const garantiaData = {
    labels: ['Garantía Activa', 'Garantía Vencida'],
    datasets: [{
      label: 'Estado de Garantía',
      data: [equiposPorGarantia.activos, equiposPorGarantia.vencidos],
      backgroundColor: ['#2ecc71', '#e74c3c'],
    }]
  };

  const asignacionData = {
    labels: ['Asignados', 'No Asignados'],
    datasets: [{
      label: 'Estado de Asignación',
      data: [equiposPorAsignacion.asignados, equiposPorAsignacion.noAsignados],
      backgroundColor: ['#3498db', '#e74c3c'],
    }]
  };

  return (
    <div className="equipo-analysis">
      <h1>Análisis del Inventario de Equipos</h1>

      <div>
        <label>Filtrar por estado físico:</label>
        <select value={filtroEstado} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="Excelente (nuevo) y garantía">Excelente</option>
          <option value="Bueno (Pérdida de garantía y raspones)">Bueno</option>
          <option value="Regular (Golpes, Rayones grandes)">Regular</option>
          <option value="Malo (Cambio de piezas y pérdidas)">Malo</option>
          <option value="Urgente (No funciona correctamente)">Urgente</option>
        </select>
      </div>

      <h2>Equipos Filtrados</h2>
      <ul>
        {equiposFiltrados.map(equipo => (
          <li key={equipo.id_equipos}>
            {equipo.tipoDispositivo} ({equipo.marca}) - {equipo.estadoFisico}
          </li>
        ))}
      </ul>

      <h2>Estado Físico de los Equipos</h2>
      <Pie data={estadoData} />

      <h2>Distribución por Año de Compra</h2>
      <Bar data={fechaCompraData} />

      <h2>Estado de Garantía</h2>
      <Pie data={garantiaData} />

      <h2>Estado de Asignación</h2>
      <Pie data={asignacionData} />
    </div>
  );
};

export default EquipoAnalysis;
