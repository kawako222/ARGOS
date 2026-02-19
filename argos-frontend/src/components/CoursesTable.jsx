import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, User, X, Copy, Edit3, Trash2, Users, Save, Clock } from 'lucide-react'; 

const CoursesTable = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 1. Agregamos day_of_week para que el select funcione
  const [formData, setFormData] = useState({
    name: '', 
    teacher_id: '', 
    schedule_time: '', // Solo la hora: "16:00 - 17:00"
    days: [], // Aquí guardaremos ['Lunes', 'Miércoles', etc.]
    capacity: 15
  });

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }));
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const [resCourses, resTeachers] = await Promise.all([
        fetch('http://localhost:3000/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resCourses.ok) setCourses(await resCourses.json());
      if (resTeachers.ok) {
        const allUsers = await resTeachers.json();
        setTeachers(allUsers.filter(u => u.role === 'MAESTRO' || u.role === 'ADMIN'));
      }
    } catch (err) {
      console.error("Error en carga:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Un solo useEffect es suficiente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
  e.preventDefault(); // Solo una vez al inicio
  const token = localStorage.getItem('token');

  // Validación: Al menos un día seleccionado
  if (formData.days.length === 0) {
    return alert("⚠️ Selecciona al menos un día para la clase.");
  }

  try {
    // 1. Construimos el cuerpo del mensaje (Body)
    const body = { 
      name: formData.name,
      teacher_id: formData.teacher_id,
      // Aquí consolidamos la información en el formato JSONB
      schedule: {
        days: formData.days,      // El array de los checkboxes
        time: formData.schedule_time // El texto del horario
      },
      capacity: parseInt(formData.capacity)
    };

    const url = isEditing 
      ? `http://localhost:3000/api/courses/${editingId}`
      : 'http://localhost:3000/api/courses';
    
    // 2. Ejecutamos la petición
    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(isEditing ? "✨ Clase actualizada correctamente" : "🚀 Clase publicada con éxito");
      resetForm(); // Limpia el formulario y cierra el modal
      fetchData(); // Recarga la lista de clases
    } else {
      const errorData = await res.json();
      alert(`❌ Error: ${errorData.error || 'No se pudo guardar la clase'}`);
    }
  } catch (error) {
    console.error("Error en handleSubmit:", error);
    alert("📡 Error de conexión con el servidor.");
  }
};

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta clase?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setFormData({
      name: course.name,
      teacher_id: String(course.teacher_id),
      days: course.schedule?.days || [],
      schedule_time: course.schedule?.time || '',
      capacity: course.capacity
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    // 👇 AQUÍ ESTABA EL TRUCO: Hay que inicializar days como array vacío
    setFormData({ 
      name: '', 
      teacher_id: '', 
      days: [], // <--- ¡No olvides este!
      schedule_time: '', 
      capacity: 15 
    });
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Sincronizando horarios de Argos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif italic text-gray-900">Gestión de Clases</h2>
          <p className="text-sm text-gray-500">Organiza el calendario académico</p>
        </div>
        <button 
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-argos-gold hover:scale-105 transition-all shadow-lg"
        >
          {showForm ? <X size={20}/> : <Plus size={20}/>}
          {showForm ? "Cancelar" : "Nueva Clase"}
        </button>
      </div>

      {/* FORMULARIO ANIMADO (Efecto Smooth) */}
      {showForm && (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre de la Clase</label>
              <input 
                required
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-argos-gold outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Capacidad</label>
              <input 
                type="number"
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-argos-gold outline-none"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Maestro</label>
              <select 
                required
                className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm outline-none"
                value={formData.teacher_id}
                onChange={e => setFormData({...formData, teacher_id: e.target.value})}
              >
                <option value="">Seleccionar maestro...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Días de Clase</label>
              <div className="flex flex-wrap gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                  <label 
                    key={day} 
                    className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      /* 👇 Agregamos (formData.days || []) para que nunca sea undefined */
                      (formData.days || []).includes(day) 
                        ? 'bg-argos-gold text-white border-argos-gold shadow-md' 
                        : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      /* 👇 Lo mismo aquí */
                      checked={(formData.days || []).includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Horario</label>
              <input 
                placeholder="16:00 - 18:00"
                className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-argos-gold"
                /* 👇 IMPORTANTE: Asegúrate de que apunte a schedule_time */
                value={formData.schedule_time} 
                onChange={e => setFormData({...formData, schedule_time: e.target.value})}
              />
            </div>
            <button type="submit" className="md:col-span-3 bg-argos-gold text-white py-4 rounded-2xl font-bold hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2">
              <Save size={20}/> {isEditing ? "Guardar Cambios" : "Publicar Clase"}
            </button>
          </form>
        </div>
      )}

      {/* GRID DE CLASES CON ANIMACIÓN ESCALONADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <div 
            key={course.id} 
            style={{ animationDelay: `${index * 100}ms` }}
            className="group bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-50 text-argos-gold rounded-2xl">
                <Calendar size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(course)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-900">{course.name}</h4>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={12} className="text-argos-gold" /> 
              
              {/* Renderizado inteligente del horario */}
              <span className="font-bold text-gray-700">
                {Array.isArray(course.schedule?.days) 
                  ? course.schedule.days.join(', ') 
                  : 'Días pendientes'}
              </span>

              <span className="mx-1 text-gray-300">•</span>

              <span className="text-gray-500 italic">
                {course.schedule?.time || 'Horario no definido'}
              </span>
            </p>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Users size={14}/> {course.capacity} cupos
              </div>
              <span className="text-gray-400 italic font-serif">{course.teacher_name || 'Sin maestro'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesTable;