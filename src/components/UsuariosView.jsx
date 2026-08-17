import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ROLES } from '../lib/seedData';
import ModalOverlay from './ModalOverlay';

function UserModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', rol: 'cajero', password: '123' });
  if (!open) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-lg font-bold text-white font-display mb-4">Nuevo Usuario</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await onCreate(form);
          if (ok) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nombre</label>
            <input required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Apellidos</label>
            <input required value={form.apellidos} onChange={(e) => set('apellidos', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Email</label>
          <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Rol</label>
          <select value={form.rol} onChange={(e) => set('rol', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Contraseña Inicial</label>
          <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Crear Usuario
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function ResetPasswordModal({ open, onClose, onConfirm }) {
  const [password, setPassword] = useState('');
  if (!open) return null;
  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-sm">
      <h3 className="text-base font-bold text-white font-display mb-4">Restablecer Contraseña</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onConfirm(password);
          onClose();
        }}
      >
        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nueva contraseña</label>
        <input required type="password" minLength={3} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none mb-5" />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg">
            Guardar
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

export default function UsuariosView() {
  const { state, createUser, unlockUser, resetUserPassword } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <h2 className="text-base font-bold text-white font-display">Administración de Usuarios y Roles</h2>
        <button onClick={() => setModalOpen(true)} className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2">
          <i className="fa-solid fa-user-plus" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-white">
                    {u.nombre} {u.apellidos}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{u.email}</td>
                  <td className="p-3 font-mono text-cyan-400 uppercase">{u.rol.replace('_', ' ')}</td>
                  <td className="p-3">
                    <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (u.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>{u.estado.toUpperCase()}</span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {u.estado === 'bloqueado' && (
                      <button onClick={() => unlockUser(u.id)} className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10px]">
                        Desbloquear
                      </button>
                    )}
                    <button onClick={() => setResetTarget(u.id)} className="text-slate-400 hover:text-cyan-400">
                      <i className="fa-solid fa-key" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={createUser} />
      <ResetPasswordModal open={Boolean(resetTarget)} onClose={() => setResetTarget(null)} onConfirm={(pwd) => resetUserPassword(resetTarget, pwd)} />
    </div>
  );
}
