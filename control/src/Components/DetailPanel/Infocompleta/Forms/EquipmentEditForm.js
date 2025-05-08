// src/Components/DetailPanel/Infocompleta/Forms/EquipmentEditForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EquipmentEditForm.css'; // Crea este archivo para estilos personalizados

const EquipmentEditForm = ({ idSoftware, onClose, onSave }) => {
  const [software, setSoftware] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const response = await axios.get(`http://localhost:3550/api/software/${idSoftware}`);
        setSoftware(response.data);
        setEquipos(response.data.equiposAsociados || []);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener los detalles del software:', err);
        setError('Error al cargar los detalles del software.');
        setLoading(false);
      }
    };

    fetchSoftware();
  }, [idSoftware]);

  const handleChange = (index, field, value) => {
    const updatedEquipos = [...equipos];
    updatedEquipos[index][field] = value;
    setEquipos(updatedEquipos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Asumiendo que la API espera un objeto con los equipos actualizados
      const updatedSoftware = {
        ...software,
        equiposAsociados: equipos,
      };
      await axios.put(`http://localhost:3550/api/software/${idSoftware}`, updatedSoftware);
      setSaving(false);
      onSave(); // Actualiza la lista de software en el componente padre
      onClose(); // Cierra el modal
    } catch (err) {
      console.error('Error al actualizar los equipos asociados:', err);
      setError('Error al guardar los cambios.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando detalles de los equipos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="equipment-edit-form">
      <h2>Editar Equipos Asociados a {software.nombre}</h2>
      <form onSubmit={handleSubmit}>
        {equipos.map((equipo, index) => (
          <div key={equipo.id_equipos || index} className="equipo-form">
            <h3>Equipo {index + 1}</h3>
            <div className="form-group">
              <label htmlFor={`idEquipo-${index}`}>ID del Equipo:</label>
              <input
                type="text"
                id={`idEquipo-${index}`}
                value={equipo.id_equipos}
                onChange={(e) => handleChange(index, 'id_equipos', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`fechaAsignacion-${index}`}>Fecha de Asignación:</label>
              <input
                type="date"
                id={`fechaAsignacion-${index}`}
                value={equipo.fechaAsignacion}
                onChange={(e) => handleChange(index, 'fechaAsignacion', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`estadoAsignacion-${index}`}>Estado de Asignación:</label>
              <select
                id={`estadoAsignacion-${index}`}
                value={equipo.estado_asignacion || ''}
                onChange={(e) => handleChange(index, 'estado_asignacion', e.target.value)}
              >
                <option value="">Seleccione un estado</option>
                <option value="Asignado">Asignado</option>
                <option value="Desasignado">Desasignado</option>
              </select>
            </div>
            <hr />
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentEditForm;
