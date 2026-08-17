import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function ConfiguracionView() {
  const { state, saveSettings } = useStore();
  const [form, setForm] = useState({
    storeName: state.settings.storeName,
    rut: state.settings.rut,
    address: state.settings.address,
    taxRate: state.settings.taxRate,
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    saveSettings({ ...form, taxRate: parseInt(form.taxRate, 10) || 19 });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white font-display mb-4">Parámetros del Sistema RAVER</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nombre Tienda Flagship</label>
            <input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">RUT Empresa</label>
            <input value={form.rut} onChange={(e) => set('rut', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Dirección</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tasa Impuesto IVA (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono" />
          </div>
          <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase shadow-lg">
            Guardar Configuración
          </button>
        </form>
      </div>
    </div>
  );
}
