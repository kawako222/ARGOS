import React, { useState, useEffect } from 'react';
import { Coins, CalendarCheck, Clock } from 'lucide-react';

const StudentStats = () => {
  const [stats, setStats] = useState({ credits: 0, nextClass: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        // 1. Pedimos directamente NUESTRA info al nuevo endpoint /me
        const resUser = await fetch(`http://localhost:3000/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await resUser.json();

        // 2. Pedimos nuestras reservas
        const resBookings = await fetch('http://localhost:3000/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let next = null;
        if (resBookings.ok) {
            const bookings = await resBookings.json();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 3. Filtramos y ordenamos IGNORANDO las zonas horarias
            const future = bookings
                .filter(b => {
                    // Extraemos YYYY-MM-DD y creamos la fecha local exacta
                    const [y, m, d] = b.class_date.substring(0, 10).split('-');
                    const bDate = new Date(y, m - 1, d);
                    return bDate >= today;
                })
                .sort((a, b) => {
                    const [yA, mA, dA] = a.class_date.substring(0, 10).split('-');
                    const [yB, mB, dB] = b.class_date.substring(0, 10).split('-');
                    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
                });
                
            if (future.length > 0) next = future[0];
        }

        setStats({ 
            credits: userData.credits || 0, 
            nextClass: next 
        });

      } catch (error) {
        console.error("Error cargando stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
    </div>
  );

  // Función ayudante para renderizar la fecha sin desfase
  const renderCorrectDate = (dateString) => {
    const [y, m, d] = dateString.substring(0, 10).split('-');
    const correctDate = new Date(y, m - 1, d);
    return correctDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* TARJETA DE CRÉDITOS */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Coins size={20} />
            <span className="font-medium uppercase tracking-wider text-xs">Tu Saldo Argos</span>
          </div>
          <div className="text-5xl font-bold mb-1">{stats.credits}</div>
          <div className="text-sm opacity-90">Créditos disponibles</div>
        </div>
        <Coins size={120} className="absolute -right-6 -bottom-6 opacity-20 rotate-12" />
      </div>

      {/* TARJETA DE PRÓXIMA CLASE */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center border-l-4 border-l-purple-500">
        <div className="flex items-center gap-2 mb-4 text-gray-500">
            <CalendarCheck size={20} className="text-purple-600" />
            <span className="font-bold text-gray-700">Próxima Cita</span>
        </div>
        
        {stats.nextClass ? (
            <div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">{stats.nextClass.course_name}</h3>
                <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm bg-purple-50 w-fit px-3 py-1 rounded-full capitalize">
                    <Clock size={14} />
                    <span className="font-medium">
                        {/* Usamos la función ayudante aquí */}
                        {renderCorrectDate(stats.nextClass.class_date)}
                    </span>
                </div>
            </div>
        ) : (
            <div className="text-gray-400 text-sm italic">No tienes clases reservadas próximas.</div>
        )}
      </div>
    </div>
  );
};

export default StudentStats;