import React, { useState } from 'react';
import { Coins, DollarSign, X } from 'lucide-react';

const RecargaModal = ({ isOpen, onClose, onConfirm, userPlan }) => {
  // Inicializamos el estado directamente usando el prop userPlan.
  // Gracias a la 'key' en el padre, este componente se "resetea" 
  // con nuevos valores cada vez que se abre o cambia de alumna.
  const PLAN_CONFIG = {
    'Paquete 1':   { price: '1100', tokens: 8 },
    'Paquete 2':   { price: '1300',  tokens: 12  },
    'Infantil':   { price: '1400',  tokens: 8  }, // Ejemplo Infantil
    'Inter-adv':   { price: '1550', tokens: 100 }, // Ejemplo Inter-adv
    'Personalizado': { price: 'beca',    tokens: 100  }, // Por si no tiene plan
    'default':     { price: '1100',  tokens: 8  }  // Lo que sale si algo falla
  };

  // 2. Buscamos la configuración del alumno actual
  // Si el plan no existe en el objeto, usamos el 'default'
  const currentConfig = PLAN_CONFIG[userPlan] || PLAN_CONFIG['default'];

  // 3. Inicializamos los estados con la configuración encontrada
  const [amount, setAmount] = useState(currentConfig.price);
  const [tokens, setTokens] = useState(currentConfig.tokens);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recarga de Mensualidad</h3>
              <p className="text-[10px] text-argos-gold font-bold uppercase tracking-wider">
                Sugerencia para: {userPlan || 'Sin Plan'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Input de Dinero */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monto del Pago (MXN)</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Input de Tokens */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Clases (Monedas) a Recargar</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <Coins size={18} />
                </div>
                <input 
                  type="number" 
                  value={tokens}
                  onChange={(e) => setTokens(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-lg font-bold"
                  placeholder="8"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => onConfirm(amount, tokens)}
            className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Confirmar y Cobrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecargaModal;