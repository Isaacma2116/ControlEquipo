// src/components/AuxiliaresList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptop,
  faTag,
  faUser,
  faBuilding,
  faTv,
  faBarcode,
} from '@fortawesome/free-solid-svg-icons';
import './styles/AuxiliaresList.css'; // Crea este archivo para estilos personalizados si lo deseas

const AuxiliaresList = () => {
    const [auxiliares, setAuxiliares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuxiliares = async () => {
            try {
                const response = await axios.get('http://localhost:3550/api/auxiliares');
                setAuxiliares(response.data);
                setError(null);
            } catch (err) {
                console.error('Error al obtener auxiliares:', err);
                setError('Hubo un error al cargar los auxiliares.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuxiliares();
    }, []);

    if (loading) {
        return <div>Cargando auxiliares...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="auxiliares-list">
            <h1>Lista de Auxiliares</h1>
            {auxiliares.length === 0 ? (
                <p>No se encontraron auxiliares.</p>
            ) : (
                <table className="auxiliares-table">
                    <thead>
                        <tr>
                            <th>ID Auxiliar</th>
                            <th>Nombre Auxiliar</th>
                            <th>Número de Serie</th>
                            <th>Equipo Asociado</th>
                            <th>Tipo de Dispositivo</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auxiliares.map((auxiliar) => (
                            <tr key={auxiliar.id_auxiliar}>
                                <td>
                                    <FontAwesomeIcon icon={faTag} /> {auxiliar.id_auxiliar}
                                </td>
                                <td>
                                    <FontAwesomeIcon icon={faTv} /> {auxiliar.nombre_auxiliar}
                                </td>
                                <td>
                                    <FontAwesomeIcon icon={faBarcode} /> {auxiliar.numero_serie_aux}
                                </td>
                                <td>
                                    {auxiliar.equipo ? (
                                        <>
                                            <FontAwesomeIcon icon={faLaptop} /> {auxiliar.equipo.id_equipos}
                                        </>
                                    ) : (
                                        'Sin asignar'
                                    )}
                                </td>
                                <td>
                                    {auxiliar.equipo ? auxiliar.equipo.tipoDispositivo : '-'}
                                </td>
                                <td>
                                    {auxiliar.equipo ? auxiliar.equipo.marca : '-'}
                                </td>
                                <td>
                                    {auxiliar.equipo ? auxiliar.equipo.modelo : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AuxiliaresList;
