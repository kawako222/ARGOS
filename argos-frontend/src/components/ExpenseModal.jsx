import React, { useState } from 'react';
import { X, DollarSign, FileText, Tag, Calendar as CalendarIcon } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose, onConfirm, initialData }) => {
  const [expenseData, setExpenseData] = useState({
    amount: initialData?.amount || '',
    description: initialData?.desc || '',
    category: initialData?.category || 'Operativo',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  // 👇 1. Detectamos si lo que estamos editando es un ingreso (pago de alumna)
  const isIncome = initialData?.type === 'income';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(expenseData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              {/* 👇 2. Título dinámico */}
              <h3 className="text-xl font-bold text-gray-900">
                {initialData ? (isIncome ? "Editar Ingreso" : "Editar Gasto") : "Registrar Nuevo Gasto"}
              </h3>
              {/* 👇 3. Subtítulo dinámico con colores */}
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isIncome ? "Entrada de Capital - Argos" : "Salida de Capital - Argos"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Monto */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monto (MXN)</label>
              <div className="relative mt-2">
                <div className={`absolute inset-y-0 left-4 flex items-center ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <DollarSign size={18} />
                </div>
                <input 
                  required
                  type="number" 
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  className={`w-full pl-12 pr-4 py-4 border-none rounded-2xl focus:ring-2 transition-all text-lg font-bold outline-none ${
                    isIncome 
                      ? 'bg-emerald-50/50 focus:ring-emerald-500 text-emerald-900' 
                      : 'bg-rose-50/30 focus:ring-rose-500 text-rose-900'
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Concepto */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Concepto / Descripción</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400"><FileText size={18} /></div>
                <input required type="text" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoría */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Tag size={14} /></div>
                  <select value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-xs font-bold outline-none appearance-none">
                    <option value="Clases">Clases</option>
                    <option value="Operativo">Operativo</option>
                    <option value="Sueldos">Sueldos</option>
                    <option value="Renta">Renta</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Vestuario">Vestuario</option>
                  </select>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-3 flex items-center text-gray-400"><CalendarIcon size={14} /></div>
                  <input type="date" value={expenseData.date} onChange={(e) => setExpenseData({...expenseData, date: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-xs font-bold outline-none" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full mt-4 py-4 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] ${
                isIncome 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' 
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
              }`}
            >
              {/* 👇 4. Botón dinámico */}
              {initialData ? "Guardar Cambios" : "Registrar Salida"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;