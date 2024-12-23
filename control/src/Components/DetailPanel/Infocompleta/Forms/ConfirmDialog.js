import React from 'react';
import './ConfirmDialog.css'; // Opcional: archivo para estilos personalizados

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="button-group">
          <button onClick={onConfirm} className="confirm-button">
            Sí
          </button>
          <button onClick={onCancel} className="cancel-button">
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
