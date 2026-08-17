import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatDate } from '../lib/format';
import ModalOverlay from './ModalOverlay';

function AjusteStockModal({ open, onClose, products, onConfirm }) {
  const [prodId, setProdId] = useState(products[0]?.id || '');
  const [tipo, setTipo] = useState('ingreso');
  const [cantidad, setCantidad] = useState(5);
  const [obs, setObs] = useState('');

  if (!open) return null;

  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-lg font-bold text-white font-display mb-4">Ajuste Manual de Inventario</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const ok = onConfirm({ productId: parseInt(prodId, 10), tipo, cantidad: parseInt(cantidad, 10) || 0, observaciones: obs });
          if (ok) onClose();
        }}
      >
        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Producto</label>
          <select required value={prodId} onChange={(e) => setProdId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (SKU: {p.SKU} | Actual: {p.stock_actual})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tipo Operación</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="ingreso">Ingreso (+)</option>
              <option value="ajuste">Salida / Ajuste (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Cantidad</label>
            <input required type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Motivo / Observación</label>
          <textarea required value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Motivo de la modificación..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none h-20 resize-none" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Aplicar Ajuste
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

export default function InventarioView() {
  const { state, adjustStock } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white font-display">Ajustes e Historial de Inventario</h2>
          <p className="text-xs text-slate-400">Control de entradas, salidas y auditoría de existencias.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="py-2.5 px-4 bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
          <i className="fa-solid fa-sliders" /> Ajustar Stock
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Tipo Movimiento</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Stock Ant. → Nuevo</th>
                <th className="p-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Sin movimientos registrados.
                  </td>
                </tr>
              ) : (
                state.movements.map((m) => {
                  const prod = state.products.find((p) => p.id === m.producto_id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-slate-400">{formatDate(m.fecha)}</td>
                      <td className="p-3 font-bold text-white">{prod ? prod.nombre : 'Producto ID ' + m.producto_id}</td>
                      <td className="p-3">
                        <span
                          className={
                            'px-2 py-0.5 rounded text-[10px] font-bold ' +
                            (m.tipo === 'venta' ? 'bg-cyan-500/20 text-cyan-400' : m.tipo === 'devolución' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400')
                          }
                        >
                          {m.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className={'p-3 font-mono font-bold ' + (m.cantidad > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {m.cantidad > 0 ? '+' : ''}
                        {m.cantidad}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {m.stock_anterior} → {m.stock_nuevo}
                      </td>
                      <td className="p-3 text-slate-400">{m.observaciones}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AjusteStockModal open={modalOpen} onClose={() => setModalOpen(false)} products={state.products} onConfirm={adjustStock} />
    </div>
  );
}
