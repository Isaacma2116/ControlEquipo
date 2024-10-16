import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import './styles/EquipoForm.css'; // Asegúrate de que este archivo CSS tenga los estilos que discutimos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip,
  faHdd, faTv, faPlus, faMinus
} from '@fortawesome/free-solid-svg-icons';

const FormField = ({ label, icon, name, value, onChange, type = "text", children, list }) => (
  <div className="form-group">
    <label><FontAwesomeIcon icon={icon} /> {label}</label>
    <input
      type={type}
      name={name}
      placeholder={label}
      value={value}
      onChange={onChange}
      list={list}
    />
    {children}
  </div>
);

const FormRow = ({ children }) => (
  <div className="form-group-row">
    {children}
  </div>
);

const EquipoForm = ({ show, handleClose }) => {
  const initialFormData = useMemo(() => ({
    id_equipos: '',
    tipoDispositivo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    contrasenaEquipo: '',
    ram: '',
    discoDuro: '',
    tarjetaMadre: '',
    tarjetaGrafica: '',
    procesador: '',
    componentesAdicionales: [{ nombre_componente: '' }], // Inicializado con un componente
    estadoFisico: '',
    detallesIncidentes: '',
    garantia: '',
    fechaCompra: '',
    activo: '',
    sistemaOperativo: '',
    mac: '',
    hostname: '',
    auxiliares: [{ nombre_auxiliar: '', numeroSerieAux: '' }], // Inicializado con un periférico
    idColaborador: '',
    imagen: null,
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const [peripheralsList, setPeripheralsList] = useState([
    "Teclado", "Mouse", "Impresora", "Escáner", "Monitor", "Parlantes", "Cámara Web", "Micrófono", "Pantalla"
  ]);

  useEffect(() => {
    axios.get('http://localhost:3550/api/colaboradores')
      .then(response => {
        setColaboradores(response.data);
      })
      .catch(error => {
        console.error('Error al cargar los colaboradores:', error);
      });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    handleClose();
  }, [initialFormData, handleClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData(prevData => ({ ...prevData, imagen: e.target.files[0] }));
  }, []);

  // Manejo de componentes adicionales
  const handleComponentChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: prevData.componentesAdicionales.map((componente, i) =>
        i === index ? { ...componente, [name]: value } : componente
      )
    }));
  }, []);

  const addComponent = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: [...prevData.componentesAdicionales, { nombre_componente: '' }]
    }));
  }, []);

  // Manejo de auxiliares/periféricos
  const handleAuxiliarChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      auxiliares: prevData.auxiliares.map((auxiliar, i) =>
        i === index ? { ...auxiliar, [name]: value } : auxiliar
      )
    }));
  }, []);

  const addAuxiliar = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      auxiliares: [...prevData.auxiliares, { nombre_auxiliar: '', numeroSerieAux: '' }]
    }));
  }, []);

  // Evitar que el último componente adicional o periférico se pueda eliminar
  const removeAuxiliar = useCallback((index) => {
    if (formData.auxiliares.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        auxiliares: prevData.auxiliares.filter((_, i) => i !== index)
      }));
    }
  }, [formData.auxiliares]);

  const removeComponent = useCallback((index) => {
    if (formData.componentesAdicionales.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        componentesAdicionales: prevData.componentesAdicionales.filter((_, i) => i !== index)
      }));
    }
  }, [formData.componentesAdicionales]);

  const handleAddPeripheral = (newPeripheral) => {
    if (!peripheralsList.includes(newPeripheral)) {
      setPeripheralsList([...peripheralsList, newPeripheral]);
    }
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('id_equipos', formData.id_equipos);
    formDataToSend.append('tipoDispositivo', formData.tipoDispositivo);
    formDataToSend.append('marca', formData.marca);
    formDataToSend.append('modelo', formData.modelo);
    formDataToSend.append('numeroSerie', formData.numeroSerie);
    formDataToSend.append('contrasenaEquipo', formData.contrasenaEquipo);
    formDataToSend.append('ram', formData.ram);
    formDataToSend.append('discoDuro', formData.discoDuro);
    formDataToSend.append('tarjetaMadre', formData.tarjetaMadre);
    formDataToSend.append('tarjetaGrafica', formData.tarjetaGrafica);
    formDataToSend.append('procesador', formData.procesador);
    formDataToSend.append('componentesAdicionales', JSON.stringify(formData.componentesAdicionales));
    formDataToSend.append('estadoFisico', formData.estadoFisico);
    formDataToSend.append('detallesIncidentes', formData.detallesIncidentes);
    formDataToSend.append('garantia', formData.garantia);
    formDataToSend.append('fechaCompra', formData.fechaCompra);
    formDataToSend.append('activo', formData.activo);
    formDataToSend.append('sistemaOperativo', formData.sistemaOperativo);
    formDataToSend.append('mac', formData.mac);
    formDataToSend.append('hostname', formData.hostname);
    formDataToSend.append('idColaborador', formData.idColaborador || '');
    formDataToSend.append('auxiliares', JSON.stringify(formData.auxiliares));

    if (formData.imagen) {
      formDataToSend.append('imagen', formData.imagen);
    }

    axios.post('http://localhost:3550/api/equipos', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(response => {
        console.log('Datos del equipo enviados:', response.data);
        resetForm();
        window.location.reload(false);
      })
      .catch(error => {
        console.error('Error al enviar los datos:', error.response?.data || error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formData, resetForm]);

  const handleCloseRequest = useCallback(() => {
    const hasData = Object.values(formData).some(value =>
      Array.isArray(value) ? value.some(innerValue => innerValue.nombre_auxiliar || innerValue.numeroSerieAux) : value
    );
    if (hasData) {
      setShowConfirm(true);
    } else {
      handleClose();
    }
  }, [formData, handleClose]);

  const confirmClose = useCallback(() => {
    resetForm();
    setShowConfirm(false);
    handleClose();
  }, [handleClose, resetForm]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={handleClose}>&times;</button>
        <h2 className="modal-title">Registrar Equipo</h2>
        <form className="equipo-form" onSubmit={handleSubmit}>
          <FormField label="ID del equipo" icon={faLaptop} name="id_equipos" value={formData.id_equipos} onChange={handleChange} required />
          <FormField label="Tipo de Dispositivo" icon={faTag} name="tipoDispositivo" value={formData.tipoDispositivo} onChange={handleChange} list="tipoDispositivoList" required>
            <datalist id="tipoDispositivoList">
              <option value="Laptop" />
              <option value="PC" />
            </datalist>
          </FormField>
          <FormRow>
            <FormField label="Marca" icon={faTag} name="marca" value={formData.marca} onChange={handleChange} />
            <FormField label="Modelo" icon={faTag} name="modelo" value={formData.modelo} onChange={handleChange} />
          </FormRow>
          <FormRow>
            <FormField label="No. de serie" icon={faTag} name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />
            <FormField label="Contraseña del equipo" icon={faShieldAlt} name="contrasenaEquipo" value={formData.contrasenaEquipo} onChange={handleChange} />
          </FormRow>

          {/* Nuevos campos para componentes */}
          <FormField label="RAM" icon={faMicrochip} name="ram" value={formData.ram} onChange={handleChange} />
          <FormField label="Disco Duro" icon={faHdd} name="discoDuro" value={formData.discoDuro} onChange={handleChange} />
          <FormField label="Tarjeta Madre" icon={faMicrochip} name="tarjetaMadre" value={formData.tarjetaMadre} onChange={handleChange} />
          <FormField label="Tarjeta Gráfica" icon={faMicrochip} name="tarjetaGrafica" value={formData.tarjetaGrafica} onChange={handleChange} />
          <FormField label="Procesador" icon={faMicrochip} name="procesador" value={formData.procesador} onChange={handleChange} />

          {/* Componentes adicionales con la opción de agregar */}
          {formData.componentesAdicionales.map((componente, index) => (
            <FormRow key={index}>
              <FormField
                label={`Componente Adicional ${index + 1}`}
                icon={faPlus}
                name="nombre_componente"
                value={componente.nombre_componente}
                onChange={(e) => handleComponentChange(index, e)}
              />
              {formData.componentesAdicionales.length > 1 && (
                <button type="button" onClick={() => removeComponent(index)} disabled={formData.componentesAdicionales.length <= 1}>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              )}
            </FormRow>
          ))}
          <button type="button" onClick={addComponent}><FontAwesomeIcon icon={faPlus} /> Agregar Componente</button>

          <FormRow>
            <FormField label="Estado físico" icon={faHdd} name="estadoFisico" value={formData.estadoFisico} onChange={handleChange} />
            <FormField label="Detalles o incidentes" icon={faHdd} name="detallesIncidentes" value={formData.detallesIncidentes} onChange={handleChange} />
          </FormRow>
          <FormRow>
            <FormField label="Garantía" icon={faShieldAlt} name="garantia" value={formData.garantia} onChange={handleChange} />
            <FormField label="Fecha de compra" icon={faCalendarAlt} name="fechaCompra" value={formData.fechaCompra} type="date" onChange={handleChange} />
          </FormRow>
          <FormRow>
            <FormField label="Activo" icon={faShieldAlt} name="activo" value={formData.activo} onChange={handleChange} />
            <FormField label="Sistema Operativo" icon={faMicrochip} name="sistemaOperativo" value={formData.sistemaOperativo} onChange={handleChange} />
          </FormRow>
          <FormRow>
            <FormField label="MAC" icon={faMicrochip} name="mac" value={formData.mac} onChange={handleChange} />
            <FormField label="Hostname" icon={faMicrochip} name="hostname" value={formData.hostname} onChange={handleChange} />
          </FormRow>

          {/* Auxiliares modificados para ser periféricos */}
          {formData.auxiliares.map((auxiliar, index) => (
            <FormRow key={index}>
              <FormField
                label={`Nombre Periférico ${index + 1}`}
                icon={faTv}
                name="nombre_auxiliar"
                value={auxiliar.nombre_auxiliar}
                onChange={(e) => {
                  handleAuxiliarChange(index, e);
                  handleAddPeripheral(e.target.value); // Guardar el nuevo periférico si no existe en la lista
                }}
                list={`peripheralList-${index}`}
              >
                <datalist id={`peripheralList-${index}`}>
                  {peripheralsList.map((peripheral, idx) => (
                    <option key={idx} value={peripheral} />
                  ))}
                </datalist>
              </FormField>
              <FormField label="Número de serie Periférico" icon={faTv} name="numeroSerieAux" value={auxiliar.numeroSerieAux} onChange={(e) => handleAuxiliarChange(index, e)} />
              {formData.auxiliares.length > 1 && (
                <button type="button" onClick={() => removeAuxiliar(index)} disabled={formData.auxiliares.length <= 1}>
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              )}
            </FormRow>
          ))}
          <button type="button" onClick={addAuxiliar}><FontAwesomeIcon icon={faPlus} /> Agregar Periférico</button>

          <div className="form-group">
            <label>Imagen</label>
            <input type="file" name="imagen" onChange={handleFileChange} />
          </div>

          {/* Campo select para idColaborador */}
          <div className="form-group">
            <label><FontAwesomeIcon icon={faTag} /> Seleccionar Colaborador</label>
            <select name="idColaborador" value={formData.idColaborador} onChange={handleChange}>
              <option value="">No seleccionar colaborador</option>  {/* Opción para no seleccionar */}
              {colaboradores.map(colaborador => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.id} - {colaborador.nombre}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>

        </form>

        {showConfirm && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <p>Hay datos no guardados. ¿Estás seguro de que quieres cerrar?</p>
              <button onClick={confirmClose}>Sí</button>
              <button onClick={() => setShowConfirm(false)}>No</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EquipoForm;
