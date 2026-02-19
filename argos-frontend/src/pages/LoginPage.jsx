import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // ESTADOS PARA EL FORMULARIO
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. PETICIÓN AL BACKEND
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. ÉXITO: GUARDAR TOKEN
        console.log("Login exitoso:", data);
        localStorage.setItem('token', data.token); // Guardamos el "Gafete"
        localStorage.setItem('user', JSON.stringify(data.user)); // Guardamos datos básicos
        
        // 3. REDIRIGIR AL DASHBOARD
        navigate('/dashboard');
      } else {
        // 4. ERROR DEL SERVIDOR (ej. Contraseña mal)
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Revisa que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden">
      
      {/* FONDO */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url('/img/dancer4.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* TARJETA DE LOGIN */}
      <div className="relative z-10 w-full max-w-[450px] mx-4"> 
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl">
          
          <button 
            onClick={() => navigate('/')} 
            className="group flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <div className="p-1 rounded-full bg-gray-100 group-hover:bg-gray-200">
              <ChevronLeft size={16} />
            </div>
            Volver al inicio
          </button>

          <div className="text-center mb-8">
            <img src="/img/argos_logo.png" alt="Argos Logo" className="h-20 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-serif font-bold text-gray-900">Bienvenido</h2>
            <p className="text-gray-500 text-sm">Ingresa a tu cuenta Argos</p>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Correo */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 ml-1">Correo Electrónico</label>
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Mail size={20} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block py-3.5 outline-none transition-all placeholder-gray-400"
                  style={{ paddingLeft: '3rem', paddingRight: '1rem' }} 
                  placeholder="admin@argos.com" 
                  required 
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Contraseña</label>
                <a href="#" className="text-xs text-yellow-600 hover:underline font-bold">¿Olvidaste tu contraseña?</a>
              </div>
              
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block py-3.5 outline-none transition-all placeholder-gray-400"
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                  placeholder="••••••••" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-bold rounded-lg text-sm px-5 py-4 text-center mt-8 shadow-lg transition-all duration-300 block 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            ¿No tienes cuenta? <span className="text-black font-bold">Contacta a administración</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;