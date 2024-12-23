import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/CelularForm.css'; // Asegúrate de tener los estilos adecuados

const CelularForm = ({ show, handleClose, celularData, refreshCelulares }) => {
    const [formData, setFormData] = useState({
        color: '',
        marca: '',
        modelo: '',
        imei: '',
        numeroDeSerie: '',
        contrasena_o_pin: '',
        correoAsociado: '',
        contrasenaDelCorreo: '',
        componentesDelCelular: '',
        renovacionDelEquipo: '',
        idColaborador: '',
    });

    const [colaboradores, setColaboradores] = useState([]);
    const [imeiError, setImeiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Cargar colaboradores y datos iniciales
    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/colaboradores');
                setColaboradores(response.data);
            } catch (error) {
                console.error('Error fetching colaboradores:', error);
                setFormError('No se pudieron cargar los colaboradores.');
            }
        };

        fetchColaboradores();

        if (celularData) {
            setFormData({
                ...celularData,
                renovacionDelEquipo: celularData.renovacionDelEquipo
                    ? new Date(celularData.renovacionDelEquipo).toISOString().slice(0, 10)
                    : '',
            });
        }
    }, [celularData]);

    // Manejo de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === 'imei') {
            if (value.length < 15 || value.length > 20) {
                setImeiError('El IMEI debe tener entre 15 y 20 caracteres.');
            } else {
                setImeiError('');
            }
        }
    };

    // Manejo de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        // Validaciones adicionales
        if (imeiError) {
            setFormError('Por favor, corrige los errores antes de enviar el formulario.');
            setIsSubmitting(false);
            return;
        }

        try {
            if (celularData) {
                // Actualizar celular
                await axios.put(`http://localhost:3550/api/celulares/${celularData.idmovil}`, formData);
            } else {
                // Crear nuevo celular
                await axios.post('http://localhost:3550/api/celulares', formData);
            }
            await refreshCelulares(); // Actualizar la lista de celulares
            handleClose(); // Cerrar el formulario
        } catch (error) {
            console.error('Error al guardar celular:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setFormError(`Error: ${error.response.data.error}`);
            } else {
                setFormError('No se pudo guardar el celular. Inténtalo nuevamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{celularData ? 'Editar Celular' : 'Agregar Celular'}</h2>
                {formError && <p className="form-error">{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Color</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Marca</label>
                        <input
                            type="text"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Modelo</label>
                        <input
                            type="text"
                            name="modelo"
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>IMEI</label>
                        <input
                            type="text"
                            name="imei"
                            value={formData.imei}
                            onChange={handleChange}
                            required
                        />
                        {imeiError && <p className="error-text">{imeiError}</p>}
                    </div>
                    <div>
                        <label>Número de Serie</label>
                        <input
                            type="text"
                            name="numeroDeSerie"
                            value={formData.numeroDeSerie}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Contraseña o PIN</label>
                        <input
                            type="text"
                            name="contrasena_o_pin"
                            value={formData.contrasena_o_pin}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Correo Asociado</label>
                        <input
                            type="email"
                            name="correoAsociado"
                            value={formData.correoAsociado}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Contraseña del Correo</label>
                        <input
                            type="text"
                            name="contrasenaDelCorreo"
                            value={formData.contrasenaDelCorreo}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Componentes del Celular</label>
                        <textarea
                            name="componentesDelCelular"
                            value={formData.componentesDelCelular}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Renovación del Equipo</label>
                        <input
                            type="date"
                            name="renovacionDelEquipo"
                            value={formData.renovacionDelEquipo}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>ID del Colaborador (Opcional)</label>
                        <select
                            name="idColaborador"
                            value={formData.idColaborador || ''}
                            onChange={handleChange}
                        >
                            <option value="">-</option>
                            {colaboradores.map((colaborador) => (
                                <option key={colaborador.id} value={colaborador.id}>
                                    {colaborador.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {celularData ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" onClick={handleClose}>
                            Cerrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CelularForm;
