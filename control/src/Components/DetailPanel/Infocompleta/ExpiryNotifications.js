import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3550');

const ExpiryNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('expiring-software-notification', (data) => {
      setNotifications(data);
    });

    return () => {
      socket.off('expiring-software-notification');
    };
  }, []);

  return (
    <div className="expiry-notifications">
      {notifications.map((software) => (
        <p key={software.id_software}>
          {software.nombre} (caduca el {software.fecha_caducidad})
        </p>
      ))}
    </div>
  );
};

export default ExpiryNotifications;
