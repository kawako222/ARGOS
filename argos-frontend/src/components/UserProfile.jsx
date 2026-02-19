import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, KeyRound, Award, Ruler, Save } from 'lucide-react';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado solo para la contraseña
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUserData(await res.json());
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMessage('❌ Las contraseñas no coinciden.');
    }
    if (passwords.new.length < 6) {
      return setMessage('❌ La contraseña debe tener al menos 6 caracteres.');
    }

    const token = localStorage.getItem('token');
    try {
      // Usamos la misma ruta de actualización que usa el admin, pero solo mandamos la contraseña
      const res = await fetch(`http://localhost:3000/api/users/${userData.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ password: passwords.new })
      });

      if (res.ok) {
        setMessage('✨ ¡Contraseña actualizada con éxito!');
        setPasswords({ new: '', confirm: '' });
        setTimeout(() => setMessage(''), 5000); // Borrar mensaje después de 5s
      } else {
        setMessage('❌ Hubo un error al actualizar la contraseña.');
      }
    } catch (err) {
        console.error("Error cargando stats", err);
      setMessage('❌ Error de conexión.');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 italic font-serif">Preparando tu camerino...</div>;
  if (!userData) return null;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ENCABEZADO CON IMAGEN DE BALLET */}
      <div className="relative h-64 rounded-t-[2.5rem] overflow-hidden shadow-sm">
        {/* Imagen de fondo de Unsplash (Estudio de ballet/zapatillas) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516663713099-37eb6d60c825?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
        />
        {/* Overlay oscuro para que no deslumbre */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      {/* TARJETA PRINCIPAL (Sube un poco sobre la imagen) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 -mt-20 relative z-10 mx-6 mb-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* AVATAR Y DATOS PRINCIPALES */}
        <div className="flex flex-col items-center w-full md:w-1/3 border-r-0 md:border-r border-gray-100 pr-0 md:pr-8">
          <div className="w-32 h-32 bg-gray-900 text-argos-gold rounded-full flex items-center justify-center text-4xl font-serif font-bold border-4 border-white shadow-lg -mt-20 mb-4">
            {userData.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-serif italic text-gray-900 text-center mb-1">{userData.name}</h2>
          <p className="text-sm text-gray-400 mb-4">{userData.email}</p>
          
          <div className="bg-yellow-50 text-argos-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-yellow-100/50">
            {userData.role === 'ALUMNA' ? (userData.plan_type || 'Alumna Activa') : userData.role}
          </div>
        </div>

        {/* DETALLES Y CONTRASEÑA */}
        <div className="w-full md:w-2/3 space-y-8">
          
          {/* Sección de solo lectura */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-50 pb-2">
              Expediente en Argos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-not-allowed">
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1"><User size={12}/> Nombre Completo</p>
                <p className="text-sm font-medium text-gray-700">{userData.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-not-allowed">
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1"><Mail size={12}/> Correo Registrado</p>
                <p className="text-sm font-medium text-gray-700 truncate">{userData.email}</p>
              </div>
              
              {userData.role === 'ALUMNA' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-not-allowed">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1"><Award size={12}/> Papel Asignado</p>
                    <p className="text-sm font-medium text-gray-700 italic font-serif">{userData.role_assignment || 'Aún sin asignar'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-not-allowed">
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1"><Ruler size={12}/> Talla Registrada</p>
                    <p className="text-sm font-medium text-gray-700">{userData.measurements?.talla || 'No registrada'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sección de cambio de contraseña */}
          <div>
            <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">
              <ShieldCheck size={14}/> Seguridad de la cuenta
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nueva Contraseña</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 text-gray-300" size={16}/>
                    <input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 text-gray-300" size={16}/>
                    <input 
                      type="password" 
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {message && (
                <p className={`text-xs font-bold p-2 rounded-lg text-center ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </p>
              )}

              <button 
                type="submit" 
                disabled={!passwords.new || !passwords.confirm}
                className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
              >
                <Save size={14}/> Actualizar Contraseña
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;