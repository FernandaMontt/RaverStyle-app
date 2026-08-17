import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { VIEW_TITLES } from '../lib/seedData';

export default function Header({ activeTab }) {
  const { scanRandomProduct } = useStore();
  const [clock, setClock] = useState(new Date().toLocaleTimeString('es-CL'));

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString('es-CL')), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white font-display">{VIEW_TITLES[activeTab] || 'Módulo RAVER'}</h1>
      </div>

      <div className="flex items-center gap-4">
        {activeTab === 'pos' && (
          <button onClick={scanRandomProduct} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg text-cyan-400 flex items-center gap-2">
            <i className="fa-solid fa-barcode" /> Simular Escáner
          </button>
        )}
        <div className="text-xs text-slate-400 text-right hidden sm:block">
          <p className="font-semibold text-slate-300">{clock}</p>
          <p className="text-[10px]">{new Date().toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>
    </header>
  );
}
