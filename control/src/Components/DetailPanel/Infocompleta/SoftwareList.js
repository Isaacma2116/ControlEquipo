import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareList.css';
import Modal from 'react-modal';
import SoftwareForm from './Forms/SoftwareForm';

const SoftwareList = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSoftwareId, setEditSoftwareId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchSoftware();
  }, []);

  const fetchSoftware = async () => {
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      setSoftwareList(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Error al cargar la lista de software'); // Convertir a cadena
      setLoading(false);
    }
  };

  const handleEditClick = (software) => {
    setEditSoftwareId(software.id_software);
    setModalIsOpen(true);
  };

  const handleAddNewSoftware = () => {
    setEditSoftwareId(null);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    fetchSoftware();
  };

  const handleDeleteClick = async (id_software) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este software?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3550/api/software/${id_software}`);
        fetchSoftware();
      } catch (error) {
        console.error('Error al eliminar el software:', error);
      }
    }
  };

  if (loading) {
    return <div>Cargando software...</div>;
  }

  if (error) {
    return <div>{error}</div>; // Asegúrate de que error es una cadena
  }

  return (
    <div className="software-list-container">
      <h1>Lista de Software</h1>
      <button className="add-software-button" onClick={handleAddNewSoftware}>
        Agregar Nuevo Software
      </button>
      {softwareList.length === 0 ? (
        <p>No hay software registrado.</p>
      ) : (
        <div className="software-grid">
          {softwareList.map((software) => (
            <div key={software.id_software} className="software-card">
              <h3>{software.nombre}</h3>
              <p>Versión: {software.version}</p>
              <p>Fecha de Adquisición: {software.fecha_adquisicion}</p>
              <p>Fecha de Caducidad: {software.fecha_caducidad || 'N/A'}</p>
              <p>Tipo de Licencia: {software.tipoLicencia}</p>
              <p>Clave de Licencia: {software.claveLicencia || 'N/A'}</p>
              <p>Correo Asociado: {software.correoAsociado || 'N/A'}</p>
              <p>Contraseña de Correo: {software.contrasenaCorreo || 'N/A'}</p>
              <p>Estado: {software.estado}</p>
              <p>Licencia Caducada: {software.licenciaCaducada ? 'Sí' : 'No'}</p>
              <p>Máximo de Licencias: {software.maxLicencias || 'N/A'}</p> {/* Agregado para mostrar maxLicencias */}

              {/* Mostrar los equipos asociados */}
              <p>Equipos Asociados:</p>
              {software.softwareEquipos && software.softwareEquipos.length > 0 ? (
                <ul>
                  {software.softwareEquipos.map((equipo) => (
                    <li key={equipo.id_equipos}>{equipo.id_equipos} - {equipo.fechaAsignacion}</li>
                  ))}
                </ul>
              ) : (
                <p>No hay equipos asociados.</p>
              )}

              <div className="software-actions">
                <button className="edit-button" onClick={() => handleEditClick(software)}>
                  Editar
                </button>
                <button className="delete-button" onClick={() => handleDeleteClick(software.id_software)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Formulario de Software"
        className="modal"
        overlayClassName="overlay"
      >
        <SoftwareForm idSoftware={editSoftwareId} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default SoftwareList;
