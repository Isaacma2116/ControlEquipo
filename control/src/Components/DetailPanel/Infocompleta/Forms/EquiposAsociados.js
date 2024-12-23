import React from 'react';
import PropTypes from 'prop-types';
import './styles/EquiposAsociados.css';

const EquiposAsociados = ({ equipos = [], showModal, setShowModal }) => {
  if (!equipos || equipos.length === 0) {
    return <p>No hay equipos asociados.</p>;
  }

  return (
    <div className="equipos-asociados">
      <h2>Equipos Asociados</h2>
      {equipos.map((equipo) => (
        <div
          key={equipo.id_equipos} // Asegurado como número
          className="equipo-item"
          onClick={() => console.log(`Equipo seleccionado: ${equipo.id_equipos}`)}
          style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}
        >
          <p><strong>ID:</strong> {equipo.id_equipos}</p>
          <p><strong>Tipo:</strong> {equipo.tipoDispositivo}</p>
          <p><strong>Marca:</strong> {equipo.marca}</p>
          <p><strong>Modelo:</strong> {equipo.modelo}</p>
        </div>
      ))}

      {/* Botón para cerrar modal si se usa */}
      {showModal && (
        <button onClick={() => setShowModal(false)} style={{ marginTop: '10px' }}>
          Cerrar
        </button>
      )}
    </div>
  );
};

EquiposAsociados.propTypes = {
  equipos: PropTypes.arrayOf(
    PropTypes.shape({
      id_equipos: PropTypes.number.isRequired,
      tipoDispositivo: PropTypes.string.isRequired,
      marca: PropTypes.string.isRequired,
      modelo: PropTypes.string.isRequired,
    })
  ).isRequired,
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
};

export default EquiposAsociados;
