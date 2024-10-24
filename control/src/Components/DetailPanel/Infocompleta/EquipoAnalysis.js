import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import './styles/EquipoAnalysis.css'; // Asegúrate de tener este archivo CSS para los estilos

// Registrar los componentes de ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
          if (equipo.tipoDispositivo === 'Laptop') {
            contadores.laptops++;
          } else if (equipo.tipoDispositivo === 'PC') {
            contadores.pcs++;
          }
        }
        return contadores;
      },
      { laptops: 0, pcs: 0 }
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

  const totalEquipos = equipos.length;
  const equiposPorEstado = contarEquiposPorEstado();
  const equiposPorTipo = contarEquiposPorTipo();

  // Datos para la gráfica de estado físico (Pie Chart)
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
      borderWidth: 1,
    }]
  };

  // Datos para la gráfica de tipo de dispositivo (Bar Chart)
  const tipoData = {
    labels: ['Laptops', 'PCs'],
    datasets: [{
      label: 'Tipo de Dispositivo',
      data: [equiposPorTipo.laptops, equiposPorTipo.pcs],
      backgroundColor: ['#3498db', '#9b59b6'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="equipo-analysis">
      <h1>Análisis del Inventario de Equipos</h1>
      
      {/* Filtro por estado físico */}
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

      {/* Mostrar equipos filtrados */}
      <h2>Equipos Filtrados</h2>
      <ul>
        {equiposFiltrados.map(equipo => (
          <li key={equipo.id}>{equipo.tipoDispositivo} - {equipo.estadoFisico}</li>
        ))}
      </ul>

      {/* Gráfica de Estado Físico */}
      <h2>Estado Físico de los Equipos</h2>
      <Pie data={estadoData} />

      {/* Gráfica de Tipo de Dispositivo */}
      <h2>Equipos por Tipo de Dispositivo</h2>
      <Bar data={tipoData} />
    </div>
  );
};

export default EquipoAnalysis;
