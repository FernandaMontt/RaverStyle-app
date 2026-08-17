import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';
import ModalOverlay from './ModalOverlay';

function AbrirCajaModal({ open, onClose, onConfirm }) {
  const [fondo, setFondo] = useState(50000);
  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-lg font-bold text-white font-display mb-4">Apertura de Turno de Caja</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(parseInt(fondo, 10) || 0);
        }}
      >
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Fondo Inicial de Caja (Efectivo)</label>
          <input
            type="number"
            required
            min={0}
            step={1000}
            value={fondo}
            onChange={(e) => setFondo(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Monto en efectivo asignado para sencillo/vuelto inicial.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Confirmar Apertura
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function ArqueoCajaModal({ open, onClose, shift, onConfirm }) {
  const esperado = shift ? shift.fondo_inicial + (shift.total_efectivo || 0) : 0;
  const [declarado, setDeclarado] = useState(esperado);
  const [obs, setObs] = useState('');

  if (!open || !shift) return null;

  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-md" glow="glow-magenta">
      <h3 className="text-lg font-bold text-white font-display mb-1">Cierre de Caja y Arqueo</h3>
      <p className="text-xs text-slate-400 mb-4">Declaración física de efectivo en gaveta.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(parseInt(declarado, 10) || 0, obs);
        }}
      >
        <div className="space-y-3 mb-5">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Fondo Inicial:</span>
              <span className="font-mono text-white">{formatCLP(shift.fondo_inicial)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ventas Efectivo:</span>
              <span className="font-mono text-emerald-400">{formatCLP(shift.total_efectivo || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800 pt-1">
              <span>Total Esperado en Gaveta:</span>
              <span className="font-mono text-cyan-400">{formatCLP(esperado)}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Monto Declarado (Conteo Físico)</label>
            <input
              type="number"
              required
              min={0}
              value={declarado}
              onChange={(e) => setDeclarado(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Observaciones</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Escriba comentarios si existen diferencias..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none h-20 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Confirmar Cierre
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

export default function CajaView() {
  const { currentUser, currentShift, state, openShift, closeShift } = useStore();
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glow-cyan">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white font-display">Estado del Turno de Caja</h2>
              {currentShift ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ABIERTA</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CERRADA</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cajero Asignado:{' '}
              <span className="text-white font-semibold">
                {currentUser.nombre} {currentUser.apellidos}
              </span>
            </p>
          </div>
          <div>
            {!currentShift ? (
              <button
                onClick={() => {
                  if (currentShift) return;
                  setOpenModal(true);
                }}
                className="py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg transition flex items-center gap-2"
              >
                <i className="fa-solid fa-key" /> Abrir Caja
              </button>
            ) : (
              <button
                onClick={() => setCloseModalOpen(true)}
                className="py-3 px-6 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs uppercase shadow-lg transition flex items-center gap-2 glow-magenta"
              >
                <i className="fa-solid fa-lock" /> Cerrar Caja (Arqueo)
              </button>
            )}
          </div>
        </div>

        {currentShift ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fondo Inicial Base</span>
              <p className="text-lg font-bold text-white font-mono mt-1">{formatCLP(currentShift.fondo_inicial)}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ventas Efectivo</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{formatCLP(currentShift.total_efectivo || 0)}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ventas Tarjetas</span>
              <p className="text-lg font-bold text-cyan-400 font-mono mt-1">{formatCLP(currentShift.total_tarjetas || 0)}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Esperado en Caja</span>
              <p className="text-lg font-bold text-purple-400 font-mono mt-1">{formatCLP(currentShift.fondo_inicial + (currentShift.total_efectivo || 0))}</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            <i className="fa-solid fa-cash-register text-4xl mb-2 text-slate-700" />
            <p className="text-sm font-semibold">No tiene una caja abierta actualmente.</p>
            <p className="text-xs">Para comenzar a realizar ventas, inicie la apertura de turno con su fondo de caja inicial.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white font-display mb-4">Historial de Turnos y Cierres de Caja</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">ID Turno</th>
                <th className="p-3">Apertura</th>
                <th className="p-3">Cierre</th>
                <th className="p-3">Fondo Base</th>
                <th className="p-3">Ventas Total</th>
                <th className="p-3">Arqueo Declarado</th>
                <th className="p-3">Diferencia</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.shifts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No hay registros de caja aún.
                  </td>
                </tr>
              ) : (
                state.shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-cyan-400 font-bold">#{s.id}</td>
                    <td className="p-3 text-slate-300">
                      {s.fecha_apertura} {s.hora_apertura}
                    </td>
                    <td className="p-3 text-slate-300">{s.fecha_cierre ? `${s.fecha_cierre} ${s.hora_cierre}` : 'En curso...'}</td>
                    <td className="p-3 font-mono">{formatCLP(s.fondo_inicial)}</td>
                    <td className="p-3 font-mono text-white font-bold">{formatCLP(s.total_ventas || 0)}</td>
                    <td className="p-3 font-mono">{s.monto_declarado_arqueo !== undefined ? formatCLP(s.monto_declarado_arqueo) : '-'}</td>
                    <td className={'p-3 font-mono font-bold ' + (s.diferencia_arqueo < 0 ? 'text-rose-400' : s.diferencia_arqueo > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                      {s.diferencia_arqueo !== undefined ? formatCLP(s.diferencia_arqueo) : '-'}
                    </td>
                    <td className="p-3">
                      <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (s.estado === 'abierta' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400')}>
                        {s.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AbrirCajaModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={(fondo) => {
          openShift(fondo);
          setOpenModal(false);
        }}
      />
      <ArqueoCajaModal
        open={closeModal}
        onClose={() => setCloseModalOpen(false)}
        shift={currentShift}
        onConfirm={(declarado, obs) => {
          closeShift(declarado, obs);
          setCloseModalOpen(false);
        }}
      />
    </div>
  );
}
