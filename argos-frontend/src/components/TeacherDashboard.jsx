import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Calendar, Clock, CheckCircle2, Users, 
  ChevronRight, ClipboardCheck, Star, Award, Check
} from 'lucide-react';

const TeacherDashboard = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [teacherData, setTeacherData] = useState(null);
  const [todaysClasses, setTodaysClasses] = useState([]); // 👈 Solo clases de hoy
  
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classFinalized, setClassFinalized] = useState(false); // 👈 Para bloquear la clase terminada

  // 🛠️ Función para extraer el horario
  const formatSchedule = (scheduleData) => {
    if (!scheduleData) return 'Horario por definir';
    try {
      const parsed = typeof scheduleData === 'string' ? JSON.parse(scheduleData) : scheduleData;
      if (parsed && parsed.time) {
        const days = parsed.days ? parsed.days.join(', ') : '';
        return `${days} • ${parsed.time}`;
      }
      return 'Horario por definir';
    } catch (e) {
      console.log(e);
      return 'Horario por definir';
    }
  };

  const fetchTeacherInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const resMe = await fetch('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resMe.ok) {
        const userData = await resMe.json();
        setTeacherData(userData);

        const resClasses = await fetch('http://localhost:3000/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resClasses.ok) {
          const allCourses = await resClasses.json();
          
          // 1. Filtramos solo los cursos de ESTE maestro
          const myClasses = allCourses.filter(c => c.teacher_id === userData.id);
          
          // 2. Filtramos SOLO las clases de HOY
          const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const hoyTexto = diasSemana[new Date().getDay()]; // Ej: "Viernes"
          
          const clasesDeHoy = myClasses.filter(c => {
            try {
              const sched = typeof c.schedule === 'string' ? JSON.parse(c.schedule) : c.schedule;
              return sched?.days?.includes(hoyTexto);
            } catch (e) { 
              console.log(e);
              return false; }
          });

          setTodaysClasses(clasesDeHoy);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del maestro:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherInfo();
  }, [fetchTeacherInfo]);

  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    setLoadingStudents(true);
    setClassFinalized(false); // Reiniciamos el estado de finalizado
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/courses/${cls.id}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const studentsWithAttendance = data.map(s => ({ ...s, attended: s.attended_today || false }));
        setClassStudents(studentsWithAttendance);
      } else {
        setClassStudents([]); 
      }
    } catch (error) {
      console.log(error);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 👇 AHORA SOLO CAMBIA EL COLOR EN PANTALLA (No guarda en BD aún) 👇
  const handleAttendance = (studentId) => {
    if (classFinalized) return; // Si ya se finalizó la clase, no dejamos cambiar nada
    
    setClassStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, attended: !s.attended } : s
    ));
  };

  // 👇 NUEVO: BOTÓN FINALIZAR CLASE (Guarda todo de golpe) 👇
  const handleFinalizeClass = async () => {
    const confirm = window.confirm("¿Seguro que deseas finalizar la clase? Esto cerrará el registro de asistencia de hoy.");
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/courses/finalize-attendance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          course_id: selectedClass.id, 
          date: new Date().toISOString().split('T')[0],
          students: classStudents // Mandamos todo el arreglo de alumnas
        })
      });

      if (res.ok) {
        setClassFinalized(true);
        alert("¡Clase finalizada y registro guardado con éxito! ✅");
      } else {
        alert("Hubo un error al guardar el registro.");
      }
    } catch (error) {
      console.error("Error al finalizar:", error);
      alert("Error de conexión al finalizar la clase.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Cargando tu panel docente...</div>;
  if (!teacherData) return <div className="p-20 text-center text-rose-500">Error de identidad.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* PERFIL DEL MAESTRO */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-argos-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-6 z-10">
          <div className="w-20 h-20 bg-argos-gold rounded-full flex items-center justify-center text-3xl font-serif italic text-gray-900 border-4 border-white/10 shadow-lg">
            {teacherData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-serif italic">{teacherData.name}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Award size={14} className="text-argos-gold"/> {teacherData.role === 'ADMIN' ? 'Dirección General' : 'Cuerpo Docente Argos'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 z-10">
          <div className="bg-white/5 px-6 py-3 rounded-2xl text-center border border-white/10">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Clases Hoy</p>
            <p className="text-xl font-bold">{todaysClasses.length}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LISTA DE CLASES DE HOY */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button className="pb-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-argos-gold">
              Mis Clases de Hoy
            </button>
          </div>

          <div className="grid gap-4">
            {todaysClasses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-400 font-medium">No tienes clases asignadas para el día de hoy. ¡Disfruta tu día!</p>
              </div>
            ) : (
              todaysClasses.map(cls => (
                <div 
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)} 
                  className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer flex justify-between items-center group ${selectedClass?.id === cls.id ? 'border-argos-gold ring-1 ring-argos-gold' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-argos-gold/10 group-hover:text-argos-gold transition-colors">
                      <Clock size={20}/>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{cls.name || cls.title}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        {formatSchedule(cls.schedule)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`transition-transform ${selectedClass?.id === cls.id ? 'rotate-90 text-argos-gold' : 'text-gray-300'}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ASISTENCIA Y RESERVAS */}
        <div className="lg:col-span-1">
          {selectedClass ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 flex flex-col h-full">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{selectedClass.name || selectedClass.title}</h3>
                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                  Lista de Asistencia
                </p>
              </div>
              
              <div className="p-6 space-y-3 flex-1 overflow-y-auto min-h-[300px] max-h-[400px]">
                {loadingStudents ? (
                  <p className="text-center text-xs text-gray-400 py-6 animate-pulse">Consultando lista de alumnas...</p>
                ) : classStudents.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">No hay alumnas registradas para hoy.</p>
                ) : (
                  classStudents.map(student => (
                    <div 
                      key={student.id} 
                      className={`flex justify-between items-center p-4 rounded-2xl transition-all border ${
                        student.attended 
                          ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border-transparent hover:border-gray-100 hover:bg-white'
                      } ${classFinalized ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${student.attended ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className={`text-sm font-medium transition-colors ${student.attended ? 'text-emerald-900' : 'text-gray-700'}`}>
                            {student.name}
                          </span>
                          {student.attended && <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Presente</p>}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleAttendance(student.id)}
                        disabled={classFinalized}
                        className={`p-2 rounded-xl transition-all ${
                          student.attended 
                            ? 'text-emerald-600 bg-emerald-100 shadow-inner' 
                            : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        <ClipboardCheck size={24}/>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* 👇 BOTÓN FINALIZAR MAGICO 👇 */}
              {classStudents.length > 0 && (
                <div className="p-6 pt-4 border-t border-gray-50 bg-white">
                  <button 
                    onClick={handleFinalizeClass}
                    disabled={classFinalized}
                    className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                      classFinalized 
                        ? 'bg-emerald-500 text-white cursor-not-allowed' 
                        : 'bg-gray-900 text-white hover:bg-argos-gold'
                    }`}
                  >
                    {classFinalized ? <><Check size={18}/> Clase Finalizada</> : 'Finalizar Clase y Guardar'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center text-gray-400 min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users size={24}/>
              </div>
              <p className="text-sm font-medium">Selecciona una clase para ver a las alumnas inscritas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;