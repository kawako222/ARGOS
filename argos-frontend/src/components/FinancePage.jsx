import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, 
  Calendar, ArrowUpCircle, ArrowDownCircle, Filter, Edit3 , Trash2
} from 'lucide-react';
import ExpenseModal from './ExpenseModal';
import SuccessModal from './SuccessModal';

const FinancePage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMesNombre = (index) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[index];
  };

  const filteredTransactions = transactions.filter(t => {
    try {
      if (!t.date) return false;
      
      // 1. Limpiamos la fecha por si trae basura (como "T00:00:00Z")
      const fechaLimpia = t.date.split('T')[0]; 
      
      // 2. Extraemos el año y mes asegurándonos de que sean números
      const partesFecha = fechaLimpia.split('-');
      if (partesFecha.length < 2) return false;

      const transYear = parseInt(partesFecha[0], 10);
      const transMonth = parseInt(partesFecha[1], 10);

      // 3. Comparamos (Recuerda: selectedMonth empieza en 0 para Enero, por eso +1)
      return transYear === selectedYear && transMonth === (selectedMonth + 1);
    } catch (e) {
      console.error("Error filtrando fecha:", t.date,e);
      return false;
    }
  });

  const totalIncomes = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncomes - totalExpenses;

  // ✅ La lógica vive directamente en el useEffect, sin useCallback.
  // Esto elimina la cadena de dependencias que causaba el error.
  useEffect(() => {
    let isMounted = true;

    const fetchFinanceData = async () => {
        setIsLoading(true); 
        try {
            // 1. Sacamos la llave de acceso (token) de la "mochila" del navegador
            const token = localStorage.getItem('token');
            
            // 2. Le pasamos el token al "cadenero" en los Headers y ajustamos la ruta
            const [resPagos, resGastos] = await Promise.all([
            fetch('http://localhost:3000/api/users/payments', {
                headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
                }
            }).catch(err => { console.error("Error Fetch Pagos:", err); return { ok: false, status: 500 }; }),
            
            fetch('http://localhost:3000/api/users/expenses', {
                headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
                }
            }).catch(err => { console.error("Error Fetch Gastos:", err); return { ok: false, status: 500 }; })
            ]);

            console.log("Status de la respuesta Pagos:", resPagos.status);
            console.log("Status de la respuesta Gastos:", resGastos.status);

            // Si la respuesta fue exitosa (200), extraemos el JSON. Si no, dejamos un arreglo vacío.
            const pagosDB = resPagos.ok ? await resPagos.json() : [];
            const gastosDB = resGastos.ok ? await resGastos.json() : [];

            console.log("Lo que trajo la BD de Pagos:", pagosDB);

            // 3. Mapeamos los INGRESOS (Pagos de alumnas)
            const ingresos = pagosDB.map(pago => {
                const rawDate = pago.payment_date || pago.created_at || new Date().toISOString();
                const cleanDate = rawDate.split('T')[0];
                
                // 1. Convertimos el monto a número para analizarlo
                const montoReal = Number(pago.amount || pago.monto || 0);
                
                // 2. Detectamos si es un pago a un maestro (negativo)
                const esGasto = montoReal < 0;

                return {
                id: `in-${pago.id}`,
                date: cleanDate, 
                user: pago.student_name || pago.nombre_alumna || 'Academia Argos', 
                desc: pago.description || pago.concepto || 'Movimiento',
                
                // 👇 MAGIA VISUAL: Si es gasto, le cambiamos la etiqueta para que pinte en rojo
                category: esGasto ? 'Sueldos' : 'Clases', 
                type: esGasto ? 'expense' : 'income',     
                
                // 👇 Usamos Math.abs() para quitarle el símbolo negativo al número.
                // Como ya le pusimos type: 'expense', la tabla solita le pondrá el "-" y el color rojo.
                amount: Math.abs(montoReal)               
                };
            });

            // 4. Mapeamos los EGRESOS (Gastos de la academia)
            const egresos = gastosDB.map(gasto => {
                const rawDate = gasto.date || gasto.fecha || new Date().toISOString();
                const cleanDate = rawDate.split('T')[0];

                return {
                id: `ex-${gasto.id}`,
                date: cleanDate,
                user: 'Administración',
                desc: gasto.description || gasto.concepto,
                category: gasto.category || 'Operativo',
                type: 'expense',
                amount: Number(gasto.amount || 0)
                };
            });

            if (isMounted) {
            setTransactions([...ingresos, ...egresos]);
            setIsLoading(false);
            }
        } catch (error) {
            console.error("Error al sincronizar:", error);
            if (isMounted) setIsLoading(false);
        }
        };

    fetchFinanceData();

    return () => { isMounted = false; };
  }, [selectedMonth, selectedYear]); // ✅ Dependencias directas, sin pasar por useCallback

  const handleOpenNewExpense = () => {
    setEditingTransaction(null);
    setShowExpenseModal(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setShowExpenseModal(true);
  };

  const handleSaveTransaction = async (data) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...data, amount: Number(data.amount) } : t));
      setModalMessage("Registro actualizado correctamente. ✨");
    } else {
      const newTransaction = {
        id: Date.now(),
        date: data.date,
        user: 'Administración',
        desc: data.description,
        category: data.category,
        type: 'expense',
        amount: Number(data.amount)
      };
      setTransactions(prev => [newTransaction, ...prev]);
      setModalMessage("Gasto registrado correctamente. 💸");
    }
    setShowSuccessModal(true);
    setShowExpenseModal(false);
  };


  // ==========================================
  // FUNCIÓN PARA BORRAR DE LA BASE DE DATOS
  // ==========================================
  const handleDeleteTransaction = async (transaction) => {
    // 1. Confirmación de seguridad
    const esIngreso = transaction.type === 'income';
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar este ${esIngreso ? 'ingreso' : 'gasto'} por $${transaction.amount}? Esta acción no se puede deshacer.`);
    
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      
      // 2. Extraemos el ID real (le quitamos el "in-" o "ex-" que le pusimos para react)
      const realId = transaction.id.replace('in-', '').replace('ex-', '');
      
      // 3. Apuntamos a la ruta correcta dependiendo si es pago o gasto
      const endpoint = esIngreso 
        ? `http://localhost:3000/api/users/payments/${realId}`
        : `http://localhost:3000/api/users/expenses/${realId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // 4. Si el backend dice "OK", lo borramos de la pantalla al instante
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
        setModalMessage("Registro eliminado permanentemente. 🗑️");
        setShowSuccessModal(true);
      } else {
        alert("Hubo un problema al intentar borrar el registro.");
      }
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={modalMessage} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white shadow-sm animate-in slide-in-from-top-4 duration-700 fade-in">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Libro Contable</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Gestión financiera de la Academia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-100/50 hover:bg-white transition-colors">
            <Calendar size={18} className="text-gray-400 ml-2"/>
            
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none border-none focus:ring-0 cursor-pointer text-gray-700"
            >
              {[...Array(12)].map((_, i) => <option key={i} value={i}>{getMesNombre(i)}</option>)}
            </select>
            
            <span className="text-gray-300">/</span>
            
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none border-none focus:ring-0 cursor-pointer text-gray-700 pr-2"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <button 
            onClick={handleOpenNewExpense}
            className="flex-1 md:flex-none bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18}/> Nuevo Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both delay-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ingresos Totales</span>
          <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tighter">${totalIncomes.toLocaleString()}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both delay-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Egresos Totales</span>
          <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tighter">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both delay-300 hover:scale-[1.02] transition-transform">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance Neto</span>
          <p className="text-4xl font-bold text-white mt-2 tracking-tighter">${netBalance.toLocaleString()}</p>
          <Wallet size={120} className="absolute -right-6 -bottom-6 opacity-5 rotate-12" />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-sm border border-white overflow-hidden animate-in fade-in zoom-in-95 duration-700 fill-mode-both delay-500">
        <div className="p-6 border-b border-gray-50/50 flex justify-between items-center bg-white/50">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Filter size={16} className="text-gray-400"/> Movimientos del Periodo
          </h4>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium text-sm">Sincronizando con la bóveda de Argos...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Wallet size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Libro en blanco</h3>
              <p className="text-sm text-gray-400 mt-1">No hay registros para {getMesNombre(selectedMonth)} de {selectedYear}.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/30 text-[10px] uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="p-5 font-bold">Fecha</th>
                  <th className="p-5 font-bold">Concepto</th>
                  <th className="p-5 font-bold">Responsable</th>
                  <th className="p-5 font-bold text-right">Monto</th>
                  <th className="p-5 font-bold text-center">Ajustes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((t, index) => (
                  <tr 
                    key={t.id} 
                    className={`hover:bg-gray-50/80 transition-colors group animate-in slide-in-from-bottom-2 fade-in fill-mode-both`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="p-5 text-xs text-gray-500 font-mono">{t.date}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.type === 'income' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{t.desc}</p>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{t.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-600">{t.user}</td>
                    <td className={`p-5 text-right font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleEditClick(t)}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 size={16} />
                        
                      </button>
                      <td className="p-5 text-center flex items-center justify-center gap-1">
                        <button 
                            onClick={() => handleEditClick(t)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Editar"
                        >
                            <Edit3 size={16} />
                        </button>
                        
                        {/* 👇 NUEVO BOTÓN DE BORRAR 👇 */}
                        <button 
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                        </td>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ExpenseModal 
        key={editingTransaction ? `edit-${editingTransaction.id}` : 'new-expense'} 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)}
        onConfirm={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default FinancePage;
