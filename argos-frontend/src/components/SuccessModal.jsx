import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="text-green-500 mb-4 flex justify-center"><CheckCircle size={60} /></div>
        <h3 className="text-xl font-bold mb-2">¡Hecho!</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button onClick={onClose} className="w-full bg-black text-white py-3 rounded-xl font-bold">Cerrar</button>
      </div>
    </div>
  );
};
export default SuccessModal;