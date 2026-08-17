import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';
import ModalOverlay from './ModalOverlay';

function RequestRefundModal({ open, onClose, saleNum, onSend }) {
  const [motivo, setMotivo] = useState('');
  if (!open) return null;
  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-lg font-bold text-white font-display mb-2">Solicitar Devolución</h3>
      <p className="text-xs text-slate-400 mb-4">
        Boleta Ref: <span className="text-cyan-400 font-mono font-bold">{saleNum}</span>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(motivo);
        }}
      >
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Motivo de la Devolución</label>
          <textarea
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="ej: Talla incorrecta, cambio de producto..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none h-24 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Enviar Solicitud
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

export default function VentasView() {
  const { state, requestRefund } = useStore();
  const [refundTarget, setRefundTarget] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white font-display mb-4">Registro Histórico de Ventas (Boletas)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">N° Boleta</th>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Cajero</th>
                <th className="p-3">Medio Pago</th>
                <th className="p-3">Total Venta</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No se han registrado ventas.
                  </td>
                </tr>
              ) : (
                state.sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{s.numero_venta}</td>
                    <td className="p-3 text-slate-300">
                      {s.fecha} {s.hora}
                    </td>
                    <td className="p-3 text-slate-300">{s.cajero_nombre}</td>
                    <td className="p-3 font-mono uppercase text-slate-400">{s.medio_pago.replace('_', ' ')}</td>
                    <td className="p-3 font-mono font-bold text-white">{formatCLP(s.total)}</td>
                    <td className="p-3">
                      <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (s.estado === 'confirmada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>{s.estado.toUpperCase()}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setRefundTarget(s.numero_venta)} className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-semibold">
                        Solicitar Devolución
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestRefundModal
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        saleNum={refundTarget}
        onSend={(motivo) => {
          requestRefund(refundTarget, motivo);
          setRefundTarget(null);
        }}
      />
    </div>
  );
}
