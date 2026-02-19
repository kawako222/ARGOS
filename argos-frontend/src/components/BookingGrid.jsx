import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const BookingGrid = ({ onBookingSuccess }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo para convertir nombres de días a números de JS (0=Domingo, 1=Lunes...)
  const dayMap = {
    "Domingo": 0, "Lunes": 1, "Martes": 2, "Miércoles": 3, 
    "Jueves": 4, "Viernes": 5, "Sábado": 6
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCourses(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN NINJA: Calcula la fecha del próximo día seleccionado
  const getNextDate = (dayName) => {
    const targetDay = dayMap[dayName];
    const now = new Date();
    const resultDate = new Date();
    
    // Calculamos cuántos días faltan
    resultDate.setDate(now.getDate() + (targetDay + (7 - now.getDay())) % 7);
    
    // Si el día es hoy pero ya pasó la hora (o es hoy mismo), podríamos saltar al siguiente 
    // pero por ahora, simplemente devolvemos la fecha YYYY-MM-DD
    return resultDate.toISOString().split('T')[0];
  };

  const handleBooking = async (courseId, dayName) => {
    const classDate = getNextDate(dayName);
    const token = localStorage.getItem('token');

    if (!confirm(`¿Quieres reservar para el día ${dayName} (${classDate})? Se descontará 1 crédito.`)) return;

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ courseId, classDate })
      });

      const data = await res.json();

      if (res.ok) {
        alert("¡Reserva confirmada! ✨");
        if (onBookingSuccess) onBookingSuccess(); // Para refrescar los créditos
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error en reserva:", error);
    }
  };

  if (loading) return <p className="text-gray-400">Cargando clases...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-yellow-600" /> Clases Disponibles para Reservar
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <div key={course.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{course.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Cupo: {course.capacity} alumnas máx.</p>
            
            <div className="space-y-3">
              {/* Iteramos sobre los días del JSON del horario */}
              {Object.entries(course.schedule || {}).map(([day, hour]) => (
                <div key={day} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">{day}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {hour}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleBooking(course.id, day)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition shadow-sm active:scale-95"
                  >
                    Reservar 🪙
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingGrid;