import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';
import { NAV_ITEMS } from '../lib/seedData';

export default function Sidebar({ activeTab, onSwitchTab }) {
  const { currentUser, currentShift, logout } = useStore();

  // Filtrar por rol, por la propiedad hidden y excluyendo dashboard y tienda
  const items = NAV_ITEMS.filter(
    (item) => 
      item.roles.includes(currentUser.rol) && 
      !item.hidden && 
      item.id !== 'dashboard' && 
      item.id !== 'tienda'
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-display font-bold flex items-center justify-center text-xl">
          R
        </div>
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-wider text-white leading-none">RAVER</h2>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">Style CAJA POS v2.5</span>
        </div>
      </div>

      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 font-medium">Estado de Caja</span>
          {currentShift ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ABIERTA</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CERRADA</span>
          )}
        </div>
        <p className="text-slate-300 font-mono font-semibold">
          {currentShift ? `Turno #${currentShift.id} • Base: ${formatCLP(currentShift.fondo_inicial)}` : 'Sin turno activo'}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSwitchTab(item.id)}
            className={
              'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ' +
              (activeTab === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50')
            }
          >
            <i className={`fa-solid ${item.icon} w-5 text-center ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            {currentUser.nombre.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.nombre} {currentUser.apellidos}
            </p>
            <p className="text-[10px] text-cyan-400 capitalize truncate font-mono">{currentUser.rol.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={() => logout()} title="Cerrar Sesión" className="p-2 text-slate-400 hover:text-rose-400 transition hover:bg-slate-800 rounded-lg">
          <i className="fa-solid fa-power-off text-sm" />
        </button>
      </div>
    </aside>
  );
}