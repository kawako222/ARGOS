import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, DollarSign, Plus, X, Briefcase, Copy, KeyRound, 
  Pencil, Mail, ShieldCheck, History 
} from 'lucide-react';

const TeachersTable = () => {
  // 1. ESTADOS PRINCIPALES
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('expediente'); // 'expediente' o 'nomina'

  // 2. ESTADOS DE FORMULARIOS
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', email: '', password: '', monthly_salary: 0, role: 'MAESTRO' 
  });
  const [editData, setEditData] = useState({
    name: '', email: '', password: '', monthly_salary: 0, role: 'MAESTRO'
  });
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '' });

  // 3. FUNCIONES DE CARGA (API)
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const allUsers = await res.json();
        setTeachers(allUsers.filter(u => u.role === 'MAESTRO' || u.role === 'ADMIN'));
      }
    } catch (err) {
      console.error("Error cargando maestros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayments = async (teacherId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/users/${teacherId}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPaymentHistory(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  // 4. HANDLERS DE INTERACCIÓN
  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowCreate(false);
    setActiveTab('expediente');
    setEditData({
      name: teacher.name || '',
      email: teacher.email || '',
      password: '', // Vacío por seguridad
      monthly_salary: teacher.monthly_salary || 0,
      role: teacher.role || 'MAESTRO'
    });
    fetchPayments(teacher.id);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        alert("¡Staff registrado con éxito!");
        setShowCreate(false);
        setNewTeacher({ name: '', email: '', password: '', monthly_salary: 0, role: 'MAESTRO' });
        fetchData(); // Recarga sin refrescar la página completa
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/users/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        alert("Expediente de staff actualizado");
        fetchData();
        setSelectedTeacher(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddPayment = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user_id: selectedTeacher.id, ...newPayment })
      });
      if (res.ok) {
        alert("Constancia de pago generada");
        setNewPayment({ amount: '', description: '' });
        fetchPayments(selectedTeacher.id);
      }
    } catch (err) { console.error(err); }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewTeacher({ ...newTeacher, password: pass });
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Consultando nómina de Argos...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ========================================= */}
      {/* 1. SECCIÓN PRINCIPAL: LISTA DE MAESTROS   */}
      {/* ========================================= */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif italic text-gray-900">Cuerpo Docente</h2>
            <p className="text-sm text-gray-500">Gestión de sueldos y personal administrativo</p>
          </div>
          <button 
            onClick={() => { setShowCreate(!showCreate); setSelectedTeacher(null); }}
            className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-argos-gold hover:scale-105 transition-all shadow-lg"
          >
            {showCreate ? <X size={18}/> : <Plus size={18}/>}
            {showCreate ? "Cancelar" : "Añadir Staff"}
          </button>
        </div>

        {/* FORMULARIO DE REGISTRO (Mantuve tu diseño original) */}
        {showCreate && (
          <form onSubmit={handleCreate} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top duration-300">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre</label>
              <input className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-argos-gold outline-none" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email</label>
              <input type="email" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-argos-gold outline-none" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Contraseña</label>
                <button type="button" onClick={generatePassword} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"><KeyRound size={10}/> Generar</button>
              </div>
              <div className="relative">
                <input className="w-full p-3 pr-10 bg-gray-50 rounded-xl border-none font-mono text-sm outline-none focus:ring-2 focus:ring-argos-gold" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} required />
                <button type="button" onClick={() => { navigator.clipboard.writeText(newTeacher.password); alert("Copiada"); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-900"><Copy size={14}/></button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sueldo Base ($)</label>
              <input type="number" className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-green-700 outline-none focus:ring-2 focus:ring-green-400" value={newTeacher.monthly_salary} onChange={e => setNewTeacher({...newTeacher, monthly_salary: e.target.value})} required />
            </div>
            <button type="submit" className="md:col-span-4 bg-argos-gold text-white py-4 rounded-2xl font-bold hover:brightness-110 transition shadow-md">Confirmar Contratación</button>
          </form>
        )}

        {/* LISTADO DE STAFF (Tarjetas con botón de editar) */}
        <div className="grid gap-4">
          {teachers.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-argos-gold/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-inner shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {t.role}
                    </span>
                    <p className="text-xs text-gray-400">{t.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-[9px] uppercase text-gray-400 font-bold mb-0.5 tracking-tighter">Sueldo Asignado</p>
                  <div className="flex items-center justify-end gap-1 text-gray-700 font-bold text-lg">
                    <span className="text-sm text-gray-400">$</span>{t.monthly_salary || '0.00'}
                  </div>
                </div>
                <button 
                  onClick={() => handleSelectTeacher(t)}
                  className="bg-gray-50 hover:bg-gray-900 text-gray-600 hover:text-white p-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Pencil size={16}/> <span className="text-xs font-bold hidden sm:inline">Gestionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. PANEL LATERAL: EDICIÓN Y NÓMINA        */}
      {/* ========================================= */}
      {selectedTeacher && (
        <div className="w-full lg:w-[450px] bg-white border border-gray-100 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* HEADER DEL PANEL */}
          <div className="p-6 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-widest text-argos-gold font-bold">Expediente Docente</span>
              <button onClick={() => setSelectedTeacher(null)}><X size={20}/></button>
            </div>
            <h3 className="text-2xl font-serif italic">{selectedTeacher.name}</h3>
          </div>

          {/* TABS DE NAVEGACIÓN */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('expediente')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'expediente' ? 'text-gray-900 border-b-2 border-argos-gold bg-gray-50/50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Datos Generales
            </button>
            <button 
              onClick={() => setActiveTab('nomina')}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'nomina' ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Nómina y Pagos
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            
            {/* PESTAÑA: EXPEDIENTE (Edición) */}
            {activeTab === 'expediente' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-300" size={16}/>
                      <input className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-argos-gold" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-300" size={16}/>
                      <input className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-argos-gold" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Sueldo Mensual ($)</label>
                      <input type="number" className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm font-bold text-green-700 outline-none focus:ring-2 focus:ring-green-400" value={editData.monthly_salary} onChange={e => setEditData({...editData, monthly_salary: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Rol de Sistema</label>
                      <select className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm outline-none" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}>
                        <option value="MAESTRO">Maestro</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-blue-600 block mb-1">Restablecer Contraseña (Opcional)</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 text-blue-200" size={16}/>
                      <input type="password" placeholder="Escriba para cambiar..." className="w-full pl-10 p-3 bg-blue-50/50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-blue-400" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button onClick={handleUpdate} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-argos-gold transition-all shadow-xl mt-4">
                  <ShieldCheck size={18}/> Actualizar Expediente
                </button>
              </div>
            )}

            {/* PESTAÑA: NÓMINA (Pagos) */}
            {activeTab === 'nomina' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-4 flex items-center gap-2">
                    <Briefcase size={14}/> Generar Constancia de Pago
                  </h4>
                  <div className="space-y-3">
                    <input type="number" placeholder="Monto depositado ($)" className="w-full p-3 rounded-xl border-none text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
                    <input type="text" placeholder="Concepto (ej: Quincena 1 - Marzo)" className="w-full p-3 rounded-xl border-none text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400" value={newPayment.description} onChange={e => setNewPayment({...newPayment, description: e.target.value})} />
                    <button onClick={handleAddPayment} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                      Registrar Depósito
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Historial de Depósitos</h4>
                  {paymentHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No hay pagos registrados para este maestro.</p>
                  ) : (
                    paymentHistory.map(pay => (
                      <div key={pay.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{pay.description}</p>
                          <p className="text-[10px] text-gray-400">{new Date(pay.payment_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-blue-600 font-bold text-sm">
                          $ {pay.amount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersTable;