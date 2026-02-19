import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Users, GraduationCap, CalendarDays, MapPin, Phone, Mail, CheckCircle, Clock, Check, Star, Crown } from 'lucide-react';

// --- COMPONENTE: NAVBAR ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img className="h-16 w-auto" src="/img/argos_logo.png" alt="Argos Dance Academy" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-800 hover:text-argos-gold transition font-medium">Inicio</a>
            <a href="#plans" className="text-gray-800 hover:text-argos-gold transition font-medium">Paquetes</a>
            <a href="#classes" className="text-gray-800 hover:text-argos-gold transition font-medium">Disciplinas</a>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-argos-dark text-white px-6 py-2 rounded-full hover:bg-argos-gold transition duration-300 flex items-center gap-2"
            >
              Portal Académico
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white pb-6 px-4 shadow-lg">
          <div className="flex flex-col space-y-4 mt-4">
             <a href="#home" onClick={()=>setIsOpen(false)}>Inicio</a>
             <a href="#plans" onClick={()=>setIsOpen(false)}>Paquetes</a>
             <a href="#classes" onClick={()=>setIsOpen(false)}>Disciplinas</a>
              <button onClick={() => navigate('/login')} className="w-full bg-argos-dark text-white px-6 py-3 rounded-full">
              Portal Académico
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- SECCIÓN ACTUALIZADA: PAQUETES DE CLASES ---
const PlansSection = () => {
  const [selectedPlan, setSelectedPlan] = useState(2); // Seleccionamos el Paquete 2 por defecto

  // Datos reales del flyer
  const plans = [
    { 
      id: 1,
      title: "Paquete 1", 
      subtitle: "8 Clases al mes",
      price: "$1,100", 
      features: ["Ideal para 2 clases por semana", "Acceso al portal de alumnas", "Seguimiento técnico"],
      icon: <Star size={24} />
    },
    { 
      id: 2,
      title: "Paquete 2", 
      subtitle: "12 Clases al mes",
      price: "$1,300", 
      recommended: true,
      features: ["Ideal para 3 clases por semana", "Mayor flexibilidad", "Progreso constante"],
      icon: <Crown size={24} />
    },
    { 
      id: 3,
      title: "Intensivo Infantil", 
      subtitle: "Alto Rendimiento",
      price: "$1,400", 
      features: ["Clases ilimitadas", "Formación integral", "Preparación para eventos", "Desarrollo escénico"],
      icon: <Star size={24} />
    },
    { 
      id: 4,
      title: "Intensivo Inter-Adv", 
      subtitle: "Nivel Avanzado",
      price: "$1,550", 
      features: ["Clases ilimitadas", "Perfeccionamiento técnico", "Acceso a clases avanzadas", "Repertorio clásico"],
      icon: <Star size={24} />
    },
  ];

  return (
    <section id="plans" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center">
          <h2 className="text-5xl font-serif font-bold text-argos-dark mb-6 tracking-tight">
            Paquetes de Clases
          </h2>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-16">
            Elige el nivel de compromiso que tu arte necesita. Planes diseñados para acompañar tu crecimiento.
          </p>
        </div>
        
        {/* Modificado a grid-cols-4 para los 4 planes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-center max-w-7xl mx-auto mb-12">
          {plans.map((plan, idx) => {
            const isSelected = selectedPlan === plan.id;
            const isRecommended = plan.recommended;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative cursor-pointer transition-all duration-500 ease-out transform
                  rounded-2xl border bg-white flex flex-col justify-between overflow-hidden group h-full
                  ${isSelected 
                    ? 'border-argos-gold ring-2 ring-argos-gold/20 shadow-xl scale-105 z-10' 
                    : 'border-gray-200 shadow-md hover:shadow-lg hover:border-argos-gold/50'
                  }
                `}
              >
                {isRecommended && (
                  <div className="bg-argos-dark text-white text-[10px] font-bold uppercase tracking-widest py-1.5 text-center">
                    Más Popular
                  </div>
                )}

                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-full transition-colors duration-300 ${isSelected ? 'bg-argos-gold text-white' : 'bg-gray-100 text-gray-400 group-hover:text-argos-gold'}`}>
                      {plan.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">{plan.title}</h3>
                  <p className="text-sm text-argos-gold font-bold mb-4">{plan.subtitle}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-argos-dark">{plan.price}</span>
                  </div>

                  <div className="h-px w-full bg-gray-100 mb-6 group-hover:bg-argos-gold/30 transition-colors"></div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-xs">
                        <Check size={14} className={`mt-0.5 flex-shrink-0 transition-colors ${isSelected ? 'text-argos-gold' : 'text-gray-300'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Información de Clase Suelta e Inscripción */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-around items-center gap-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Clase Suelta</p>
            <p className="text-3xl font-bold text-argos-dark">$100</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Inscripción Anual</p>
            <p className="text-3xl font-bold text-argos-dark">$750</p>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- SECCIÓN ACTUALIZADA: DISCIPLINAS Y HORARIOS ---
const ClassesSection = () => {
  // Lista real de clases basadas en tus requerimientos
  const disciplines = [
    { title: "Pre Ballet", desc: "Iniciación a la danza, desarrollando musicalidad, coordinación y amor por el movimiento." },
    { title: "Ballet Infantil", desc: "Desarrollo técnico, postura y disciplina artística para los más jóvenes." },
    { title: "Ballet Principiantes", desc: "Adolescentes y adultos. Nunca es tarde para empezar y aprender los fundamentos desde cero." },
    { title: "Ballet Inter - Adv", desc: "Técnica rigurosa, trabajo avanzado y repertorio para adolescentes y adultos." },
    { title: "Danza Contemporánea", desc: "Exploración del movimiento, fluidez, trabajo de piso y expresión corporal." },
    { title: "Acondicionamiento Físico", desc: "Fortalecimiento, flexibilidad y resistencia diseñados específicamente para complementar el entrenamiento." },
  ];

  return (
    <section id="classes" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Columna Izquierda: Disciplinas */}
          <div>
            <h2 className="text-4xl font-serif font-bold text-argos-dark mb-8">Nuestras Disciplinas</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {disciplines.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-argos-gold hover:shadow-md transition">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Horario Visual (Muestra representativa) */}
          <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 bg-argos-gold text-white rounded-bl-2xl font-bold">Horario 2026</div>
            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Clock className="text-argos-gold"/> Clases Regulares
            </h3>
            
            <p className="text-gray-600 mb-8">
              Contamos con una amplia variedad de horarios de Lunes a Sábado, adaptados para todos los niveles y edades. Desde grupos infantiles por las tardes hasta clases de adultos nocturnas.
            </p>
            
            <button className="mt-auto w-full border-2 border-argos-dark bg-argos-dark text-white py-4 rounded-xl hover:bg-white hover:text-argos-dark transition font-bold shadow-md">
              Solicitar Horario Completo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE: PORTAL ENTRY (INTACTO) ---
const PortalEntry = () => {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/login');

  return (
    <section className="relative py-32 overflow-hidden">
      {/* IMAGEN DE FONDO CON OVERLAY */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=2000&auto=format&fit=crop')`,
          // Tip: 'bg-fixed' crea un efecto parallax muy elegante al hacer scroll
        }}
      >
        {/* Capa oscura para dar legibilidad */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 italic">
             Tu Espacio Digital
           </h2>
           <p className="text-argos-gold font-light tracking-widest uppercase">
             Gestiona tu formación en Argos Dance Academy
           </p>
        </div>
        
        <div className="flex justify-center">
          <div 
            className="bg-white/10 backdrop-blur-md p-10 rounded-[2rem] border border-white/20 hover:border-argos-gold/50 transition-all duration-500 group cursor-pointer max-w-md w-full text-center shadow-2xl" 
            onClick={handleLogin}
          >
            <div className="w-20 h-20 bg-argos-gold rounded-full flex items-center justify-center mb-8 shadow-lg mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Users size={36} className="text-white" />
            </div>
            
            <h3 className="text-3xl font-bold mb-3 text-white">Portal Argos</h3>
            <p className="text-gray-300 mb-10 leading-relaxed">
              Acceso exclusivo para alumnas, maestros y administración.
            </p>
            
            <button className="w-full py-4 bg-white text-argos-dark rounded-xl font-bold hover:bg-argos-gold hover:text-white transition-all duration-300 transform active:scale-95 shadow-xl">
              Entrar al Sistema
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE: HERO CAROUSEL COMPLETO ---
const HeroCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1, 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false
  };

  const slides = [
    { 
      id: 1, 
      image: "/img/dancer4.jpg", 
      title: "Disciplina y Pasión", 
      subtitle: "Formando artistas desde el primer paso." 
    },
    { 
      id: 2, 
      image: "/img/dancer3.jpg", 
      title: "La Excelencia del Ballet", 
      subtitle: "Un espacio dedicado al arte del movimiento." 
    },
    { 
      id: 3, 
      image: "/img/dancer5.webp", 
      title: "Tu Escenario te Espera", 
      subtitle: "Descubre tu potencial en Argos Academy." 
    },
  ];

  return (
    <section id="home" className="relative h-screen mt-20 overflow-hidden">
      <Slider {...settings} className="h-full">
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-screen outline-none">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            <div className="relative h-full flex items-center justify-center text-center px-4">
              <div className="max-w-4xl text-white">
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-wide drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl font-light mb-10 drop-shadow-md">
                  {slide.subtitle}
                </p>
                 <button className="bg-argos-gold text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-argos-dark transition duration-300">
                  Conoce Nuestros Programas
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

// --- COMPONENTES PLACEHOLDERS (Mantenemos los tuyos intactos) ---
const AboutSection = () => { return <div className="py-20 text-center text-gray-400">Sección Nosotros (Tu código va aquí)</div> };
const Footer = () => { return <div className="py-10 bg-argos-dark text-white text-center">Footer (Tu código va aquí)</div> };

// --- LANDING PAGE FINAL ---
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroCarousel />
      <AboutSection />
      <PlansSection />   
      <ClassesSection /> 
      <PortalEntry />    
      <Footer />
    </div>
  );
};

export default LandingPage;