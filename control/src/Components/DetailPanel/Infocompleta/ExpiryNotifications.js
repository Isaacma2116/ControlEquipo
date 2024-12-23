import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Configuración de Socket.IO
const SOCKET_SERVER_URL = 'http://localhost:3550'; // Asegúrate de que esta URL sea la correcta
const socket = io(SOCKET_SERVER_URL);

const ExpiryNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [closedNotifications, setClosedNotifications] = useState([]);

  useEffect(() => {
    // Escuchar el evento desde el servidor
    socket.on('expiring-software-notification', (data) => {
      console.log('Notificaciones recibidas:', data);
      // Filtrar notificaciones que ya fueron cerradas
      const filteredNotifications = data.filter(
        (software) => !closedNotifications.includes(software.id_software)
      );
      setNotifications(filteredNotifications);
    });

    // Limpiar el evento al desmontar
    return () => {
      socket.off('expiring-software-notification');
    };
  }, [closedNotifications]);

  // Función para cerrar notificaciones individualmente
  const handleCloseNotification = (id) => {
    setClosedNotifications((prev) => [...prev, id]);
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id_software !== id)
    );
  };

  if (notifications.length === 0) return null; // No mostrar el componente si no hay notificaciones

  return (
    <div className="expiry-notifications">
      <h2>Notificaciones de Software Próximo a Caducar</h2>
      {notifications.map((software) => (
        <div key={software.id_software} className="notification-item">
          <p>
            <strong>{software.nombre}</strong> caduca el{' '}
            {new Date(software.fecha_caducidad).toLocaleDateString()}
          </p>
          <button onClick={() => handleCloseNotification(software.id_software)}>
            Cerrar
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExpiryNotifications;
