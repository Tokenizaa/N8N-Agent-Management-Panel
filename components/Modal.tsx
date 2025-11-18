import React from 'react';
import { ModalState } from '../types';

interface ModalProps extends ModalState {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', isDanger = false }) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const confirmButtonClasses = isDanger 
    ? 'bg-danger hover:bg-danger/80' 
    : 'bg-primary hover:bg-primary/80';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-surface-bright rounded-lg shadow-xl w-full max-w-md m-4 p-6 border border-surface"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-primary mb-4">{title}</h2>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-surface hover:bg-surface-bright/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${confirmButtonClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
