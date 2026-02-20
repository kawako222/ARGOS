import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle2, Search, Filter, BookOpen, User } from 'lucide-react';

const AttendanceTable = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendances = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/courses/all-attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAttendances(await res.json());
      }
    } catch (err) {
      console.error("Error cargando asistencias:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Filtrado simple por nombre de alumna o clase
  const filteredData = attendances.filter(a => 
    a.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Cargando bitácora de asistencias...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER Y BUSCADOR */}
      <div className="bg-white rounded-[2rem] p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif italic text-gray-900">Bitácora de Asistencias</h2>
          <p className="text-xs text-gray-400">Reporte global de actividad en la academia</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-300" size={16}/>
          <input 
            type="text" 
            placeholder="Buscar alumna o clase..." 
            className="w-full pl-10 p-2.5 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-argos-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE ASISTENCIAS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-5">Fecha</th>
                <th className="p-5">Alumna</th>
                <th className="p-5">Clase / Grupo</th>
                <th className="p-5">Maestro a Cargo</th>
                <th className="p-5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400">
                    No hay registros de asistencia que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredData.map(record => (
                  <tr key={record.attendance_id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(record.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {record.student_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{record.student_name}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <BookOpen size={14} className="text-argos-gold" /> {record.course_name}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={12}/> {record.teacher_name || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-100">
                        <CheckCircle2 size={14} /> Presente
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;