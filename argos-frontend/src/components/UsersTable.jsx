import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Ruler, Award, CreditCard, Save, X, Plus, 
  KeyRound, Copy, Pencil, Mail, ShieldCheck, History, DollarSign 
} from 'lucide-react';
import SuccessModal from './SuccessModal';
import ConfirmModal from './ConfirmModal'; 
import RecargaModal from './RecargaModal';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('expediente');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '' });
  const [showRecargaModal, setShowRecargaModal] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'ALUMNA' });
  const [editData, setEditData] = useState({
    name: '', email: '', password: '', plan_type: '', 
    role_assignment: '', measurements: { busto: '', cintura: '', cadera: '', talla: '' }
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const fetchPayments = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/users/${userId}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setPaymentHistory(await res.json());
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // CORRECCIÓN: Nombre de función sincronizado con el botón del JSX
  const handleQuickTuition = () => {
    setShowRecargaModal(true);
  };

  const handleConfirmRecarga = async (tuitionAmount, coinsToGive) => {
    setShowRecargaModal(false);
    const currentMonth = new Date().toLocaleString('es-MX', { month: 'long' });
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:3000/api/users/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          user_id: selectedUser.id, 
          amount: tuitionAmount, 
          description: `Mensualidad ${currentMonth}`, 
          add_credits: coinsToGive,
          payment_date: new Date().toISOString() 
        })
      });
      
      if (res.ok) {
        setModalMessage(`¡Mensualidad de ${currentMonth} cobrada! Se recargaron ${coinsToGive} monedas a ${selectedUser.name}. ✨`);
        setShowSuccessModal(true);
        fetchPayments(selectedUser.id);
        fetchData(); // Refrescar tabla para ver nuevos balances si existen
      }
    } catch (err) { console.error(err); }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowCreateForm(false);
    setActiveProfileTab('expediente');
    setEditData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      plan_type: user.plan_type || '',
      role_assignment: user.role_assignment || '',
      measurements: user.measurements || { busto: '', cintura: '', cadera: '', talla: '' }
    });
    fetchPayments(user.id);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setModalMessage(`¡La alumna ${newUser.name} ha sido registrada con éxito! ✨`);
        setShowSuccessModal(true);
        setNewUser({ name: '', email: '', password: '', role: 'ALUMNA' });
        setShowCreateForm(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setModalMessage("El perfil de la alumna se ha actualizado correctamente. ✨");
        setShowSuccessModal(true);
        fetchData();
        setSelectedUser(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddPayment = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/users/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          user_id: selectedUser.id, 
          ...newPayment,
          payment_date: new Date().toISOString() 
        })
      });
      if (res.ok) {
        setModalMessage("Pago extra registrado correctamente en el historial. 💸");
        setShowSuccessModal(true);
        setNewPayment({ amount: '', description: '' });
        fetchPayments(selectedUser.id); 
      }
    } catch (err) { console.error(err); }
  };

  const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
      let pass = "";
      for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setNewUser({ ...newUser, password: pass });
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic">Cargando alumnado de Argos...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        message={modalMessage} 
      />

      {/* CORRECCIÓN: Se añade 'key' para evitar el error de setState en el efecto del modal */}
      <RecargaModal 
        key={selectedUser ? `recarga-${selectedUser.id}-${showRecargaModal}` : 'recarga-none'}
        isOpen={showRecargaModal} 
        onClose={() => setShowRecargaModal(false)} 
        onConfirm={handleConfirmRecarga}
        userPlan={selectedUser?.plan_type}
      />

      {/* SECCIÓN PRINCIPAL: TABLA */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div>
            <h2 className="text-xl font-bold font-serif italic text-gray-900">Alumnas</h2>
            <p className="text-xs text-gray-400">Gestiona perfiles, medidas y accesos</p>
          </div>
          <button 
            onClick={() => { setShowCreateForm(!showCreateForm); setSelectedUser(null); }} 
            className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-argos-gold transition-all hover:scale-105 flex items-center gap-2"
          >
            {showCreateForm ? <X size={16}/> : <Plus size={16}/>}
            {showCreateForm ? "Cancelar" : "Nueva Alumna"}
          </button>
        </div>

        {showCreateForm && (
          <div className="p-6 bg-blue-50/30 border-b border-blue-100 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleCreateUser} className="grid md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Nombre</label>
                <input required className="w-full p-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Correo</label>
                <input required type="email" className="w-full p-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase">Contraseña</label>
                  <button type="button" onClick={generatePassword} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"><KeyRound size={10}/> Generar</button>
                </div>
                <div className="relative">
                  <input required className="w-full p-2.5 pr-10 bg-white border border-blue-100 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none text-blue-900" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(newUser.password); alert("Contraseña copiada"); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600"><Copy size={14}/></button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">Registrar Alumna</button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-5">Alumna</th>
                <th className="p-5">Plan / Papel</th>
                <th className="p-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.filter(u => u.role === 'ALUMNA').map(user => (
                <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-white shadow-sm font-bold group-hover:border-argos-gold transition-all text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                        <p className="text-[11px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-xs font-bold text-argos-gold uppercase tracking-tighter">{user.plan_type || 'Sin plan'}</p>
                    <p className="text-[11px] text-gray-400 italic font-serif">{user.role_assignment || 'Sin papel'}</p>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleSelectUser(user)} className="inline-flex items-center gap-2 text-xs bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                      <Pencil size={12}/> Editar Perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL LATERAL */}
      {selectedUser && (
        <div className="w-full lg:w-[400px] bg-white border border-gray-100 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-50">
            <h3 className="text-xl font-serif italic text-gray-900">{selectedUser.name}</h3>
            <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-gray-900 transition-colors"><X size={24}/></button>
          </div>

          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setActiveProfileTab('expediente')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeProfileTab === 'expediente' 
                  ? 'text-argos-gold border-b-2 border-argos-gold bg-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Expediente
            </button>
            <button 
              onClick={() => setActiveProfileTab('pagos')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeProfileTab === 'pagos' 
                  ? 'text-green-600 border-b-2 border-green-500 bg-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Pagos
            </button>
          </div>

          <div className="p-8 overflow-y-auto flex-1 space-y-6">
            
            {activeProfileTab === 'expediente' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Datos de Acceso</p>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-300" size={16}/>
                      <input className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-argos-gold" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Email Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-300" size={16}/>
                      <input className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-argos-gold" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Detalles de Academia</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Plan</label>
                      <select className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs" value={editData.plan_type} onChange={(e) => setEditData({...editData, plan_type: e.target.value})}>
                        <option value="">Sin asignar...</option>
                        <option value="Paquete 1">Paquete 1</option>
                        <option value="Paquete 2">Paquete 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Papel</label>
                      <input className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs" value={editData.role_assignment} onChange={(e) => setEditData({...editData, role_assignment: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Medidas Vestuario</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['busto', 'cintura', 'cadera', 'talla'].map((med) => (
                      <div key={med}>
                        <label className="text-[9px] font-bold text-gray-400 uppercase text-center block">{med}</label>
                        <input className="w-full p-2 bg-gray-50 rounded-lg border-none text-center text-xs" value={editData.measurements[med]} onChange={e => setEditData({...editData, measurements: {...editData.measurements, [med]: e.target.value}})} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleUpdateUser} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-argos-gold transition-all shadow-xl mt-4">
                  <ShieldCheck size={18}/> Actualizar Expediente
                </button>
              </div>
            )}

            {activeProfileTab === 'pagos' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-yellow-900 capitalize">
                      Mensualidad de {new Date().toLocaleString('es-MX', { month: 'long' })}
                    </h4>
                    <p className="text-[10px] text-yellow-700 uppercase tracking-wider mt-1">
                      Plan actual: <span className="font-bold">{editData.plan_type || 'Sin plan'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={handleQuickTuition}
                    className="bg-argos-gold text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 hover:scale-105 transition-all shadow-md shadow-yellow-200"
                  >
                    Cobrar y Recargar
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <DollarSign size={14}/> Otros Conceptos Extras
                  </h4>
                  <div className="space-y-3">
                    <input type="number" placeholder="Monto ($)" className="w-full p-3 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-gray-300" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
                    <input type="text" placeholder="Ej: Vestuario, Inscripción..." className="w-full p-3 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-gray-300" value={newPayment.description} onChange={e => setNewPayment({...newPayment, description: e.target.value})} />
                    <button onClick={handleAddPayment} className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition shadow-md">
                      Registrar Cargo Extra
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Historial</h4>
                  {paymentHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No hay pagos registrados.</p>
                  ) : (
                    paymentHistory.map(pay => (
                      <div key={pay.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight capitalize">{pay.description}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(pay.payment_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                        <div className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-lg">
                          + ${pay.amount}
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

export default UsersTable;