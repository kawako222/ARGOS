import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const TeacherPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);

  const fetchMyPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Obtenemos quién soy
      const resMe = await fetch('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resMe.ok) {
        const userData = await resMe.json();
        
        // 2. Traemos mi nómina
        const resPayments = await fetch(`http://localhost:3000/api/users/${userData.id}/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resPayments.ok) {
          const data = await resPayments.json();
          setPayments(data);
          
          // Calculamos el total ganado
          const total = data.reduce((acc, curr) => acc + Math.abs(Number(curr.amount)), 0);
          setTotalEarned(total);
        }
      }
    } catch (error) {
      console.error("Error cargando finanzas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPayments();
  }, [fetchMyPayments]);

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Consultando estado de cuenta...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      
      {/* TARJETA DE RESUMEN */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-argos-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
            <Wallet size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-argos-gold">Mis Finanzas</h2>
            <p className="text-gray-400 text-sm">Historial de nómina y depósitos</p>
          </div>
        </div>

        <div className="text-center md:text-right z-10">
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Total Percibido</p>
          <p className="text-4xl font-bold flex items-center justify-center md:justify-end gap-2">
            <span className="text-argos-gold">$</span>{totalEarned.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      {/* LISTA DE PAGOS */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <TrendingUp size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-900">Historial de Recibos</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <DollarSign size={24} />
              </div>
              <p className="text-gray-500 font-medium">Aún no hay recibos de nómina registrados en esta cuenta.</p>
            </div>
          ) : (
            payments.map(pay => (
              <div key={pay.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl hover:bg-white border border-gray-100 hover:border-argos-gold hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm group-hover:text-argos-gold transition-colors">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{pay.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(pay.payment_date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 font-bold px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                  + ${Math.abs(pay.amount).toLocaleString('es-MX')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPayments;