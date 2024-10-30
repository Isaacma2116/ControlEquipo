import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/SoftwareList.css'; 
import Modal from 'react-modal'; // Importamos Modal
import SoftwareForm from './Forms/SoftwareForm'; // Asegúrate de que la ruta sea correcta

const SoftwareList = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSoftwareId, setEditSoftwareId] = useState(null); // ID del software en edición
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para controlar el modal

  useEffect(() => {
    fetchSoftware();
  }, []);

  const fetchSoftware = async () => {
    try {
      const response = await axios.get('http://localhost:3550/api/software');
      setSoftwareList(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar la lista de software');
      setLoading(false);
    }
  };

  // Función para abrir el modal y establecer el software a editar
  const handleEditClick = (software) => {
    setEditSoftwareId(software.id_software); // Establecer el ID del software en edición
    setModalIsOpen(true); // Abrir el modal
  };

  // Función para abrir el modal para agregar nuevo software
  const handleAddNewSoftware = () => {
    setEditSoftwareId(null); // No estamos editando, es un nuevo software
    setModalIsOpen(true); // Abrir el modal
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalIsOpen(false); // Cerrar el modal
    fetchSoftware(); // Recargar la lista después de cerrar el modal
  };

  // Función para manejar la eliminación de software
  const handleDeleteClick = async (id_software) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este software?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3550/api/software/${id_software}`);
        fetchSoftware(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar el software:', error);
      }
    }
  };

  if (loading) {
    return <div>Cargando software...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="software-list-container">
      <h1>Lista de Software</h1>

      {/* Botón para agregar nuevo software */}
      <button className="add-software-button" onClick={handleAddNewSoftware}>
        Agregar Nuevo Software
      </button>

      {/* Listado de software */}
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
              <p>Tipo de Licencia: {software.tipo_licencia}</p>
              <p>Clave de Licencia: {software.clave_licencia || 'N/A'}</p>
              <p>Correo Asociado: {software.correo_asociado || 'N/A'}</p>
              <p>Contraseña de Correo: {software.contrasena_correo || 'N/A'}</p>
              <p>Estado: {software.estado}</p>
              <p>Licencia Caducada: {software.licencia_caducada ? 'Sí' : 'No'}</p>

              {/* Botones de editar y eliminar */}
              <div className="software-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick(software)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteClick(software.id_software)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para el formulario de agregar/editar software */}
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
