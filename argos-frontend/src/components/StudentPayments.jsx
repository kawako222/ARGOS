import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, History, CalendarDays } from 'lucide-react';

const StudentPayments = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token');
      try {
        // Usamos el mismo endpoint que usa el admin para ver los pagos de un usuario
        const res = await fetch(`http://localhost:3000/api/users/${userId}/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Ordenamos para que el pago más reciente salga primero
          setPayments(data.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
        }
      } catch (err) {
        console.error("Error cargando pagos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPayments();
  }, [userId]);

  // --- LÓGICA DE FECHAS Y VENCIMIENTOS ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonthName = monthNames[currentMonth];

  // Verificamos si existe algún pago que se haya hecho este mes y este año
  const hasPaidThisMonth = payments.some(p => {
    if (!p.payment_date || !p.description) return false;
    
    // Convertimos de forma segura
    const pDate = new Date(p.payment_date);
    if (isNaN(pDate.getTime())) return false;

    // ¿Es el mes y año correcto?
    const isThisMonth = pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    
    // ¿El concepto dice "Mensualidad"? (ignorando mayúsculas)
    const isTuition = p.description.toLowerCase().includes('mensualidad');
    
    return isThisMonth && isTuition;
  });

  // Función ayudante para formatear fechas sin viajar a 1969
    const renderCorrectDate = (dateString) => {
        if (!dateString) return 'Fecha no registrada';
        
        // Si viene completa con horas (ej. 2026-02-19T14:30:00Z)
        const dateObj = new Date(dateString);
        
        // Si es inválida (NaN), mostramos error en vez de 1969
        if (isNaN(dateObj.getTime())) return 'Fecha inválida';

        // Para evitar desfases de zona horaria, usamos UTC explícito si viene corta (ej. 2026-02-19)
        if (dateString.length === 10) {
        const [y, m, d] = dateString.split('-');
        return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }

        // Si todo está bien, la mostramos local
        return dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

  const isLate = currentDay > 10; // Si ya pasó del día 10, está atrasada

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic font-serif">Revisando estado de cuenta...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div>
        <h2 className="text-2xl font-serif italic text-gray-900">Mis Pagos</h2>
        <p className="text-sm text-gray-500">Consulta tus mensualidades y estado de cuenta</p>
      </div>

      {/* ========================================= */}
      {/* TARJETA DINÁMICA DE ESTADO (El Semáforo)  */}
      {/* ========================================= */}
      {!hasPaidThisMonth ? (
        // ESTADO: PENDIENTE O ATRASADO
        <div className={`p-6 rounded-[2rem] border shadow-sm flex items-start gap-4 transition-all duration-500 ${
          isLate 
            ? 'bg-red-50 border-red-100 text-red-900' // Rojo si ya pasó del 10
            : 'bg-orange-50 border-orange-100 text-orange-900' // Naranja del 1 al 10
        }`}>
          <div className={`p-3 rounded-2xl shrink-0 ${isLate ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">
              {isLate ? 'Mensualidad Vencida' : 'Mensualidad Pendiente'}
            </h3>
            <p className={`text-sm ${isLate ? 'text-red-700' : 'text-orange-700'}`}>
              {isLate 
                ? `La fecha límite para pagar tu mensualidad de ${currentMonthName} fue el 10 de ${currentMonthName}. Por favor, acércate a administración.`
                : `Recuerda que tienes del 1 al 10 de ${currentMonthName} para cubrir tu colegiatura de este mes.`
              }
            </p>
          </div>
        </div>
      ) : (
        // ESTADO: PAGADO
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] shadow-sm flex items-start gap-4 transition-all duration-500">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900 mb-1">¡Todo al corriente!</h3>
            <p className="text-sm text-emerald-700">
              Gracias por tu puntualidad. Tu mensualidad de {currentMonthName} ya está registrada en el sistema.
            </p>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* HISTORIAL DE PAGOS                        */}
      {/* ========================================= */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <History size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-800">Historial de Transacciones</h3>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm">Aún no tienes pagos registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map(pay => (
              <div key={pay.id} className="p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 text-gray-500 p-3 rounded-xl hidden sm:block">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm md:text-base capitalize">
                      {pay.description || 'Mensualidad'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {/* 👇 AQUI USAMOS LA FUNCIÓN PARA ELIMINAR EL BUG DE 1969 */}
                      {renderCorrectDate(pay.payment_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1 inline-block">
                    Completado
                  </span>
                  <p className="font-bold text-gray-900 text-lg flex items-center justify-end gap-1">
                    <span className="text-sm text-gray-400">$</span>{pay.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default StudentPayments;