import { useState, useEffect } from 'react';
import { getStats, getFeed } from '../lib/raverBridge';
import { safeGetJSON, safeSetJSON } from '../lib/safeStorage';
import { DEFAULT_PRODUCTS } from '../lib/seedData';

const PRODUCTS_KEY = 'raver_products_v1';
const INITIAL_PRODUCTS = DEFAULT_PRODUCTS;

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