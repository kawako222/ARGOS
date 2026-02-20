import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Users, Briefcase, CreditCard, Wallet, LayoutDashboard, ClipboardCheck } from 'lucide-react'; 

// Importación de Componentes
import UsersTable from '../components/UsersTable'; 
import CoursesTable from '../components/CoursesTable';
import StudentStats from '../components/StudentStats';
import MonthlyCalendar from '../components/MonthlyCalendar';
import TeachersTable from '../components/TeachersTable';
import UserProfile from '../components/UserProfile';
import StudentPayments from '../components/StudentPayments';
import FinancePage from '../components/FinancePage'; 
import TeacherDashboard from '../components/TeacherDashboard'; 
import TeacherPayments from '../components/TeacherPayments'; 
import AttendanceTable from '../components/AttendanceTable';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleLogout = () => {
    setUser(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBookingDone = () => {
    setRefreshKey(prev => prev + 1); 
  };

  if (!user) return null;

  const displayName = user.name || "Usuario";
  const initial = displayName.charAt(0).toUpperCase();
  const userRole = user.role || "ALUMNA";

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <img src="/img/argos_logo.png" alt="Argos" className="h-12 mx-auto object-contain" />
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          
          {/* ======================================= */}
          {/* 1. SECCIÓN PRINCIPAL (Para todos)         */}
          {/* ======================================= */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'home' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {userRole === 'MAESTRO' ? <LayoutDashboard size={20} /> : <Calendar size={20} />} 
              {userRole === 'MAESTRO' ? 'Mi Panel Docente' : 'Inicio'}
            </button>

            {/* 👇 FINANZAS DEL MAESTRO: Agrupado con Inicio y Perfil 👇 */}
            {userRole === 'MAESTRO' && (
              <button 
                onClick={() => setActiveTab('teacher_finances')}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === 'teacher_finances' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Wallet size={20} /> Mis Finanzas
              </button>
            )}

            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'profile' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={20} /> Mi Perfil
            </button>
          </div>

          {/* ======================================= */}
          {/* 2. SECCIÓN: GESTIÓN ADMIN                 */}
          {/* ======================================= */}
          {userRole === 'ADMIN' && (
            <div className="pt-4 mt-2 border-t border-gray-100 space-y-2">
              <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Gestión Argos
              </p>
              <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'users' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users size={20} /> Alumnas
              </button>
              <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'courses' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Calendar size={20} /> Clases
              </button>
              <button onClick={() => setActiveTab('teachers')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'teachers' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Briefcase size={20} /> Profesores
              </button>
              <button onClick={() => setActiveTab('finances')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'finances' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Wallet size={20} /> Finanzas
              </button>
              <button onClick={() => setActiveTab('attendance')} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'attendance' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <ClipboardCheck size={20} /> Asistencias
              </button>
            </div>
          )}

          {/* ======================================= */}
          {/* 3. SECCIÓN: MI ACADEMIA (ALUMNAS)         */}
          {/* ======================================= */}
          {userRole === 'ALUMNA' && (
            <div className="pt-4 mt-2 border-t border-gray-100 space-y-2">
              <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Mi Academia
              </p>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === 'payments' ? 'bg-yellow-50 text-yellow-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={20} /> Mis Pagos
              </button>
            </div>
          )}

        </nav>

        {/* CERRAR SESIÓN */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-serif font-bold text-gray-800 uppercase tracking-tight">
            {activeTab === 'home' && userRole === 'ADMIN' && 'Panel de Control'}
            {activeTab === 'home' && userRole === 'MAESTRO' && 'Panel Docente'}
            {activeTab === 'home' && userRole === 'ALUMNA' && 'Mi Academia'}
            {activeTab === 'users' && 'Gestión de Alumnas'}
            {activeTab === 'courses' && 'Catálogo de Clases'}
            {activeTab === 'teachers' && 'Cuerpo Docente'}
            {activeTab === 'finances' && 'Contabilidad y Finanzas'}
            {activeTab === 'payments' && 'Historial de Pagos'}
            {activeTab === 'profile' && 'Configuración de Perfil'}
            {activeTab === 'teacher_finances' && 'Mis Finanzas'} 
            {activeTab === 'attendance' && 'Bitácora de Asistencias'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Hola, <span className="font-bold text-gray-900">{displayName}</span>
            </span>
            <div className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-2 border-yellow-500 shadow-sm">
              {initial}
            </div>
          </div>
        </header>

        <div className="p-8">
          
          {activeTab === 'home' && (
            <div className="space-y-8">
              
              {userRole === 'ALUMNA' && (
                <>
                  <StudentStats key={refreshKey} />
                  <section className="animate-in fade-in duration-700 delay-150">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Calendario de Clases</h2>
                      <p className="text-sm text-gray-500">Selecciona un día para reservar con tus créditos.</p>
                    </div>
                    <MonthlyCalendar onBookingSuccess={handleBookingDone} />
                  </section>
                </>
              )}

              {userRole === 'MAESTRO' && (
                <TeacherDashboard />
              )}

              {userRole === 'ADMIN' && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-[50vh]">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-6">
                    <LayoutDashboard size={40} />
                  </div>
                  <h2 className="text-3xl font-serif italic mb-2 text-gray-900">¡Hola, {displayName}!</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Bienvenido al sistema administrativo de Argos. Utiliza el menú lateral para gestionar las alumnas, los horarios o revisar la contabilidad de la academia.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && userRole === 'ADMIN' && <UsersTable />}
          {activeTab === 'courses' && userRole === 'ADMIN' && <CoursesTable />}
          {activeTab === 'teachers' && userRole === 'ADMIN' && <TeachersTable />}
          {activeTab === 'finances' && userRole === 'ADMIN' && <FinancePage />} 
          {activeTab === 'attendance' && userRole === 'ADMIN' && <AttendanceTable />}
          
          {activeTab === 'payments' && userRole === 'ALUMNA' && <StudentPayments userId={user.id} />}
          
          {activeTab === 'profile' && <UserProfile />}

          {/* 👇 RENDERIZADO DEL NUEVO COMPONENTE 👇 */}
          {activeTab === 'teacher_finances' && userRole === 'MAESTRO' && <TeacherPayments />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;