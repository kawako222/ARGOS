import React, { useState } from 'react';import { 
  User, Calendar, Clock, CheckCircle2, Users, 
  ChevronRight, ClipboardCheck, Star, Award
} from 'lucide-react';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('hoy');
  const [selectedClass, setSelectedClass] = useState(null);
  const [teacherData] = useState({
    name: "Mtra. Alejandra Puebla",
    specialty: "Ballet Clásico & Puntas",
    totalClasses: 12,
    rating: 4.9
  });

  // Simulacro de datos de clases
  const classes = [
    { 
      id: 1, 
      name: "Ballet Intermedio", 
      time: "16:00 - 17:30", 
      date: "Hoy",
      room: "Salón Principal",
      students: [
        { id: 101, name: "Lucía Fernández", status: 'planned', attended: false },
        { id: 102, name: "María José Ruiz", status: 'planned', attended: false },
        { id: 103, name: "Ana Sofía García", status: 'planned', attended: false }
      ]
    },
    { 
      id: 2, 
      name: "Pre-Ballet", 
      time: "18:00 - 19:00", 
      date: "Hoy",
      room: "Salón B",
      students: [
        { id: 104, name: "Elena Gómez", status: 'planned', attended: false }
      ]
    },
    { 
      id: 3, 
      name: "Técnica de Varones", 
      time: "10:00 - 11:30", 
      date: "Mañana",
      room: "Salón Principal",
      students: [
        { id: 105, name: "Mateo S.", status: 'planned' },
        { id: 106, name: "Luis A.", status: 'planned' }
      ]
    }
  ];

  const handleAttendance = (classId, studentId) => {
    // Aquí conectarías con tu API para marcar asistencia
    console.log(`Marcando asistencia para alumno ${studentId} en clase ${classId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8 animate-in fade-in duration-500">
      
      {/* 1. PERFIL DEL MAESTRO */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-argos-gold rounded-full flex items-center justify-center text-3xl font-serif italic text-gray-900 border-4 border-white/10">
            {teacherData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-serif italic">{teacherData.name}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Award size={14} className="text-argos-gold"/> {teacherData.specialty}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl text-center border border-white/10">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Clases Mes</p>
            <p className="text-xl font-bold">{teacherData.totalClasses}</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl text-center border border-white/10">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Rating</p>
            <p className="text-xl font-bold flex items-center gap-1">{teacherData.rating} <Star size={14} className="fill-argos-gold text-argos-gold"/></p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 2. COLUMNA IZQUIERDA: LISTA DE CLASES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('hoy')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'hoy' ? 'text-gray-900 border-b-2 border-argos-gold' : 'text-gray-400'}`}
            >
              Clases de Hoy
            </button>
            <button 
              onClick={() => setActiveTab('proximas')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'proximas' ? 'text-gray-900 border-b-2 border-argos-gold' : 'text-gray-400'}`}
            >
              Próximas Sesiones
            </button>
          </div>

          <div className="grid gap-4">
            {classes
              .filter(c => activeTab === 'hoy' ? c.date === 'Hoy' : c.date !== 'Hoy')
              .map(cls => (
                <div 
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer flex justify-between items-center group ${selectedClass?.id === cls.id ? 'border-argos-gold ring-1 ring-argos-gold' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-argos-gold/10 group-hover:text-argos-gold transition-colors">
                      <Clock size={20}/>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{cls.name}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        {cls.time} • <Users size={12}/> {cls.students.length} Alumnas planeadas
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`transition-transform ${selectedClass?.id === cls.id ? 'rotate-90 text-argos-gold' : 'text-gray-300'}`} />
                </div>
              ))}
          </div>
        </div>

        {/* 3. COLUMNA DERECHA: ASISTENCIA Y RESERVAS */}
        <div className="lg:col-span-1">
          {selectedClass ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{selectedClass.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                  {selectedClass.date === 'Hoy' ? 'Pasar Asistencia' : 'Lista de Reservas'}
                </p>
              </div>
              
              <div className="p-6 space-y-3">
                {selectedClass.students.map(student => (
                  <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{student.name}</span>
                    </div>
                    
                    {selectedClass.date === 'Hoy' ? (
                      <button 
                        onClick={() => handleAttendance(selectedClass.id, student.id)}
                        className="p-2 text-gray-300 hover:text-emerald-500 transition-colors"
                      >
                        <ClipboardCheck size={24}/>
                      </button>
                    ) : (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold uppercase">Confirmada</span>
                    )}
                  </div>
                ))}
              </div>

              {selectedClass.date === 'Hoy' && (
                <div className="p-6 pt-0">
                  <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:bg-argos-gold transition-all">
                    Finalizar Clase
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users size={24}/>
              </div>
              <p className="text-sm font-medium">Selecciona una clase para ver a las alumnas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;