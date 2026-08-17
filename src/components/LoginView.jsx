import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function LoginView() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    await login(email, password);
    setBusy(false);
  }

  async function quickLogin(demoEmail) {
    setBusy(true);
    await login(demoEmail, '123');
    setBusy(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#080c14] relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 glow-cyan">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 text-3xl font-display font-bold">
            R
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-wider text-white">
            RAVER <span className="text-cyan-400">CAJA POS</span>
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Sistema Punto de Venta • Ropa Urbana</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <i className="fa-solid fa-envelope" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej: cajero@raver.cl"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <i className="fa-solid fa-lock" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 tracking-wide uppercase text-sm disabled:opacity-50"
          >
            <i className="fa-solid fa-right-to-bracket" /> {busy ? 'Verificando…' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center font-semibold uppercase tracking-wider mb-3">Acceso Rápido Demo (1-Click)</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => quickLogin('cajero@raver.cl')} className="py-2 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-cyan-400 font-medium transition flex flex-col items-center gap-1">
              <i className="fa-solid fa-cash-register" />
              <span>Cajero</span>
            </button>
            <button onClick={() => quickLogin('inventario@raver.cl')} className="py-2 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-purple-400 font-medium transition flex flex-col items-center gap-1">
              <i className="fa-solid fa-boxes-stacked" />
              <span>Inventario</span>
            </button>
            <button onClick={() => quickLogin('admin@raver.cl')} className="py-2 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-emerald-400 font-medium transition flex flex-col items-center gap-1">
              <i className="fa-solid fa-user-gear" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          Clave por defecto para todos los usuarios: <span className="text-slate-300 font-mono">123</span>
        </p>
      </div>
    </div>
  );
}
