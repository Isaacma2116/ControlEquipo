import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import './styles/EquipoForm.css';
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
    componentesAdicionales: [''], // Array de strings
    estadoFisico: '',
    detallesIncidentes: '',
    garantia: '',
    fechaCompra: '',
    activo: '',
    sistemaOperativo: '',
    mac: '',
    hostname: '',
    auxiliares: [{ nombre_auxiliar: '', numero_serie_aux: '' }], // Array de objetos
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

  const handleComponentChange = useCallback((index, e) => {
    const { value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: prevData.componentesAdicionales.map((componente, i) =>
        i === index ? value : componente
      )
    }));
  }, []);

  const addComponent = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: [...prevData.componentesAdicionales, '']
    }));
  }, []);

  const removeComponent = useCallback((index) => {
    if (formData.componentesAdicionales.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        componentesAdicionales: prevData.componentesAdicionales.filter((_, i) => i !== index)
      }));
    }
  }, [formData.componentesAdicionales]);

  const handleAuxiliarChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      auxiliares: prevData.auxiliares.map((auxiliar, i) =>
        i === index ? { ...auxiliar, [name]: value } : auxiliar
      ),
    }));
  }, []);

  const addAuxiliar = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      auxiliares: [...prevData.auxiliares, { nombre_auxiliar: '', numero_serie_aux: '' }]
    }));
  }, []);

  const removeAuxiliar = useCallback((index) => {
    if (formData.auxiliares.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        auxiliares: prevData.auxiliares.filter((_, i) => i !== index)
      }));
    }
  }, [formData.auxiliares]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);

    // Validar auxiliares
    const validAuxiliares = formData.auxiliares.every(aux =>
      aux.nombre_auxiliar?.trim() && aux.numero_serie_aux?.trim()
    );

    if (!validAuxiliares) {
      alert('Todos los auxiliares deben tener un nombre y un número de serie.');
      setLoading(false);
      return;
    }

    // Validar componentes adicionales
    const validComponentes = formData.componentesAdicionales.every(componente => componente?.trim());

    if (!validComponentes) {
      alert('Todos los componentes adicionales deben tener datos válidos.');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'auxiliares' || key === 'componentesAdicionales') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === 'imagen') {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

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
        alert(`Error al enviar los datos: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formData, resetForm]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={resetForm}>&times;</button>
        <h2 className="modal-title">Registrar Equipo</h2>
        <form className="equipo-form" onSubmit={handleSubmit}>
  {/* Campo para ID del equipo */}
  <FormField
    label="ID del equipo"
    icon={faLaptop}
    name="id_equipos"
    value={formData.id_equipos}
    onChange={handleChange}
    required
  />

  {/* Campo para Tipo de Dispositivo */}
  <FormField
    label="Tipo de Dispositivo"
    icon={faTag}
    name="tipoDispositivo"
    value={formData.tipoDispositivo}
    onChange={handleChange}
    list="tipoDispositivoList"
    required
  >
    <datalist id="tipoDispositivoList">
      <option value="Laptop" />
      <option value="PC" />
    </datalist>
  </FormField>

  {/* Campos para Marca y Modelo */}
  <FormRow>
    <FormField
      label="Marca"
      icon={faTag}
      name="marca"
      value={formData.marca}
      onChange={handleChange}
    />
    <FormField
      label="Modelo"
      icon={faTag}
      name="modelo"
      value={formData.modelo}
      onChange={handleChange}
    />
  </FormRow>

  {/* Campos para Número de Serie y Contraseña */}
  <FormRow>
    <FormField
      label="No. de Serie"
      icon={faTag}
      name="numeroSerie"
      value={formData.numeroSerie}
      onChange={handleChange}
      required
    />
    <FormField
      label="Contraseña del Equipo"
      icon={faShieldAlt}
      name="contrasenaEquipo"
      value={formData.contrasenaEquipo}
      onChange={handleChange}
    />
  </FormRow>

  {/* Especificaciones del Hardware */}
  <FormField
    label="RAM"
    icon={faMicrochip}
    name="ram"
    value={formData.ram}
    onChange={handleChange}
  />
  <FormField
    label="Disco Duro"
    icon={faHdd}
    name="discoDuro"
    value={formData.discoDuro}
    onChange={handleChange}
  />
  <FormField
    label="Tarjeta Madre"
    icon={faMicrochip}
    name="tarjetaMadre"
    value={formData.tarjetaMadre}
    onChange={handleChange}
  />
  <FormField
    label="Tarjeta Gráfica"
    icon={faMicrochip}
    name="tarjetaGrafica"
    value={formData.tarjetaGrafica}
    onChange={handleChange}
  />
  <FormField
    label="Procesador"
    icon={faMicrochip}
    name="procesador"
    value={formData.procesador}
    onChange={handleChange}
  />

  {/* Componentes Adicionales */}
  {formData.componentesAdicionales.map((componente, index) => (
    <FormRow key={index}>
      <FormField
        label={`Componente Adicional ${index + 1}`}
        icon={faPlus}
        name={`componenteAdicional${index}`}
        value={componente}
        onChange={(e) => handleComponentChange(index, e)}
      />
      {formData.componentesAdicionales.length > 1 && (
        <button
          type="button"
          onClick={() => removeComponent(index)}
          disabled={formData.componentesAdicionales.length <= 1}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      )}
    </FormRow>
  ))}
  <button type="button" onClick={addComponent}>
    <FontAwesomeIcon icon={faPlus} /> Agregar Componente
  </button>

  {/* Estado Físico */}
  <FormField
    label="Estado Físico"
    icon={faHdd}
    name="estadoFisico"
    value={formData.estadoFisico}
    onChange={handleChange}
    list="estadoFisicoList"
    required
  >
    <datalist id="estadoFisicoList">
      <option value="Excelente (nuevo) y garantía" />
      <option value="Bueno (Pérdida de garantía y raspones)" />
      <option value="Regular (Golpes, Rayones grandes)" />
      <option value="Malo (Cambio de piezas y pérdidas)" />
      <option value="Urgente (No funciona correctamente)" />
    </datalist>
  </FormField>

  {/* Garantía y Fecha de Compra */}
  <FormRow>
    <FormField
      label="Garantía"
      icon={faShieldAlt}
      name="garantia"
      value={formData.garantia}
      onChange={handleChange}
    />
    <FormField
      label="Fecha de Compra"
      icon={faCalendarAlt}
      name="fechaCompra"
      value={formData.fechaCompra}
      type="date"
      onChange={handleChange}
    />
  </FormRow>

  {/* Activo y Sistema Operativo */}
  <FormRow>
    <FormField
      label="Activo"
      icon={faShieldAlt}
      name="activo"
      value={formData.activo}
      onChange={handleChange}
    />
    <FormField
      label="Sistema Operativo"
      icon={faMicrochip}
      name="sistemaOperativo"
      value={formData.sistemaOperativo}
      onChange={handleChange}
    />
  </FormRow>

  {/* Dirección MAC y Hostname */}
  <FormRow>
    <FormField
      label="MAC"
      icon={faMicrochip}
      name="mac"
      value={formData.mac}
      onChange={handleChange}
    />
    <FormField
      label="Hostname"
      icon={faMicrochip}
      name="hostname"
      value={formData.hostname}
      onChange={handleChange}
    />
  </FormRow>

  {/* Auxiliares/Periféricos */}
  {formData.auxiliares.map((auxiliar, index) => (
    <FormRow key={index}>
      <FormField
        label={`Nombre Periférico ${index + 1}`}
        icon={faTv}
        name="nombre_auxiliar"
        value={auxiliar.nombre_auxiliar}
        onChange={(e) => handleAuxiliarChange(index, e)}
        list={`peripheralList-${index}`}
      >
        <datalist id={`peripheralList-${index}`}>
          {peripheralsList.map((peripheral, idx) => (
            <option key={idx} value={peripheral} />
          ))}
        </datalist>
      </FormField>
      <FormField
        label="Número de Serie Periférico"
        icon={faTv}
        name="numero_serie_aux"
        value={auxiliar.numero_serie_aux}
        onChange={(e) => handleAuxiliarChange(index, e)}
      />
      {formData.auxiliares.length > 1 && (
        <button
          type="button"
          onClick={() => removeAuxiliar(index)}
          disabled={formData.auxiliares.length <= 1}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      )}
    </FormRow>
  ))}
  <button type="button" onClick={addAuxiliar}>
    <FontAwesomeIcon icon={faPlus} /> Agregar Periférico
  </button>

  {/* Campo para Subir Imagen */}
  <div className="form-group">
    <label>Imagen</label>
    <input type="file" name="imagen" onChange={handleFileChange} />
  </div>

  {/* Campo para Seleccionar Colaborador */}
  <div className="form-group">
    <label><FontAwesomeIcon icon={faTag} /> Seleccionar Colaborador</label>
    <select name="idColaborador" value={formData.idColaborador} onChange={handleChange}>
      <option value="">No seleccionar colaborador</option>
      {colaboradores.map(colaborador => (
        <option key={colaborador.id} value={colaborador.id}>
          {colaborador.id} - {colaborador.nombre}
        </option>
      ))}
    </select>
  </div>

  {/* Botón para Enviar el Formulario */}
  <button type="submit" className="submit-button" disabled={loading}>
    {loading ? 'Guardando...' : 'Guardar'}
  </button>
</form>

      </div>
    </div>
  );
};

export default EquipoForm;
