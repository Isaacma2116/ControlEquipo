// EquipoForm.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import './styles/EquipoForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop, faTag, faShieldAlt, faCalendarAlt, faMicrochip,
  faHdd, faTv, faPlus, faMinus, faFileImage
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importación de Swal

// Componente FormField para manejar diferentes tipos de campos
const FormField = ({
  label,
  icon,
  name,
  value,
  onChange,
  type = "text",
  children,
  list,
  required = false,
  readOnly = false
}) => (
  <div className="form-group">
    <label htmlFor={name}>
      <FontAwesomeIcon icon={icon} /> {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={name}
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        className="form-textarea"
        required={required}
        readOnly={readOnly}
      />
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        list={list}
        className="form-input"
        required={required}
        readOnly={readOnly}
      />
    )}
    {children}
  </div>
);

// Componente FormRow para organizar campos en una fila
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
    componentesAdicionales: [''],
    estadoFisico: '',
    detallesIncidentes: '',
    garantia: '',
    fechaCompra: '',
    activo: '',
    sistemaOperativo: '',
    mac: '',
    hostname: '',
    auxiliares: [{ nombre_auxiliar: '', numero_serie_aux: '' }],
    idColaborador: '',
    imagen: null,
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const [peripheralsList] = useState([
    "Teclado", "Mouse", "Impresora", "Escáner", "Monitor", "Parlantes", "Cámara Web", "Micrófono", "Pantalla"
  ]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equiposResponse, colaboradoresResponse] = await Promise.all([
          axios.get('http://localhost:3550/api/equipos'),
          axios.get('http://localhost:3550/api/colaboradores')
        ]);

        // Depuración: Verificar la estructura de la respuesta de colaboradores
        console.log('colaboradoresResponse.data:', colaboradoresResponse.data);

        // Asegurarse de que colaboradoresResponse.data es un arreglo
        let colaboradoresData = [];

        if (Array.isArray(colaboradoresResponse.data)) {
          colaboradoresData = colaboradoresResponse.data;
        } else if (colaboradoresResponse.data.colaboradores && Array.isArray(colaboradoresResponse.data.colaboradores)) {
          colaboradoresData = colaboradoresResponse.data.colaboradores;
        } else {
          console.warn('La estructura de la respuesta de colaboradores no es la esperada.');
        }

        setColaboradores(colaboradoresData);

        // Manejar datos de equipos
        const equipos = equiposResponse.data;
        const nextId = equipos.length
          ? `EQUIPO-${String(
            Math.max(...equipos.map((e) => parseInt(e.id_equipos.split('-')[1], 10))) + 1
          ).padStart(3, '0')}`
          : 'EQUIPO-001';
        setFormData((prevData) => ({ ...prevData, id_equipos: nextId }));
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al cargar los datos. Por favor, intenta nuevamente más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };

    fetchData();
  }, []);

  // Reset form and close modal
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    handleClose();
  }, [initialFormData, handleClose]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" && name === "idColaborador" ? null : value,
    }));
  }, []);

  // Handle file input changes
  const handleFileChange = useCallback((e) => {
    setFormData(prevData => ({ ...prevData, imagen: e.target.files[0] }));
  }, []);

  // Handle changes in componentesAdicionales
  const handleComponentChange = useCallback((index, e) => {
    const { value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: prevData.componentesAdicionales.map((componente, i) =>
        i === index ? value : componente
      )
    }));
  }, []);

  // Add a new componente adicional
  const addComponent = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      componentesAdicionales: [...prevData.componentesAdicionales, '']
    }));
  }, []);

  // Remove a componente adicional
  const removeComponent = useCallback((index) => {
    if (formData.componentesAdicionales.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        componentesAdicionales: prevData.componentesAdicionales.filter((_, i) => i !== index)
      }));
    }
  }, [formData.componentesAdicionales]);

  // Handle changes in auxiliares
  const handleAuxiliarChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      auxiliares: prevData.auxiliares.map((auxiliar, i) =>
        i === index ? { ...auxiliar, [name]: value } : auxiliar
      ),
    }));
  }, []);

  // Add a new auxiliar
  const addAuxiliar = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      auxiliares: [...prevData.auxiliares, { nombre_auxiliar: '', numero_serie_aux: '' }]
    }));
  }, []);

  // Remove an auxiliar
  const removeAuxiliar = useCallback((index) => {
    if (formData.auxiliares.length > 1) {
      setFormData(prevData => ({
        ...prevData,
        auxiliares: prevData.auxiliares.filter((_, i) => i !== index)
      }));
    }
  }, [formData.auxiliares]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar auxiliares
    const validAuxiliares = formData.auxiliares.every(aux =>
      aux.nombre_auxiliar?.trim() && aux.numero_serie_aux?.trim()
    );

    if (!validAuxiliares) {
      Swal.fire({
        title: 'Error de Validación',
        text: 'Todos los auxiliares deben tener un nombre y un número de serie.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      setLoading(false);
      return;
    }

    // Validar componentes adicionales
    const validComponentes = formData.componentesAdicionales.every(componente => componente?.trim());

    if (!validComponentes) {
      Swal.fire({
        title: 'Error de Validación',
        text: 'Todos los componentes adicionales deben tener datos válidos.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
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

    try {
      const response = await axios.post('http://localhost:3550/api/equipos', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Datos del equipo enviados:', response.data);
      Swal.fire({
        title: 'Éxito',
        text: 'El equipo ha sido registrado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      resetForm();
      window.location.reload(false);
    } catch (error) {
      console.error('Error al enviar los datos:', error.response?.data || error.message);
      Swal.fire({
        title: 'Error',
        text: `Error al enviar los datos: ${error.response?.data?.message || error.message}`,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
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
            label="ID del Equipo"
            icon={faLaptop}
            name="id_equipos"
            value={formData.id_equipos}
            onChange={handleChange}
            type="text"
            required
            readOnly
          />

          {/* Campo para Tipo de Dispositivo */}
          <div className="form-group">
  <label htmlFor="tipoDispositivo">
    <FontAwesomeIcon icon={faTag} /> Tipo de Dispositivo
  </label>
  <select
    id="tipoDispositivo"
    name="tipoDispositivo"
    value={formData.tipoDispositivo}
    onChange={handleChange}
    required
  >
    <option value="" disabled>
      Seleccione un tipo de dispositivo
    </option>
    <option value="Laptop">Laptop</option>
    <option value="PC">PC</option>
  </select>
</div>


          {/* Campos para Marca y Modelo */}
          <FormRow>
            <FormField
              label="Marca"
              icon={faTag}
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
            />
            <FormField
              label="Modelo"
              icon={faTag}
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
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
                  className="remove-button"
                  aria-label={`Eliminar Componente Adicional ${index + 1}`}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              )}
            </FormRow>
          ))}
          <button type="button" onClick={addComponent} className="add-button">
            <FontAwesomeIcon icon={faPlus} /> Agregar Componente
          </button>

          {/* Detalles de Incidentes */}
          <FormField
            label="Detalles de Incidentes"
            icon={faShieldAlt}
            name="detallesIncidentes"
            value={formData.detallesIncidentes}
            onChange={handleChange}
            type="textarea"
          />

          {/* Estado Físico */}
          <label htmlFor="estadoFisico">Estado Físico:</label>
          <select
            id="estadoFisico"
            name="estadoFisico"
            value={formData.estadoFisico}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un estado físico</option>
            <option value="Excelente (nuevo) y garantía">Excelente (nuevo) y garantía</option>
            <option value="Bueno (Pérdida de garantía y raspones)">Bueno (Pérdida de garantía y raspones</option>
            <option value="Regular (Golpes, Rayones grandes)">Regular (Golpes, Rayones grandes)</option>
            <option value="Malo (Cambio de piezas y pérdidas)">Malo (Cambio de piezas y pérdidas)</option>
            <option value="Urgente (No funciona correctamente)">Urgente (No funciona correctamente)</option>
          </select>

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
            <label htmlFor={`nombre_auxiliar-${index}`}>
              Auxiliar {index + 1}:
            </label>
            <input
  type="text"
  id={`nombre_auxiliar-${index}`}
  name="nombre_auxiliar"
  value={auxiliar.nombre_auxiliar}
  onChange={(e) => handleAuxiliarChange(index, e)}
  placeholder="Seleccione o escriba un periférico"
  list={`peripheralList-${index}`}
  required
/>
<datalist id={`peripheralList-${index}`}>
  <option value="Teclado" />
  <option value="Mouse" />
  <option value="Impresora" />
  <option value="Escáner" />
  <option value="Monitor" />
  <option value="Parlantes" />
  <option value="Cámara Web" />
  <option value="Micrófono" />
  <option value="Pantalla" />
</datalist>

          
            <label htmlFor={`numero_serie_aux-${index}`} style={{ marginTop: "16px" }}>
              Número de Serie Periférico:
            </label>
            <input
              type="text"
              id={`numero_serie_aux-${index}`}
              name="numero_serie_aux"
              value={auxiliar.numero_serie_aux}
              onChange={(e) => handleAuxiliarChange(index, e)}
              placeholder="Ingrese el número de serie"
              required
            />
          
            {formData.auxiliares.length > 1 && (
              <button
                type="button"
                onClick={() => removeAuxiliar(index)}
                className="remove-button"
                aria-label={`Eliminar Periférico ${index + 1}`}
                style={{ marginTop: "16px" }}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
            )}
          </FormRow>
          
            
          ))}
          <button type="button" onClick={addAuxiliar} className="add-button">
            <FontAwesomeIcon icon={faPlus} /> Agregar Periférico
          </button>

          {/* Campo para Subir Imagen */}
          <div className="form-group">
            <label htmlFor="imagen">
              <FontAwesomeIcon icon={faFileImage} /> Imagen
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              onChange={handleFileChange}
              className="form-input-file"
              accept="image/*"
            />
          </div>

          {/* Campo para Seleccionar Colaborador */}
          <div className="form-group">
            <label htmlFor="idColaborador">
              <FontAwesomeIcon icon={faTag} /> Seleccionar Colaborador
            </label>
            <select
              id="idColaborador"
              name="idColaborador"
              value={formData.idColaborador || ""}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">No seleccionar colaborador</option>
              {Array.isArray(colaboradores) && colaboradores.length > 0 ? (
                colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.id} - {colaborador.nombre}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay colaboradores disponibles</option>
              )}
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
