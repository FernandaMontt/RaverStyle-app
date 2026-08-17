import { useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { formatCLP } from '../lib/format';

export default function PaymentModal({ open, onClose, total, onConfirm }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState(total);

  if (!open) return null;
  const vuelto = Math.max(0, (parseInt(montoRecibido, 10) || 0) - total);

  function handleSubmit(e) {
    e.preventDefault();
    const monto = medioPago === 'efectivo' ? parseInt(montoRecibido, 10) || total : total;
    onConfirm({ medioPago, montoRecibido: monto });
  }

  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white font-display">Confirmar Cobro</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <i className="fa-solid fa-xmark text-lg" />
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center mb-5">
        <span className="text-xs uppercase text-slate-400 tracking-wider font-semibold">Total a Pagar</span>
        <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{formatCLP(total)}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Medio de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'efectivo', label: 'Efectivo', icon: 'fa-money-bill-1' },
              { value: 'tarjeta_debito', label: 'Débito', icon: 'fa-credit-card' },
              { value: 'tarjeta_credito', label: 'Crédito', icon: 'fa-credit-card' },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" name="medio_pago" value={opt.value} checked={medioPago === opt.value} onChange={() => setMedioPago(opt.value)} className="peer sr-only" />
                <div
                  className={
                    'p-3 bg-slate-950 border rounded-xl text-center transition ' +
                    (medioPago === opt.value ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800')
                  }
                >
                  <i className={`fa-solid ${opt.icon} text-lg mb-1 block`} />
                  <span className="text-xs font-bold">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {medioPago === 'efectivo' && (
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Monto Recibido (CLP)</label>
              <input
                type="number"
                required
                min={total}
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
              <span className="text-xs font-bold text-emerald-300 uppercase">Vuelto / Cambio:</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{formatCLP(vuelto)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg transition">
            Confirmar Pago
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
