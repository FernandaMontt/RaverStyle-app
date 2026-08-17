import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';
import ModalOverlay from './ModalOverlay';

function ProductFormModal({ open, onClose, product, categories, onSave }) {
  const [form, setForm] = useState(() => ({
    SKU: product?.SKU || '',
    categoria: product?.categoria || categories[0] || '',
    nombre: product?.nombre || '',
    talla: product?.talla || 'M',
    color: product?.color || 'Negro',
    precio: product?.precio ?? 22990,
    stock_actual: product?.stock_actual ?? 10,
    stock_minimo: product?.stock_minimo ?? 3,
    imagen: product?.imagen || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80',
  }));

  if (!open) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-lg">
      <h3 className="text-lg font-bold text-white font-display mb-4">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, product?.id);
        }}
      >
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">SKU (Único)</label>
            <input required value={form.SKU} onChange={(e) => set('SKU', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Categoría</label>
            <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nombre Producto</label>
          <input required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Talla</label>
            <input required value={form.talla} onChange={(e) => set('talla', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Color</label>
            <input required value={form.color} onChange={(e) => set('color', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Precio (CLP)</label>
            <input required type="number" min={100} value={form.precio} onChange={(e) => set('precio', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Stock Actual</label>
            <input required type="number" min={0} value={form.stock_actual} onChange={(e) => set('stock_actual', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Stock Mínimo Alerta</label>
            <input required type="number" min={1} value={form.stock_minimo} onChange={(e) => set('stock_minimo', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">URL Imagen</label>
          <input value={form.imagen} onChange={(e) => set('imagen', e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" />
        </div>

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

export default function ProductosView() {
  const { currentUser, state, saveProduct, toggleProductState } = useStore();
  const isAdmin = currentUser.rol === 'administrador';
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.products.filter((p) => p.nombre.toLowerCase().includes(q) || p.SKU.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }, [state.products, search]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(prod) {
    setEditing(prod);
    setFormOpen(true);
  }
  function handleSave(form, id) {
    const ok = saveProduct(form, id);
    if (ok) setFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, SKU o Categoria..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
        {isAdmin && (
          <button onClick={openNew} className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
            <i className="fa-solid fa-plus" /> Nuevo Producto
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Talla/Color</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Estado</th>
                {isAdmin && <th className="p-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-950"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/100x100/0f172a/ffffff?text=P';
                      }}
                    />
                    <div>
                      <p className="font-bold text-white">{p.nombre}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{p.descripcion}</p>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{p.SKU}</td>
                  <td className="p-3 text-slate-300">{p.categoria}</td>
                  <td className="p-3 text-slate-300 font-mono">
                    {p.talla} / {p.color}
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{formatCLP(p.precio)}</td>
                  <td className="p-3 font-mono">
                    <span className={p.stock_actual <= p.stock_minimo ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {p.stock_actual} (Mín: {p.stock_minimo})
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (p.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>{p.estado.toUpperCase()}</span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-cyan-400">
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                      <button onClick={() => toggleProductState(p.id)} title="Activar/Desactivar" className="p-1.5 text-slate-400 hover:text-rose-400">
                        <i className="fa-solid fa-power-off" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} categories={state.settings.categories || []} onSave={handleSave} />
    </div>
  );
}
