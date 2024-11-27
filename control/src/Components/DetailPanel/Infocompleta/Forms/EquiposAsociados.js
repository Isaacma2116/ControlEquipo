import React from 'react';
import '../styles/EquiposAsociados.css';

const EquiposAsociados = ({ equipos, showModal, setShowModal, onEquipoClick }) => {
  // Asegúrate de que `onEquipoClick` se esté pasando correctamente.
  console.log("onEquipoClick in EquiposAsociados:", onEquipoClick); // Verifica si onEquipoClick se está pasando correctamente

  if (!showModal) return null; // No mostrar nada si no se debe mostrar el modal.

  // Función para manejar clic en equipo específico
  const handleVerInformacionCompleta = (idEquipo) => {
    if (typeof onEquipoClick === 'function') {
      onEquipoClick(idEquipo); // Llamar a la función para manejar el clic del equipo.
      setShowModal(false); // Cerrar modal después de hacer clic
    } else {
      console.error("onEquipoClick no está definido o no es una función");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Equipos Asociados</h2>
          <button onClick={() => setShowModal(false)} className="close-modal-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {equipos && equipos.length > 0 ? (
            <div className="equipos-grid">
              {equipos.map((equipo) => (
                <div key={equipo.id_equipos} className="equipo-info">
                  {equipo.imagen ? (
                    <img
                      src={`http://localhost:3550/uploads/equipos/${equipo.imagen}`}
                      alt={`Equipo ${equipo.nombre || equipo.tipoDispositivo}`}
                      className="equipo-img"
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <p>Sin Imagen</p>
                    </div>
                  )}
                  <p><strong>ID:</strong> {equipo.id_equipos}</p>
                  <p><strong>Tipo:</strong> {equipo.tipoDispositivo || 'N/A'}</p>
                  <p><strong>Marca:</strong> {equipo.marca || 'Sin especificar'}</p>
                  <p><strong>Modelo:</strong> {equipo.modelo || 'Sin especificar'}</p>
                  {/* Botón para ver la información completa del equipo */}
                  <button
                    className="view-full-info-btn"
                    onClick={() => handleVerInformacionCompleta(equipo.id_equipos)}
                  >
                    Ver Información Completa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay equipos asociados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquiposAsociados;
