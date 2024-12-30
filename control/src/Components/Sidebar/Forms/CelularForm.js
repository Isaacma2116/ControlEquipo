import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/CelularForm.css';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        if (imeiError) {
            setFormError('Por favor, corrige los errores antes de enviar el formulario.');
            setIsSubmitting(false);
            return;
        }

        try {
            if (celularData) {
                await axios.put(`http://localhost:3550/api/celulares/${celularData.idmovil}`, formData);
            } else {
                await axios.post('http://localhost:3550/api/celulares', formData);
            }
            await refreshCelulares();
            handleClose();
        } catch (error) {
            console.error('Error al guardar celular:', error);
            setFormError('No se pudo guardar el celular. Inténtalo nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>{celularData ? 'Editar Celular' : 'Agregar Celular'}</h2>
                {formError && <p className="form-error">{formError}</p>}
                <form onSubmit={handleSubmit} className="celular-form">
                    <div className="form-group">
                        <label htmlFor="color">Color</label>
                        <input
                            id="color"
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="marca">Marca</label>
                        <input
                            id="marca"
                            type="text"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="modelo">Modelo</label>
                        <input
                            id="modelo"
                            type="text"
                            name="modelo"
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="imei">IMEI</label>
                        <input
                            id="imei"
                            type="text"
                            name="imei"
                            value={formData.imei}
                            onChange={handleChange}
                            required
                            aria-describedby="imei-error"
                        />
                        {imeiError && <span id="imei-error" className="error-text">{imeiError}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="numeroDeSerie">Número de Serie</label>
                        <input
                            id="numeroDeSerie"
                            type="text"
                            name="numeroDeSerie"
                            value={formData.numeroDeSerie}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contrasena_o_pin">Contraseña o PIN</label>
                        <input
                            id="contrasena_o_pin"
                            type="text"
                            name="contrasena_o_pin"
                            value={formData.contrasena_o_pin}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="correoAsociado">Correo Asociado</label>
                        <input
                            id="correoAsociado"
                            type="email"
                            name="correoAsociado"
                            value={formData.correoAsociado}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contrasenaDelCorreo">Contraseña del Correo</label>
                        <input
                            id="contrasenaDelCorreo"
                            type="text"
                            name="contrasenaDelCorreo"
                            value={formData.contrasenaDelCorreo}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="componentesDelCelular">Componentes del Celular</label>
                        <textarea
                            id="componentesDelCelular"
                            name="componentesDelCelular"
                            value={formData.componentesDelCelular}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="renovacionDelEquipo">Renovación del Equipo</label>
                        <input
                            id="renovacionDelEquipo"
                            type="date"
                            name="renovacionDelEquipo"
                            value={formData.renovacionDelEquipo}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="idColaborador">ID del Colaborador (Opcional)</label>
                        <select
                            id="idColaborador"
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
                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {celularData ? 'Actualizar' : 'Crear'}
                        </button>
                        <button type="button" className="btn-close" onClick={handleClose}>
                            Cerrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CelularForm;
