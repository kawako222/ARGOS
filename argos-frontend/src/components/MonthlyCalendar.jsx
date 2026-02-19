import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, XCircle, Clock } from 'lucide-react';
import SuccessModal from './SuccessModal';
import ConfirmModal from './ConfirmModal';

const MonthlyCalendar = ({ onBookingSuccess }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resC, resB, resMe] = await Promise.all([
        fetch('http://localhost:3000/api/courses', { headers }),
        fetch('http://localhost:3000/api/bookings', { headers }),
        fetch('http://localhost:3000/api/users/me', { headers })
      ]);
      if (resC.ok) setCourses(await resC.json());
      if (resB.ok) setBookings(await resB.json());
      if (resMe.ok) {
        const me = await resMe.json();
        setUserCredits(me.credits);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getFmtDate = (date) => {
    if (!date) return null;
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const handleAction = (courseId, date, existingBookingId = null) => {
    if (existingBookingId) {
      setPendingCancelId(existingBookingId);
      setShowConfirm(true);
    } else {
      executeBooking(courseId, date);
    }
  };

  const executeBooking = async (courseId, date) => {
    if (userCredits <= 0) {
      alert("No tienes suficientes monedas 🪙");
      return;
    }
    const token = localStorage.getItem('token');
    const classDate = getFmtDate(date);

    const res = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ courseId, classDate })
    });

    if (res.ok) {
      setModalMsg("¡Clase reservada con éxito! Se descontó 1 moneda.");
      setShowSuccess(true);
      fetchData();
      if (onBookingSuccess) onBookingSuccess();
    }
  };

  const executeCancel = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/bookings/${pendingCancelId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      setShowConfirm(false);
      setModalMsg("Reserva cancelada. Tu moneda ha sido devuelta.");
      setShowSuccess(true);
      fetchData();
      if (onBookingSuccess) onBookingSuccess();
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1))
  );

  if (loading) return <div className="p-20 text-center animate-pulse font-serif italic text-gray-400">Preparando el escenario...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={modalMsg} />
      <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={executeCancel} message="Se cancelará tu lugar y se reembolsará tu moneda." />

      {/* HEADER ESTILO APPLE */}
      <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif italic capitalize">
            {new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(currentDate)}
            <span className="text-argos-gold ml-2">{currentDate.getFullYear()}</span>
          </h2>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-argos-gold font-bold text-sm border border-white/10 shadow-inner">
            🪙 {userCredits} Monedas
          </div>
          <div className="flex bg-white/5 rounded-xl p-1">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-lg transition"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-lg transition"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 border-b text-center text-[10px] font-bold text-gray-400 p-4 bg-gray-50/50 tracking-[0.2em]">
        {["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* CUERPO DEL CALENDARIO */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, idx) => {
          const dateStr = getFmtDate(date);
  
          // 1. DEFINIMOS EL BLOQUEO AQUÍ
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Limpiamos horas para comparar solo días
          const isPast = date && date < today; // ¿La fecha de este cuadro es menor a hoy?

          const dayName = date?.toLocaleDateString('es-MX', { weekday: 'long' });
          const capitalizedDay = dayName ? dayName.charAt(0).toUpperCase() + dayName.slice(1) : "";
          
          const classes = courses.filter(c => 
            c.schedule && 
            Array.isArray(c.schedule.days) && 
            c.schedule.days.includes(capitalizedDay)
          );

          return (
            <div key={idx} className={`min-h-[130px] border-r border-b border-gray-50 p-3 transition-all ${!date ? 'bg-gray-50/30' : isPast ? 'bg-gray-50/10' : 'hover:bg-argos-gold/5'}`}>
              {date && (
                <>
                  <span className={`text-xs font-bold ${date.toDateString() === new Date().toDateString() ? 'bg-argos-gold text-white px-2 py-1 rounded-lg' : 'text-gray-300'}`}>
                    {date.getDate()}
                  </span>

                  <div className="mt-2 space-y-2">
                    {classes.map(course => {
                      const booking = bookings.find(b => 
                        b.course_id === course.id && b.class_date.substring(0, 10) === dateStr
                      );

                      return (
                        <button
                          key={course.id}
                          /* 2. BLOQUEO EN EL CLICK Y EN EL ESTADO */
                          onClick={() => !isPast && handleAction(course.id, date, booking?.id)}
                          disabled={isPast && !booking} // Si es pasado y no reservé, se bloquea
                          className={`w-full text-[10px] p-2.5 rounded-xl font-bold flex flex-col gap-1 transition-all ${
                            booking 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                              : isPast 
                              ? 'bg-gray-100 text-gray-400 border-dashed border-gray-200 cursor-not-allowed opacity-50' 
                              : userCredits <= 0 
                              ? 'bg-gray-200 text-gray-400 grayscale'
                              : 'bg-white text-gray-700 border border-gray-100 hover:border-argos-gold hover:text-argos-gold'
                          }`}
                        >
                          <span className="truncate w-full text-left">{course.name}</span>
                          <div className="text-[8px] opacity-70 flex items-center gap-1">
                            <Clock size={8}/> {course.schedule.time}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;