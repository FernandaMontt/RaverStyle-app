import { useState } from 'react';

// --- Contextos del POS ---
import { ToastProvider } from './context/ToastContext';
import { StoreProvider, useStore } from './context/StoreContext';

// --- Componentes del Hub ---
import AmbientBackground from './components/AmbientBackground';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import BridgeDiagram from './components/BridgeDiagram';
import LaunchCards from './components/LaunchCards';
import FeedSection from './components/FeedSection';
import RoleDashboard from './components/RoleDashboard';
import TiendaOnlineApp from './components/TiendaOnlineApp';
import Footer from './components/Footer';
import { useBridgeData } from './hooks/useBridgeData';

// --- Componentes del POS ---
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import POSView from './components/POSView';
import CajaView from './components/CajaView';
import ProductosView from './components/ProductosView';
import InventarioView from './components/InventarioView';
import VentasView from './components/VentasView';
import DevolucionesView from './components/DevolucionesView';
import ReportesView from './components/ReportesView';
import UsuariosView from './components/UsuariosView';
import ConfiguracionView from './components/ConfiguracionView';

// --- Diccionario de Vistas del POS ---
const VIEWS = {
  pos: POSView,
  caja: CajaView,
  productos: ProductosView,
  inventario: InventarioView,
  ventas: VentasView,
  devoluciones: DevolucionesView,
  reportes: ReportesView,
  usuarios: UsuariosView,
  configuracion: ConfiguracionView,
};

// --- Contenedor Principal del POS ---
function POSAppShell({ onClose }) {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState('pos');

  // Si no hay usuario logueado, mostramos el LoginView que compartiste
  if (!currentUser) return (
    <div className="relative z-[2] h-screen w-full">
       <button
        onClick={onClose}
        className="fixed top-[18px] right-[18px] z-[9999] px-3 py-2 bg-[#FF6B00] text-[#080808] font-mono text-[11px] font-bold uppercase cursor-pointer border-none shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:bg-[#ff8533] transition-colors"
      >
        ← Volver al Hub
      </button>
      <LoginView />
    </div>
  );

  const ActiveView = VIEWS[activeTab] || POSView;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080c14] relative z-[2]">
      <button
        onClick={onClose}
        className="fixed top-[18px] right-[18px] z-[9999] px-3 py-2 bg-[#FF6B00] text-[#080808] font-mono text-[11px] font-bold uppercase cursor-pointer border-none shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:bg-[#ff8533] transition-colors"
      >
        ← Volver al Hub
      </button>

      <Sidebar activeTab={activeTab} onSwitchTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/50">
          <ActiveView />
        </main>
      </div>
    </div>
  );
}

// --- Aplicación Principal ---
export default function App() {
  const { stats, feed } = useBridgeData();
  const [activeApp, setActiveApp] = useState('hub'); // 'hub', 'online', 'pos'

  return (
    <ToastProvider>
      <StoreProvider>
        <AmbientBackground />
        
        {activeApp === 'hub' && (
          <main className="relative z-[2]">
            <NavBar onOpenOnline={() => setActiveApp('online')} />
            <Hero />
            <BridgeDiagram stats={stats} onOpenOnline={() => setActiveApp('online')} />
            <RoleDashboard />
            <LaunchCards 
              onOpenOnline={() => setActiveApp('online')} 
              onOpenPOS={() => setActiveApp('pos')} 
            />
            <FeedSection feed={feed} />
            <Footer />
          </main>
        )}

        {activeApp === 'online' && (
          <div className="relative z-[2]">
            <TiendaOnlineApp onClose={() => setActiveApp('hub')} />
          </div>
        )}

        {activeApp === 'pos' && (
          <POSAppShell onClose={() => setActiveApp('hub')} />
        )}
        
      </StoreProvider>
    </ToastProvider>
  );
}