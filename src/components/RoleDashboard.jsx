import { useState, useEffect } from 'react';
import { getStats, getFeed } from '../lib/raverBridge';
import { safeGetJSON, safeSetJSON } from '../lib/safeStorage';

const PRODUCTS_KEY = 'raver_products_v1';

// CATÁLOGO OFICIAL ACTUALIZADO (Estructura unificada con Tienda Online y POS)
const INITIAL_PRODUCTS = [
  // Mascarillas
  { id: 101, SKU: 'RS-MSK-CYB-V1', nombre: 'Mascarilla Cyber V1', categoria: 'Mascarillas', precio: 19990, stock_actual: 10, color: 'Negro + Naranja', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V1.png' },
  { id: 102, SKU: 'RS-MSK-CYB-V2', nombre: 'Mascarilla Cyber V2', categoria: 'Mascarillas', precio: 18990, stock_actual: 8, color: 'Negro + Blanco', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V2.png' },
  { id: 103, SKU: 'RS-MSK-CYB-V3', nombre: 'Mascarilla Cyber V3', categoria: 'Mascarillas', precio: 21990, stock_actual: 6, color: 'Negro Mate', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V3.png' },
  { id: 104, SKU: 'RS-MSK-CYB-V4', nombre: 'Mascarilla Cyber V4', categoria: 'Mascarillas', precio: 16990, stock_actual: 12, color: 'Negro + Gris', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V4.png' },
  { id: 105, SKU: 'RS-MSK-CYB-V5', nombre: 'Mascarilla Cyber V5 Visor', categoria: 'Mascarillas', precio: 23990, stock_actual: 5, color: 'Reflectante', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V5.png' },
  { id: 106, SKU: 'RS-MSK-TAC-PRO', nombre: 'Mascarilla Tactic Pro', categoria: 'Mascarillas', precio: 17990, stock_actual: 9, color: 'Negro Táctico', talla: 'Ajustable', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Pro.png' },
  { id: 107, SKU: 'RS-MSK-TAC-CAMO', nombre: 'Mascarilla Tactic Camo', categoria: 'Mascarillas', precio: 16990, stock_actual: 7, color: 'Camo Negro', talla: 'Ajustable', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Camo.png' },
  { id: 108, SKU: 'RS-MSK-LED-NEON', nombre: 'Mascarilla LED Neon', categoria: 'Mascarillas', precio: 22990, stock_actual: 11, color: 'Azul Neon', talla: 'Ajustable', icon: '⚡', imagen: '/vestuario/Mascarilla LED Neon.png' },
  { id: 109, SKU: 'RS-MSK-LED-PULSE', nombre: 'Mascarilla LED Pulse', categoria: 'Mascarillas', precio: 22990, stock_actual: 8, color: 'Morado Glow', talla: 'Ajustable', icon: '⚡', imagen: '/vestuario/Mascarilla LED Pulse.png' },
  { id: 110, SKU: 'RS-MSK-SAM-KAI', nombre: 'Mascarilla Samurai Kai', categoria: 'Mascarillas', precio: 24990, stock_actual: 6, color: 'Negro', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Kai.png' },
  { id: 111, SKU: 'RS-MSK-SAM-DRK', nombre: 'Mascarilla Samurai Dark', categoria: 'Mascarillas', precio: 26990, stock_actual: 4, color: 'Negro Mate', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Dark.png' },
  { id: 112, SKU: 'RS-MSK-SAM-BLD', nombre: 'Mascarilla Samurai Blood', categoria: 'Mascarillas', precio: 26990, stock_actual: 5, color: 'Negro + Rojo', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Blood.png' },

  // Poleras
  { id: 201, SKU: 'RS-TEE-MEN-01', nombre: 'Raver Tech Tee (Hombre)', categoria: 'Poleras', precio: 22990, stock_actual: 15, color: 'Negro + Naranja', talla: 'L', icon: '👕', imagen: '/vestuario/Raver Tech Tee Hombre.png' },
  { id: 202, SKU: 'RS-TEE-WM-01', nombre: 'Raver Fit Tee (Mujer)', categoria: 'Poleras', precio: 19990, stock_actual: 12, color: 'Negro Mate + Glow', talla: 'M', icon: '👕', imagen: '/vestuario/Raver Tech Tee Mujer.png' },

  // Polerones y Cortavientos
  { id: 301, SKU: 'RS-HD-CYBARMOR', nombre: 'Cyber Armor Hoodie', categoria: 'Polerones', precio: 39990, stock_actual: 7, color: 'Negro + Naranja Glow', talla: 'XL', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Hombre.png' },
  { id: 302, SKU: 'RS-HD-NEONPULSE', nombre: 'Neon Pulse Hoodie', categoria: 'Polerones', precio: 38990, stock_actual: 6, color: 'Negro + Morado Glow', talla: 'M', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Mujer.png' },
  { id: 401, SKU: 'RS-CV-CYBARMOR', nombre: 'Cyber Armor Cortavientos', categoria: 'Cortavientos', precio: 34990, stock_actual: 8, color: 'Negro + Naranja', talla: 'L', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Hombre.png' },
  { id: 402, SKU: 'RS-CV-NEONPULSE', nombre: 'Neon Pulse Cortavientos Crop', categoria: 'Cortavientos', precio: 32990, stock_actual: 5, color: 'Negro + Morado', talla: 'S', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Mujer.png' },

  // Pantalones
  { id: 501, SKU: 'RS-PNT-TECH-MEN', nombre: 'Tech Cargo Pants', categoria: 'Pantalones', precio: 36990, stock_actual: 9, color: 'Negro Desgastado', talla: '42', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Hombre.png' },
  { id: 502, SKU: 'RS-PNT-CYB-WM', nombre: 'Cyber Cargo Fit High Waist', categoria: 'Pantalones', precio: 34990, stock_actual: 8, color: 'Negro', talla: '38', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Mujer.png' },

  // Calzado
  { id: 601, SKU: 'RS-SNK-TECH', nombre: 'Raver Tech Sneakers LED', categoria: 'Zapatillas', precio: 59990, stock_actual: 10, color: 'Negro + Naranja Glow', talla: '41', icon: '👟', imagen: '/vestuario/zapatillas.png' },

  // Lentes de Sol
  { id: 701, SKU: 'RS-GLS-SPORT-BLK', nombre: 'Cyber Vision Glasses (Sport 180°)', categoria: 'Lentes de Sol', precio: 15990, stock_actual: 20, color: 'Cyber Black', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Sport 180°).png' },
  { id: 702, SKU: 'RS-GLS-SPORT-PUR', nombre: 'Cyber Vision Glasses Purple 180°', categoria: 'Lentes de Sol', precio: 15990, stock_actual: 15, color: 'Cyber Purple', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses Purple (Sport 180°).png' },
  { id: 703, SKU: 'RS-GLS-WAY-BLK', nombre: 'Cyber Vision Glasses (Wayfarer)', categoria: 'Lentes de Sol', precio: 14990, stock_actual: 18, color: 'Cyber Black', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Wayfarer).png' },

  // Accesorios
  { id: 801, SKU: 'RS-BAG-LEG-ORG', nombre: 'Leg Utility Bag / Musera Tactical', categoria: 'Accesorios', precio: 18990, stock_actual: 14, color: 'Naranja Neón', talla: 'Ajustable', icon: '🎒', imagen: '/vestuario/LegUtilityBag.png' },
  { id: 802, SKU: 'RS-BAG-BAN-BLK', nombre: 'Banano Raver Style YKK', categoria: 'Accesorios', precio: 12990, stock_actual: 25, color: 'Negro', talla: 'Ajustable', icon: '🎒', imagen: '/vestuario/Banano.png' },
  { id: 803, SKU: 'RS-ACC-BOTTLE', nombre: 'Porta Botella Táctico Holder', categoria: 'Accesorios', precio: 8990, stock_actual: 30, color: 'Negro + Naranja', talla: 'Ajustable', icon: '🧪', imagen: '/vestuario/Bottle Holder.png' },
  { id: 804, SKU: 'RS-ACC-GLOVES', nombre: 'Guantes Raver Tech Touchscreen', categoria: 'Accesorios', precio: 11990, stock_actual: 12, color: 'Negro', talla: 'L', icon: '🥊', imagen: '/vestuario/Guantes.png' }
];

export default function RoleDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'stock'

  // Estado de productos con carga segura
  const [products, setProducts] = useState(() => {
    return safeGetJSON(PRODUCTS_KEY, INITIAL_PRODUCTS, (arr) => Array.isArray(arr));
  });

  // Estadísticas del Bridge y Feed en vivo
  const [bridgeStats, setBridgeStats] = useState(() => getStats() || { pos: { total: 0, ventas: 0 }, web: { total: 0, pedidos: 0 } });
  const [feed, setFeed] = useState(() => getFeed() || []);

  // Escuchar eventos de actualización de stock en tiempo real desde la Tienda Online o POS
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProducts = safeGetJSON(PRODUCTS_KEY, INITIAL_PRODUCTS, (arr) => Array.isArray(arr));
      setProducts(updatedProducts);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('raver_products_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('raver_products_updated', handleStorageChange);
    };
  }, []);

  // Sincronizar inicial con localStorage si está vacío
  useEffect(() => {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      safeSetJSON(PRODUCTS_KEY, INITIAL_PRODUCTS);
    }
  }, []);

  // Actualizar estadísticas del bridge periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setBridgeStats(getStats() || { pos: { total: 0, ventas: 0 }, web: { total: 0, pedidos: 0 } });
      setFeed(getFeed() || []);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-[#0d0d14] border border-[#1b1b24] p-6 mb-8 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
        <div className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-1">// Panel de Control Unificado</div>
        <h2 className="font-['Orbitron'] text-2xl font-bold tracking-tight text-[#f0ede8]">
          RAVER <span className="text-[#a855f7]">DASHBOARD OPERATIVO</span>
        </h2>
        <p className="text-sm text-[#7d7d8a] mt-1">
          Gestión en tiempo real de inventario, métricas unificadas y stock sincronizado.
        </p>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-[#1b1b24] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-[#a855f7] text-[#f0ede8] bg-[#0d0d14]'
              : 'border-transparent text-[#7d7d8a] hover:text-[#f0ede8]'
          }`}
        >
          <i className="fa-solid fa-chart-pie"></i> Resumen & Métricas
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-[#00f0ff] text-[#f0ede8] bg-[#0d0d14]'
              : 'border-transparent text-[#7d7d8a] hover:text-[#f0ede8]'
          }`}
        >
          <i className="fa-solid fa-boxes-stacked"></i> Stock Actualizado
        </button>
      </div>

      {/* TAB 1: RESUMEN & MÉTRICAS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d0d14] border border-[#00f0ff]/30 p-5 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
              <div className="font-mono text-xs text-[#00f0ff] uppercase tracking-wider">// Ventas POS Hoy</div>
              <div className="font-['Orbitron'] text-3xl font-bold mt-2 text-[#f0ede8]">
                ${Math.round(bridgeStats?.pos?.total ?? 0).toLocaleString('es-CL')}
              </div>
              <div className="font-mono text-xs text-[#7d7d8a] mt-2">{bridgeStats?.pos?.ventas ?? 0} transacciones registradas</div>
            </div>

            <div className="bg-[#0d0d14] border border-[#ff6b00]/30 p-5 shadow-[0_0_20px_rgba(255,107,0,0.05)]">
              <div className="font-mono text-xs text-[#ff6b00] uppercase tracking-wider">// Pedidos Web Hoy</div>
              <div className="font-['Orbitron'] text-3xl font-bold mt-2 text-[#f0ede8]">
                ${Math.round(bridgeStats?.web?.total ?? 0).toLocaleString('es-CL')}
              </div>
              <div className="font-mono text-xs text-[#7d7d8a] mt-2">{bridgeStats?.web?.pedidos ?? 0} pedidos e-commerce</div>
            </div>

            <div className="bg-[#0d0d14] border border-[#a855f7]/30 p-5 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
              <div className="font-mono text-xs text-[#a855f7] uppercase tracking-wider">// Total Ecosistema</div>
              <div className="font-['Orbitron'] text-3xl font-bold mt-2 text-[#f0ede8]">
                ${Math.round((bridgeStats?.pos?.total ?? 0) + (bridgeStats?.web?.total ?? 0)).toLocaleString('es-CL')}
              </div>
              <div className="font-mono text-xs text-[#7d7d8a] mt-2">POS + Tienda Online unificados</div>
            </div>

            <div className="bg-[#0d0d14] border border-[#1b1b24] p-5">
              <div className="font-mono text-xs text-[#7d7d8a] uppercase tracking-wider">// SKUs en Inventario</div>
              <div className="font-['Orbitron'] text-3xl font-bold mt-2 text-[#f0ede8]">
                {products.reduce((acc, p) => acc + (p?.stock_actual ?? p?.stock ?? 0), 0)} un.
              </div>
              <div className="font-mono text-xs text-[#7d7d8a] mt-2">{products.length} productos activos</div>
            </div>
          </div>

          {/* Actividad en Vivo */}
          <div className="bg-[#0d0d14] border border-[#1b1b24] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-['Orbitron'] text-lg font-bold flex items-center gap-2">
                <i className="fa-solid fa-stream text-[#a855f7]"></i> Actividad en Vivo del Puente
              </h3>
              <span className="font-mono text-xs text-[#7d7d8a]">Sincronización automática</span>
            </div>
            {feed.length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-[#7d7d8a]">
                No hay actividad reciente registrada.
              </div>
            ) : (
              <div className="space-y-2">
                {feed.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#06060a] border border-[#1b1b24] text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs px-2 py-0.5 border ${item?.system === 'POS' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-[#ff6b00] text-[#ff6b00]'}`}>
                        {item?.system ?? 'N/A'}
                      </span>
                      <span className="text-[#f0ede8]">{item?.label ?? 'Transacción'}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-[#a855f7] font-bold">${Math.round(item?.amount ?? 0).toLocaleString('es-CL')}</span>
                      <span className="text-xs text-[#7d7d8a]">{item?.ts ? new Date(item.ts).toLocaleTimeString() : '--:--'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STOCK ACTUALIZADO */}
      {activeTab === 'stock' && (
        <div className="bg-[#0d0d14] border border-[#1b1b24] p-6">
          <div className="mb-6">
            <h3 className="font-['Orbitron'] text-lg font-bold">Inventario & Stock en Tiempo Real</h3>
            <p className="text-xs font-mono text-[#7d7d8a] mt-1">Cualquier venta física (POS) o digital (Web) descuenta de este mismo inventario centralizado.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1b1b24] font-mono text-xs text-[#7d7d8a] uppercase tracking-wider">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Talla / Color</th>
                  <th className="p-3">Precio (CLP)</th>
                  <th className="p-3">Stock Disponible</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1b24] text-sm">
                {products.map((p) => {
                  const currentStock = p?.stock_actual ?? p?.stock ?? 0;
                  const skuCode = p?.SKU || p?.sku || 'N/A';
                  const productName = p?.nombre || p?.name || 'Sin nombre';
                  const categoryName = p?.categoria || p?.category || 'General';
                  const priceVal = p?.precio ?? p?.price ?? 0;
                  const sizeVal = p?.talla || p?.size || '-';
                  const colorVal = p?.color || '-';

                  let badgeColor = 'border-[#22c55e] text-[#22c55e] bg-[#22c55e]/10';
                  let statusText = 'Stock Óptimo';

                  if (currentStock === 0) {
                    badgeColor = 'border-red-500 text-red-400 bg-red-500/10';
                    statusText = 'Agotado';
                  } else if (currentStock <= 5) {
                    badgeColor = 'border-amber-500 text-amber-400 bg-amber-500/10';
                    statusText = 'Stock Bajo';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-[#06060a]/50 transition-colors">
                      <td className="p-3 font-mono text-xs text-[#7d7d8a]">{skuCode}</td>
                      <td className="p-3 font-medium text-[#f0ede8] flex items-center gap-3">
                        {p?.imagen ? (
                          <img
                            src={p.imagen}
                            alt={productName}
                            className="w-8 h-8 object-contain bg-[#111] rounded border border-[#222] p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="text-base">{p?.icon ?? '📦'}</span>
                        <span>{productName}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-[#a855f7]">{categoryName}</td>
                      <td className="p-3 font-mono text-xs text-[#7d7d8a]">
                        {sizeVal} | {colorVal}
                      </td>
                      <td className="p-3 font-mono">${priceVal.toLocaleString('es-CL')}</td>
                      <td className="p-3 font-mono font-bold text-lg">{currentStock} un.</td>
                      <td className="p-3">
                        <span className={`font-mono text-xs px-2.5 py-1 border inline-block ${badgeColor}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}