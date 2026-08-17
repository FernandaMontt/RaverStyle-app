import { useStore } from '../context/StoreContext';
import { formatDate } from '../lib/format';

export default function DevolucionesView() {
  const { currentUser, state, resolveRefund } = useStore();
  const isAdmin = currentUser.rol === 'administrador';

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white font-display mb-4">Gestión de Devoluciones y Reembolsos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">ID Solic.</th>
                <th className="p-3">Boleta Ref.</th>
                <th className="p-3">Motivo</th>
                <th className="p-3">Fecha Solicitud</th>
                <th className="p-3">Estado</th>
                {isAdmin && <th className="p-3 text-right">Aprobación Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.refunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No hay solicitudes de devolución.
                  </td>
                </tr>
              ) : (
                state.refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-cyan-400 font-bold">#DEV-{r.id}</td>
                    <td className="p-3 font-mono text-white font-bold">{r.venta_num}</td>
                    <td className="p-3 text-slate-300">{r.motivo}</td>
                    <td className="p-3 text-slate-400 font-mono">{formatDate(r.fecha_solicitud)}</td>
                    <td className="p-3">
                      <span
                        className={
                          'px-2 py-0.5 rounded text-[10px] font-bold ' +
                          (r.estado === 'aprobada' ? 'bg-emerald-500/20 text-emerald-400' : r.estado === 'rechazada' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400')
                        }
                      >
                        {r.estado.toUpperCase()}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-right space-x-2">
                        {r.estado === 'pendiente' ? (
                          <>
                            <button onClick={() => resolveRefund(r.id, 'aprobada')} className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px]">
                              Aprobar
                            </button>
                            <button onClick={() => resolveRefund(r.id, 'rechazada')} className="px-2 py-1 bg-rose-500 text-white font-bold rounded text-[11px]">
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Procesada</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
